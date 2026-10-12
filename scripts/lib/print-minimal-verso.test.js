// The minimal XSLT theme prints as it reads, one column down as many sheets as
// it takes — and then, like every printable version of the CV, gives the
// timeline and the references a last sheet of their own, turned to landscape.
//
// Printed with a real browser and read back with poppler: which way a sheet is
// turned is not something the stylesheet's source can prove.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');
const { orientations } = require('./print-orientation');

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CANDIDATES.find((c) => fs.existsSync(c));
const textOf = (pdf, page) =>
  execFileSync('pdftotext', ['-f', String(page), '-l', String(page), pdf, '-'], {
    encoding: 'utf8',
  });

// How light a sheet is, 0 (all ink) to 255 (blank), as poppler paints it. A
// plain PPM is a three-line header and then the bytes; a sheet of text on
// white stays near the top of that scale, one set on a dark page near the
// bottom.
function lightnessOf(pdf, page) {
  const ppm = execFileSync('pdftoppm', ['-f', String(page), '-l', String(page), '-r', '8', pdf], {
    maxBuffer: 1 << 24,
  });
  const header = /^P6\s+\d+\s+\d+\s+\d+\s/.exec(ppm.toString('latin1', 0, 40));
  if (!header) throw new Error(`pdftoppm did not paint page ${page} of ${pdf}`);
  const bytes = ppm.subarray(header[0].length);
  return bytes.reduce((sum, byte) => sum + byte, 0) / bytes.length;
}

let sheets;
test.before(async () => {
  if (!chrome) {
    if (process.env.CI)
      throw new Error('no Chrome on this runner, so the minimal theme went unprinted');
    return;
  }
  const server = await serve();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-print-minimal-'));
  try {
    const pdf = path.join(out, 'minimal.pdf');
    await promisify(execFile)(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${path.join(out, 'profile')}`,
        '--virtual-time-budget=6000',
        // As a reader in dark mode, on any machine: the theme follows it.
        '--force-dark-mode',
        '--no-pdf-header-footer',
        `--print-to-pdf=${pdf}`,
        `http://127.0.0.1:${server.address().port}/__xslt-minimal/en`,
      ],
      { timeout: 120000 },
    );
    const turned = orientations(pdf);
    sheets = {
      turned,
      verso: textOf(pdf, turned.length),
      paper: turned.map((_, i) => lightnessOf(pdf, i + 1)),
      before: turned.slice(0, -1).map((_, i) => textOf(pdf, i + 1)),
    };
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});
const check = (name, fn) =>
  test(name, (t) =>
    sheets ? fn() : t.skip('no Chrome found — set CHROME_PATH to check the print here'));

check('the last sheet is a landscape one, and the only one', () => {
  assert.equal(sheets.turned.at(-1), 'landscape');
  assert.ok(sheets.turned.slice(0, -1).every((way) => way === 'portrait'));
});

check('the last sheet opens on the timeline, the references under it', () => {
  const timeline = sheets.verso.search(/Timeline/i);
  const references = sheets.verso.search(/References/i);
  assert.ok(timeline >= 0 && references > timeline, 'timeline, then references');
});

check('the timeline and the references are printed once, on that sheet', () => {
  for (const text of sheets.before) {
    assert.doesNotMatch(text, /^(Timeline|References)$/im);
  }
});

// A reader in dark mode still prints on white: the dark palette is for a
// screen, and on paper it is a sheet of ink. The print is made as that reader.
check('every sheet is printed on white, whatever the theme on screen', () => {
  for (const [i, lightness] of sheets.paper.entries()) {
    assert.ok(lightness > 200, `sheet ${i + 1} is mostly ink (lightness ${Math.round(lightness)})`);
  }
});

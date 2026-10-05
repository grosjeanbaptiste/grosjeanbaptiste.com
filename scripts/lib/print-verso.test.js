// The verso of the printed page mirrors the verso of the LaTeX CV: the
// timeline at the top, the references under it in three columns. Volunteering
// used to fill a narrow column of its own beside the references; the roles now
// show in the timeline, inside the degree of their school.
//
// Printed with a real browser and read back with poppler, positions included:
// "to the right of" and "in three columns" are not things the source can say.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');

const ROOT = path.resolve(__dirname, '../..');
const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CANDIDATES.find((c) => fs.existsSync(c));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// Every word of a page with where it sits, from `pdftotext -bbox`.
function wordsOf(pdf, page) {
  const xml = execFileSync(
    'pdftotext',
    ['-bbox', '-f', String(page), '-l', String(page), pdf, '-'],
    {
      encoding: 'utf8',
      maxBuffer: 1 << 26,
    },
  );
  return [...xml.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)"[^>]*>([^<]*)<\/word>/g)].map(
    (m) => ({ x: Number(m[1]), y: Number(m[2]), text: m[3] }),
  );
}

let sheets;
test.before(async () => {
  if (!chrome) {
    if (process.env.CI)
      throw new Error('no Chrome on this runner, so the printed verso went unchecked');
    return;
  }
  const server = await serve();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-print-verso-'));
  try {
    const pdf = path.join(out, 'fr.pdf');
    await promisify(execFile)(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        `--user-data-dir=${path.join(out, 'profile')}`,
        '--virtual-time-budget=6000',
        '--no-pdf-header-footer',
        `--print-to-pdf=${pdf}`,
        `http://127.0.0.1:${server.address().port}/fr/`,
      ],
      { timeout: 120000 },
    );
    const pages = Number(
      /^Pages:\s+(\d+)/m.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))[1],
    );
    sheets = { pages, recto: wordsOf(pdf, 1), verso: wordsOf(pdf, 2) };
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});
const check = (name, fn) =>
  test(name, (t) =>
    sheets ? fn() : t.skip('no Chrome found — set CHROME_PATH to check the print here'));

// The first word of the verso that reads `text`, or a failure naming it.
function word(text, { after = -1 } = {}) {
  const found = sheets.verso.find((w) => w.text === text && w.y > after);
  assert.ok(found, `"${text}" is not on the verso`);
  return found;
}

check('the printed page is still two sheets', () => assert.equal(sheets.pages, 2));

check('the timeline opens the verso, the references come under it', () => {
  assert.ok(word('CHRONOLOGIE').y < word('RÉFÉRENCES').y);
});

check('the verso carries no section of degrees or volunteering', () => {
  assert.ok(!sheets.verso.some((w) => w.text === 'ÉDUCATION' || w.text === 'BÉNÉVOLAT'));
});

check('the roles show in the timeline, inside their degree', () => {
  assert.ok(word('TandeMons').y < word('RÉFÉRENCES').y);
});

check('the references are set in three columns', () => {
  const references = word('RÉFÉRENCES');
  // Who speaks opens each reference, flush left in its column.
  const names = ['Waseem', 'Tino', 'Emiel', 'Steven', 'Tjörven', 'Michael'].map((name) =>
    word(name, { after: references.y }),
  );
  const columns = new Set(names.map((n) => Math.round(n.x / 10)));
  assert.equal(columns.size, 3, `the six references start in ${columns.size} column(s)`);
});

test('the print script builds the verso from the timeline and the references', () => {
  const script = read('js/print-layout.js');
  assert.match(script, /print-verso/);
  assert.doesNotMatch(script, /print-volunteer|print-education/);
});

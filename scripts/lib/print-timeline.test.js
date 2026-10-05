// The timeline is part of the page, so it is part of the printed sheet. The
// LaTeX CV the sheet follows has none — a deliberate difference — and the
// recto has no room for it: js/print-layout.js moves it to the top of the
// verso, above the volunteering and the references, where half a page was free. Still two
// sheets: print-fit*.test.js count them in Chrome and Firefox. Here a real
// Chrome prints the page and poppler reads which sheet the timeline is on.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const { promisify } = require('node:util');
const { ROOT } = require('./config');
const { serve } = require('./print-fit-harness');
const I18N = require('./i18n');

const CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CANDIDATES.find((c) => fs.existsSync(c));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

let sheets;
test.before(async () => {
  if (!chrome) {
    if (process.env.CI)
      throw new Error('no Chrome on this runner, so the printed timeline went unchecked');
    return;
  }
  const server = await serve();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-print-timeline-'));
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
    const text = (page) =>
      execFileSync('pdftotext', ['-f', String(page), '-l', String(page), pdf, '-'], {
        encoding: 'utf8',
      });
    const pages = Number(
      /^Pages:\s+(\d+)/m.exec(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }))[1],
    );
    sheets = { pages, recto: text(1), verso: text(2) };
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});
const check = (name, fn) =>
  test(name, (t) =>
    sheets ? fn() : t.skip('no Chrome found — set CHROME_PATH to check the print here'));
const title = I18N.fr.timelineTitle.toUpperCase();

check('the printed page is still two sheets', () => assert.equal(sheets.pages, 2));
check('the verso carries the timeline, under its title', () =>
  assert.ok(sheets.verso.toUpperCase().includes(title)),
);
// It opens the verso: before the references, which the page titles too.
check('the timeline comes first on the verso', () => {
  const up = sheets.verso.toUpperCase();
  assert.ok(
    up.indexOf(title) < up.indexOf(I18N.fr.references.toUpperCase()),
    'the references come first',
  );
});
check('the verso carries the years of the timeline', () =>
  assert.match(sheets.verso, /2023[\s\S]*2024[\s\S]*2025/),
);
check('the verso names the entries on their bars', () =>
  assert.match(sheets.verso, /UMons[\s\S]*Acteble|Acteble[\s\S]*UMons/),
);
check('the recto does not carry the timeline', () =>
  assert.ok(!sheets.recto.toUpperCase().includes(title)),
);
check('the zoom buttons are not printed', () => assert.doesNotMatch(sheets.verso, /\b5 ans\b/));

test('the print script moves the timeline onto the verso', () => {
  assert.match(read('js/print-layout.js'), /getElementById\('timeline'\)/);
});

// Without JavaScript nothing moves the timeline: left in the recto's column it
// would push the CV onto a third sheet, so it only prints once on the verso.
test('the timeline prints on the verso only', () => {
  assert.match(
    read('css/timeline.css'),
    /@media print\s*\{[^}]*#timeline\s*\{[^}]*display:\s*none/,
  );
  assert.match(read('css/print-verso.css'), /#print-verso\s+#timeline\s*\{[^}]*display:\s*block/);
});

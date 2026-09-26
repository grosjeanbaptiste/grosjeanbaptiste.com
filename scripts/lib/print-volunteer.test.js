// The printed HTML has to carry the volunteering, because the LaTeX PDF does.
//
// The two were consistent while NEITHER showed it. Then the PDF gained a
// Volunteer section on the verso (scripts/lib/pdf/sections/volunteer.js) and
// the printed page did not follow: the roles live inside the education
// entries, and print-type.css hides those wholesale to mirror the fit plan's
// education_in_body: false. Measured before this test existed: 0 of 3 roles
// reached Chrome's print output.
//
// Asserted by printing with a real browser, like print-fit.test.js — the CSS
// says nothing about what survives the cascade plus print-layout.js's node
// moves, and a source-level check would have passed throughout the outage.
//
// Two languages, not six: enough to catch the regression without paying for
// four more browser launches, the same trade the Firefox fit check makes.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, execFileSync } = require('node:child_process');
const { promisify } = require('node:util');
const { serve } = require('./print-fit-harness');

const run = promisify(execFile);

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = process.env.CHROME_PATH || CHROME_CANDIDATES.find((c) => fs.existsSync(c));

// One role per host institution, in the page's own language.
const ROLES = {
  '': ['Buddy TandeMons', 'Tutor'],
  'fr/': ['Buddy TandeMons', 'Tuteur'],
};

test('the printed page carries the volunteering the PDF prints', async (t) => {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so print parity went unchecked');
    t.skip('no Chrome found — set CHROME_PATH to enforce print parity here');
    return;
  }
  const server = await serve();
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-volunteer-'));
  try {
    for (const [page, roles] of Object.entries(ROLES)) {
      const pdf = path.join(out, `${page.replace('/', '') || 'en'}.pdf`);
      // execFile, not execFileSync: the server runs in this process, and a
      // synchronous spawn blocks the loop so Chrome is never answered.
      await run(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          `--user-data-dir=${path.join(out, `profile-${page.replace('/', '') || 'en'}`)}`,
          '--virtual-time-budget=6000',
          '--no-pdf-header-footer',
          `--print-to-pdf=${pdf}`,
          `http://127.0.0.1:${port}/${page}`,
        ],
        { timeout: 60000 },
      );
      const text = execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8', maxBuffer: 1 << 24 });
      const missing = roles.filter((r) => !text.includes(r));
      assert.deepEqual(missing, [], `/${page} prints without: ${missing.join(', ')}`);
    }
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true });
  }
});

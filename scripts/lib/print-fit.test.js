// The CV is a two-page document: recto, then references on the verso. The LaTeX
// build guarantees that by trying successively tighter fit plans and refusing to
// ship if none lands on two pages. The printable HTML view has no such loop, so
// the guarantee has to be measured — and measured the only way that is not a
// guess: print the page with a real browser and count the pages.
//
// Without this, the failure is silent. One more work entry, or a longer summary,
// and the recto spills onto a second sheet; nothing in the markup, the CSS or
// the other tests would say so, and the CV quietly becomes a three-page document.
//
// Two engines, deliberately. Chrome and Firefox paginate the same stylesheet
// differently — Firefox will not fragment the two-column block across sheets —
// and a version of this test that knew only Chrome reported two pages while the
// site actually printed four in Firefox. Chrome covers all six languages;
// Firefox checks one, which is enough to catch an engine-level regression
// without paying for six more browser launches.
//
// When a browser cannot be found the test skips loudly rather than passing, so
// a machine without one is not mistaken for a pass. In CI it fails instead: a
// runner that quietly skips this check would turn the whole guarantee into a
// green tick that verified nothing.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { serve, countPages, EXPECTED_PAGES } = require('./print-fit-harness');
const { printedWithRetry } = require('./print-fit-retry');

const run = promisify(execFile);

const PAGES = ['', 'fr/', 'nl/', 'es/', 'de/', 'zh/'];

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

// An explicit CHROME_PATH is an instruction, not a hint: if it points nowhere,
// say so instead of quietly testing some other browser the caller did not ask
// for — that silent fallback is how a deliberate override goes unnoticed.
function findChrome() {
  const explicit = process.env.CHROME_PATH;
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      throw new Error(`CHROME_PATH points at a missing binary: ${explicit}`);
    }
    return explicit;
  }
  return CHROME_CANDIDATES.find((c) => fs.existsSync(c));
}

const chrome = findChrome();

// One launch. Reports what is missing rather than throwing it, so the retry can
// tell a starved machine from a layout regression — a rejection from Chrome
// itself (a 60s kill, a non-zero exit) belongs to the same resource class and
// travels back as a message too, intact, for the final report to name.
async function printOnce(bin, { pdf, profile, url }) {
  fs.rmSync(pdf, { force: true });
  // execFile, not spawnSync: the server lives in this process, and a
  // synchronous spawn would block the event loop so it could never answer
  // Chrome — the run would deadlock until the timeout.
  const crashed = await run(
    bin,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${profile}`,
      '--virtual-time-budget=6000',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdf}`,
      url,
    ],
    { timeout: 60000 },
  ).then(
    () => null,
    (err) => `Chrome failed to print — ${err.message}`,
  );
  if (crashed) return crashed;
  return fs.existsSync(pdf) ? null : 'Chrome produced no PDF';
}

test('the printed CV is two pages in every language', async (t) => {
  if (!chrome) {
    if (process.env.CI) {
      throw new Error(
        'no Chrome on this runner, so the two-page fit went unchecked — install one or set CHROME_PATH',
      );
    }
    t.skip('no Chrome found — set CHROME_PATH to enforce the two-page fit here');
    return;
  }
  const server = await serve();
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-print-'));
  try {
    for (const page of PAGES) {
      const name = page.replace('/', '') || 'en';
      const pdf = path.join(out, `${name}.pdf`);
      // A browser that produced nothing gets one more launch and says so; the
      // page count below is never retried. See print-fit-retry.js.
      await printedWithRetry(`/${page}`, (attempt) =>
        printOnce(chrome, {
          pdf,
          // A fresh profile per launch. Sharing the developer's contends with
          // their running Chrome; sharing one across launches contends with the
          // previous one, whose singleton lock can outlive the process and make
          // the next launch wait indefinitely — including the retry's.
          profile: path.join(out, `profile-${name}-${attempt}`),
          url: `http://127.0.0.1:${port}/${page}`,
        }),
      );
      const pages = countPages(pdf);
      assert.equal(
        pages,
        EXPECTED_PAGES,
        `/${page}: the printed CV is ${pages} pages, not ${EXPECTED_PAGES} — the recto has spilled`,
      );
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});

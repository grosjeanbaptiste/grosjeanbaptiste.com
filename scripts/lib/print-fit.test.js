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
// Needs Chrome. Locally, when it cannot be found the test skips loudly rather
// than passing, so a machine without a browser is not mistaken for a pass. In
// CI it fails instead: a runner that quietly skips this check would turn the
// whole guarantee into a green tick that verified nothing.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const run = promisify(execFile);

const ROOT = path.resolve(__dirname, '../..');
const PAGES = ['', 'fr/', 'nl/', 'es/', 'de/', 'zh/'];
const EXPECTED_PAGES = 2;

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

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
};

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, rel);
    if (rel.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// /Type /Page marks a page object; /Type /Pages is the tree root and the \b
// keeps it out. Cheaper than shelling out to pdfinfo, which is not always there.
function countPages(pdf) {
  const bytes = fs.readFileSync(pdf, 'latin1');
  return (bytes.match(/\/Type\s*\/Page\b/g) || []).length;
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
      const pdf = path.join(out, `${page.replace('/', '') || 'en'}.pdf`);
      // execFile, not spawnSync: the server lives in this process, and a
      // synchronous spawn would block the event loop so it could never answer
      // Chrome — the run would deadlock until the timeout.
      await run(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          // A fresh profile per language. Sharing the developer's contends with
          // their running Chrome; sharing one across the six launches contends
          // with the previous launch, whose singleton lock can outlive the
          // process and make the next one wait indefinitely.
          `--user-data-dir=${path.join(out, `profile-${page.replace('/', '') || 'en'}`)}`,
          '--virtual-time-budget=6000',
          '--no-pdf-header-footer',
          `--print-to-pdf=${pdf}`,
          `http://127.0.0.1:${port}/${page}`,
        ],
        { timeout: 60000 },
      ).catch((err) => {
        throw new Error(`/${page}: Chrome failed to print — ${err.message}`);
      });
      assert.ok(fs.existsSync(pdf), `/${page}: Chrome produced no PDF`);
      assert.equal(
        countPages(pdf),
        EXPECTED_PAGES,
        `/${page}: the printed CV is not ${EXPECTED_PAGES} pages — the recto has spilled`,
      );
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});

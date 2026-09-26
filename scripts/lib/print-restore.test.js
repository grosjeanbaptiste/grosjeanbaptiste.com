// js/print-layout.js rearranges the page for the print and must put it back
// exactly. Its own test file names that failure mode — "it moves nodes without
// restoring them" — but checks it only by reading the script's source, which
// cannot see what the DOM actually ends up as.
//
// It was not putting it back. prepare() swaps in the PDF's clipped wording via
// textContent, and restore() writes back the textContent it saved — so the one
// education summary containing a <br> was flattened by printing and stayed
// flattened until reload. Nothing failed; the page just quietly lost a line
// break, on screen, after the visitor printed.
//
// So this measures it: fire the print lifecycle in a real browser and diff the
// DOM. The probe is injected into <head> on purpose — from <body> it would
// find its own source inside document.body.innerHTML and diff the page against
// a string containing itself.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
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

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const before = document.body.innerHTML;
  dispatchEvent(new Event('beforeprint'));
  const during = document.body.innerHTML;
  dispatchEvent(new Event('afterprint'));
  const after = document.body.innerHTML;
  let at = 0;
  while (at < before.length && at < after.length && before[at] === after[at]) at++;
  document.documentElement.setAttribute('data-moved', String(during !== before));
  document.documentElement.setAttribute('data-restored', String(after === before));
  document.documentElement.setAttribute(
    'data-diff',
    after === before ? '' : JSON.stringify(after.slice(Math.max(0, at - 60), at + 60)),
  );
}, 900));
</script>`;

const attr = (dom, name) => (dom.match(new RegExp(`${name}="([^"]*)"`)) || [])[1];

test('printing leaves the page exactly as it found it', async (t) => {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so the restore went unchecked');
    t.skip('no Chrome found — set CHROME_PATH to enforce the print restore here');
    return;
  }
  const server = await serve(PROBE);
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-restore-'));
  try {
    for (const page of ['', 'fr/']) {
      const { stdout } = await run(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          `--user-data-dir=${path.join(out, `profile-${page.replace('/', '') || 'en'}`)}`,
          '--virtual-time-budget=6000',
          '--dump-dom',
          `http://127.0.0.1:${port}/__probe/${page}`,
        ],
        { timeout: 60000, maxBuffer: 1 << 28 },
      );
      // Without this the test could pass on a page where the script never ran.
      assert.equal(attr(stdout, 'data-moved'), 'true', `/${page}: nothing was rearranged at all`);
      assert.equal(
        attr(stdout, 'data-restored'),
        'true',
        `/${page} is left altered after printing, from: ${attr(stdout, 'data-diff')}`,
      );
    }
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true });
  }
});

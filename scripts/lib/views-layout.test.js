// The views bar sits above the classic site's fixed nav, which moved down by
// its height. Everything placed against the nav had to move with it — and the
// download / print cluster did not: fixed at `top: 5rem`, it ended up under
// the nav, hidden, on desktop. The anchor scroll had the same blind spot.
//
// Overlaps only exist in a laid-out page, so this asks a real browser: at the
// centre of every button, is the topmost element that button? After following
// a section link, does the section start below the nav?

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
  const covered = [...document.querySelectorAll('.views-bar-link, .cv-download-button, .cv-print-button')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !top || !el.contains(top);
    })
    .map((el) => el.className + ': ' + el.textContent.trim());
  document.documentElement.setAttribute('data-covered', JSON.stringify(covered));
  // Where the click asks to scroll, without waiting for a smooth scroll that a
  // headless clock may never advance.
  let requested = null;
  window.scrollTo = (options) => { requested = typeof options === 'object' ? options.top : options; };
  document.querySelector('nav a[href="#experience"]').click();
  const nav = document.querySelector('nav:not(.views-bar)').getBoundingClientRect();
  const sectionTop = document.querySelector('#experience').getBoundingClientRect().top + scrollY;
  const gap = requested === null ? NaN : sectionTop - requested - nav.bottom;
  document.documentElement.setAttribute('data-anchor-gap', String(Math.round(gap)));
}, 900));
</script>`;

const attr = (dom, name) => (dom.match(new RegExp(`${name}="([^"]*)"`)) || [])[1];
const decodeAttr = (s) => (s || '').replaceAll('&quot;', '"').replaceAll('&amp;', '&');

test('on a desktop screen nothing covers the views bar or the CV actions', async (t) => {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so the layout went unchecked');
    t.skip('no Chrome found — set CHROME_PATH to check the layout here');
    return;
  }
  const server = await serve(PROBE);
  const { port } = server.address();
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-layout-'));
  try {
    for (const page of ['', 'fr/']) {
      const { stdout } = await run(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--window-size=1280,900',
          `--user-data-dir=${path.join(out, `profile-${page.replace('/', '') || 'en'}`)}`,
          '--virtual-time-budget=8000',
          '--dump-dom',
          `http://127.0.0.1:${port}/__probe/${page}`,
        ],
        { timeout: 60000, maxBuffer: 1 << 28 },
      );
      const covered = attr(stdout, 'data-covered');
      assert.ok(covered, `/${page}: the probe never ran`);
      assert.deepEqual(JSON.parse(decodeAttr(covered)), [], `/${page}: covered buttons`);
      const gap = Number(attr(stdout, 'data-anchor-gap'));
      assert.ok(gap >= 0, `/${page}: the section would start ${-gap}px under the nav (gap ${gap})`);
    }
  } finally {
    server.close();
    fs.rmSync(out, { recursive: true, force: true });
  }
});

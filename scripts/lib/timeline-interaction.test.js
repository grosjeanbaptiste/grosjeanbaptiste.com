// js/timeline.js on the classic page, in a real browser: the zoom, the arrow
// keys, the preview and the bar of the entry on screen only exist once the
// script has run against a laid-out page. One Chrome run, one probe; each test
// reads one thing the probe saw.
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
  const $ = (s, root = document) => root.querySelector(s);
  const grid = $('.tl-grid'), scroller = $('.tl-scroll'), zoom = $('.tl-zoom');
  const seen = { zoomShown: !zoom.hidden, pressed: $('[aria-pressed="true"]', zoom)?.dataset.years };
  // The years the frame shows at a zoom: the part of the time axis in view,
  // the lane titles' column apart.
  const label = $('.tl-lane-label').getBoundingClientRect().width;
  const shownAt = (years) => {
    $('button[data-years="' + years + '"]', zoom).click();
    const track = grid.getBoundingClientRect().width - label;
    return ((scroller.clientWidth - label) / track) * Number(grid.dataset.months) / 12;
  };
  seen.twoYears = shownAt('2');
  seen.fiveYears = shownAt('5');
  seen.widerThanFrame = grid.scrollWidth > scroller.clientWidth;
  seen.scrolledToToday = Math.abs(scroller.scrollLeft + scroller.clientWidth - scroller.scrollWidth) < 2;
  // The zoom itself: the timeline is taller than the window can centre.
  zoom.scrollIntoView({ block: 'center' });
  const button = $('button[data-years="all"]', zoom).getBoundingClientRect();
  seen.zoomReachable = zoom.contains(document.elementFromPoint(button.left + button.width / 2, button.top + button.height / 2));
  $('button[data-years="all"]', zoom).click();
  seen.allStretch = grid.style.getPropertyValue('--stretch');
  seen.allFits = Math.abs(grid.getBoundingClientRect().width - scroller.clientWidth) < 2;
  const lane = [...document.querySelectorAll('.tl-lane[data-kind="work"] .tl-bar')].sort((a, b) => a.offsetLeft - b.offsetLeft);
  lane[0].focus();
  seen.preview = $('#tl-preview')?.textContent.includes(lane[0].dataset.name);
  lane[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  seen.arrowMoved = document.activeElement === lane[1];
  // A real click: nav.js takes it over to scroll smoothly and leaves the URL
  // alone, so nothing may rely on :target.
  const link = $('a.tl-bar[href="#project-remi"]');
  link.click();
  setTimeout(() => {
    seen.current = link.getAttribute('aria-current');
    seen.shown = document.querySelector('.tl-shown')?.textContent.includes('Remi') ?? false;
    seen.shownCount = document.querySelectorAll('.tl-shown').length;
    seen.hash = location.hash;
    document.documentElement.setAttribute('data-timeline', JSON.stringify(seen));
  }, 100);
}, 900));
</script>`;

let seen;
test.before(async () => {
  if (!chrome) {
    if (process.env.CI) throw new Error('no Chrome on this runner, so the timeline went unchecked');
    return;
  }
  const server = await serve(PROBE);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-timeline-'));
  try {
    const { stdout } = await run(
      chrome,
      [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,900',
        `--user-data-dir=${out}`,
        '--virtual-time-budget=8000',
        '--dump-dom',
        `http://127.0.0.1:${server.address().port}/__probe/fr/`,
      ],
      { timeout: 90000, maxBuffer: 1 << 28 },
    );
    const raw = (stdout.match(/data-timeline="([^"]*)"/) || [])[1];
    assert.ok(raw, 'the probe never ran');
    seen = JSON.parse(raw.replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
  } finally {
    server.close();
    // A Chrome killed by the timeout may still be writing its profile: retry,
    // so a failed clean-up never hides the error that matters.
    fs.rmSync(out, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  }
});

const check = (name, fn) =>
  test(name, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the timeline here');
    fn();
  });

check('the script reveals the zoom', () => assert.equal(seen.zoomShown, true));
check('the timeline opens on five years', () => assert.equal(seen.pressed, '5'));
// They showed 1.75 and 4.5: the zoom sized the whole grid, lane titles included,
// to the frame, so the titles' column ate into the years on show.
check('"2 years" shows the last two years, not less', () =>
  assert.ok(Math.abs(seen.twoYears - 2) < 0.03, `it shows ${seen.twoYears.toFixed(2)} years`),
);
check('"5 years" shows the last five years, not less', () =>
  assert.ok(Math.abs(seen.fiveYears - 5) < 0.05, `it shows ${seen.fiveYears.toFixed(2)} years`),
);
check('five years draw the career wider than its frame', () =>
  assert.equal(seen.widerThanFrame, true),
);
check('a zoomed timeline opens on today', () => assert.equal(seen.scrolledToToday, true));
check('nothing covers the zoom', () => assert.equal(seen.zoomReachable, true));
check('"all" fits the whole career in the frame', () =>
  assert.deepEqual([seen.allStretch, seen.allFits], ['1', true]),
);
check('focusing a bar shows what it stands for', () => assert.equal(seen.preview, true));
check('the right arrow goes to the next bar of the lane', () =>
  assert.equal(seen.arrowMoved, true),
);
check('a clicked bar is marked as the one on screen', () => assert.equal(seen.current, 'true'));
check('the entry a bar led to is set apart, alone', () =>
  assert.deepEqual([seen.shown, seen.shownCount], [true, 1]),
);
check('the URL names the entry, so the place can be shared', () =>
  assert.equal(seen.hash, '#project-remi'),
);

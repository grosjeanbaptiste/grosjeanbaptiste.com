// The rich XSLT theme on a phone (a 390-wide window), in a real browser: the
// identity stays small and the About comes before the contact list, the
// toolbar's second bar is one row, and a bar the timeline had to cut still
// leads to its entry. Sizes are read in rem, the root font size being the
// unit the stylesheets use.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const box = (s) => $(s).getBoundingClientRect();
  const seen = { width: innerWidth };
  seen.photoRem = box('#profile-picture').height / rem;
  seen.nameTop = box('.sidebar h1').top;
  seen.aboutTop = box('#about').top;
  seen.contactTop = box('.sidebar a[href^="mailto:"]').top;
  const rest = [...document.querySelectorAll('.toolbar-rest a, .toolbar-rest button')]
    .filter((e) => e.getClientRects().length);
  seen.restRows = new Set(rest.map((e) => Math.round(e.getBoundingClientRect().top / rem))).size; // a link and a button of one row differ by a pixel
  seen.restItems = rest.map((e) => [e.textContent.trim().slice(0, 12), Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().top)]);
  seen.restOverflow = document.documentElement.scrollWidth > innerWidth;
  seen.cut = [...document.querySelectorAll('a.tl-bar')]
    .filter((a) => a.scrollWidth > a.clientWidth + 1 || a.querySelector('span')?.scrollWidth > a.clientWidth)
    .map((a) => ({ href: a.getAttribute('href'), target: !!document.getElementById((a.getAttribute('href') || '').slice(1)), name: a.getAttribute('aria-label') || a.textContent.trim() }));
  seen.downloads = [...document.querySelectorAll('.toolbar-rest a.download')]
    .filter((a) => a.checkVisibility())
    .map((a) => ({ title: a.title, mark: getComputedStyle(a, '::after').content }));
  const grid = $('#timeline .tl-grid');
  seen.months = Number(grid.dataset.months);
  seen.stretch = Number(getComputedStyle(grid).getPropertyValue('--stretch'));
  seen.pdfs = [...document.querySelectorAll('a[data-timeline-pdf]')].filter((a) => a.checkVisibility()).map((a) => a.getAttribute('href'));
  const bg = (y) => getComputedStyle($('.tl-zoom label[for="tl-z-' + y + '"]')).backgroundColor;
  seen.chosen = bg('2') !== bg('5') && bg('2') !== bg('all');
  document.documentElement.setAttribute('data-phone', JSON.stringify(seen));
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/en', 'data-phone', '/__xslt-probe', '390,844');
});
const check = (name, fn) =>
  test(`phone: ${name}`, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the theme here');
    fn();
  });

check('the photo is no taller than 9rem', () => {
  assert.ok(
    seen.photoRem <= 9,
    `photo ${seen.photoRem.toFixed(1)}rem high in a ${seen.width}-wide window`,
  );
});

check('the name comes first, then the About, then the contacts', () => {
  assert.ok(seen.nameTop < seen.aboutTop, `name ${seen.nameTop} / about ${seen.aboutTop}`);
  assert.ok(
    seen.aboutTop < seen.contactTop,
    `about ${seen.aboutTop} / contacts ${seen.contactTop}`,
  );
});

check('the languages and the buttons make one row', () => {
  assert.equal(
    seen.restRows,
    1,
    `${seen.restRows} rows in ${seen.width}: ${JSON.stringify(seen.restItems)}`,
  );
  assert.equal(seen.restOverflow, false, 'the page scrolls sideways');
});

check('the two download buttons are told apart without their words', () => {
  assert.equal(seen.downloads.length, 2, JSON.stringify(seen.downloads));
  const [cv, timeline] = seen.downloads;
  assert.notEqual(cv.mark, 'none', 'the CV button has no mark of its own');
  assert.notEqual(timeline.mark, 'none', 'the timeline button has no mark of its own');
  assert.notEqual(cv.mark, timeline.mark, 'both buttons carry the same mark');
  assert.ok(cv.title && timeline.title && cv.title !== timeline.title, 'a button has no title');
});

check('the timeline starts on two years: its scale, its label and its PDF', () => {
  assert.ok(Math.abs(seen.stretch - seen.months / 24) < 0.001, `stretch ${seen.stretch}`);
  assert.equal(seen.chosen, true, 'the two-year label does not read as chosen');
  assert.deepEqual(
    seen.pdfs.map((h) => /_2y_/.test(h)),
    [true],
  );
});

check('every bar the timeline cut still leads to its entry', () => {
  for (const bar of seen.cut)
    assert.ok(bar.target, `${bar.name} leads to ${bar.href}, which is not on the page`);
});

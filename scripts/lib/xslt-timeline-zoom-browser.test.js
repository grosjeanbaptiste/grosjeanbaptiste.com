// The rich XSLT theme's timeline zoom, laid out by a real browser: choosing a
// zoom is clicking its label, and the CSS does the rest — the axis stretched
// to show that many years, and the one PDF of the timeline that goes with it.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const grid = $('#timeline .tl-grid');
  const stretch = () => Number(getComputedStyle(grid).getPropertyValue('--stretch'));
  const pdfs = () => all('a[data-timeline-pdf]').filter((a) => a.checkVisibility()).map((a) => a.getAttribute('href'));
  const seen = { months: Number(grid.dataset.months), buttons: all('.tl-zoom button').length };
  seen.radios = all('.tl-zoom input[type=radio]').map((r) => r.checked);
  seen.labelsShown = all('.tl-zoom label').every((l) => l.checkVisibility());
  seen.inputsHidden = all('.tl-zoom input').every((i) => i.getBoundingClientRect().width <= 1);
  seen.start = [stretch(), pdfs(), grid.getBoundingClientRect().width];
  const choose = (years) => { $('label[for="tl-z-' + years + '"]').click(); return [stretch(), pdfs(), grid.getBoundingClientRect().width]; };
  seen.two = choose('2');
  const frame = $('#timeline .tl-scroll');
  seen.anchored = [frame.scrollWidth > frame.clientWidth, frame.scrollLeft === 0];
  seen.all = choose('all');
  seen.five = choose('5');
  seen.checked = all('.tl-zoom input').filter((r) => r.checked).map((r) => r.id);
  seen.said = $('.tl-zoom label[for="tl-z-5"]') && getComputedStyle($('.tl-zoom label[for="tl-z-5"]')).backgroundColor !== getComputedStyle($('.tl-zoom label[for="tl-z-2"]')).backgroundColor;
  document.documentElement.setAttribute('data-zoom-seen', JSON.stringify(seen));
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/fr', 'data-zoom-seen', '/__xslt-probe');
});
const check = (name, fn) =>
  test(`rich: ${name}`, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the theme here');
    fn();
  });
const years = (n) => Math.max(1, seen.months / (n * 12));

check('the zoom has no button and starts on five years', () => {
  assert.equal(seen.buttons, 0);
  assert.deepEqual(seen.radios, [false, true, false]);
  assert.ok(Math.abs(seen.start[0] - years(5)) < 0.001);
});
check('the labels show, and the radios stay out of sight', () => {
  assert.equal(seen.labelsShown, true);
  assert.equal(seen.inputsHidden, true);
});
check('two years stretches the axis to show two years', () => {
  assert.ok(Math.abs(seen.two[0] - years(2)) < 0.001);
  assert.ok(seen.two[2] > seen.start[2]);
});
check('a zoomed-in axis stays on today, at the right end of the frame', () =>
  assert.deepEqual(seen.anchored, [true, true]),
);
check('all shows the whole career in the frame', () => {
  assert.equal(seen.all[0], 1);
  assert.ok(seen.all[2] < seen.start[2]);
});
check('the timeline PDF on offer is the one of the zoom chosen', () => {
  const zoomOf = (href) => (/_2y_/.test(href) ? '2' : /_5y_/.test(href) ? '5' : 'all');
  for (const [name, wanted] of [
    ['start', '5'],
    ['two', '2'],
    ['all', 'all'],
    ['five', '5'],
  ])
    assert.deepEqual(seen[name][1].map(zoomOf), [wanted], name);
});
check('one zoom is chosen at a time, and reads as chosen', () => {
  assert.deepEqual(seen.checked, ['tl-z-5']);
  assert.equal(seen.said, true);
});

// The classic page's timeline starts on two years on a phone and on five
// years on anything wider, in a real Chrome (js/timeline.js sets the zoom; the
// rich XSLT theme does it in CSS, see xslt-timeline-zoom.test.js). "Phone" is
// the 48em of css/timeline-phone.css: the smallest window headless Chrome
// opens is some 500 px wide, under it.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const pressed = [...document.querySelectorAll('.tl-zoom button[aria-pressed="true"]')].map((b) => b.dataset.years);
  const grid = document.querySelector('#timeline .tl-grid');
  document.documentElement.setAttribute('data-zoom-default', JSON.stringify({
    pressed,
    stretch: Number(getComputedStyle(grid).getPropertyValue('--stretch')),
    months: Number(grid.dataset.months),
  }));
}, 900));
</script>`;

const years = (seen, n) => Math.max(1, seen.months / (n * 12));

for (const [screen, size, want] of [
  ['phone', '390,844', '2'],
  ['desktop', '1280,900', '5'],
]) {
  test(`classic: the timeline starts on ${want} years on a ${screen}`, async (t) => {
    const seen = await probed(PROBE, '/fr/', 'data-zoom-default', '/__probe', size);
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the page here');
    assert.deepEqual(seen.pressed, [want]);
    assert.ok(
      Math.abs(seen.stretch - years(seen, Number(want))) < 0.001,
      `stretch ${seen.stretch}`,
    );
  });
}

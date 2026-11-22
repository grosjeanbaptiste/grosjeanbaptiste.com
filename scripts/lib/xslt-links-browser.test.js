// The rich XSLT theme's two script extras (js/xslt-links.js), in a real
// browser: the classic page's shareable ?skill=, and the menu marking the
// section on screen. The filter itself stays CSS (xslt-skill-filter-browser).
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const seen = {};
  const chip = $('.tl-chip');
  seen.skill = chip.firstChild.textContent.trim();
  seen.href = chip.getAttribute('href');
  seen.fromQuery = location.hash;
  seen.queryKept = new URLSearchParams(location.search).get('skill');
  seen.marked = [...document.querySelectorAll('.toolbar a.nav-link.active')].map((a) => a.getAttribute('href'));
  // The theme scrolls smoothly; the probe does not wait for it.
  scrollTo({ top: $('#experience').getBoundingClientRect().top + scrollY + 40, behavior: 'instant' });
  // A headless page paints no frames, so no scroll event comes by itself.
  dispatchEvent(new Event('scroll'));
  setTimeout(() => {
    seen.toolbar = [getComputedStyle($('.toolbar')).position, Math.round($('.toolbar').getBoundingClientRect().top)];
    seen.atExperience = [...document.querySelectorAll('.toolbar a.nav-link.active')].map((a) => a.getAttribute('href'));
    document.documentElement.setAttribute('data-xslt-links', JSON.stringify(seen));
  }, 800);
}, 900));
</script>`;

let seen;
test.before(async () => {
  // The skill is chosen by name: the first chip's, read back by the probe.
  const first = await probed(PROBE, '/fr', 'data-xslt-links', '/__xslt-probe');
  if (!first) return;
  seen = await probed(
    PROBE,
    `/fr?skill=${encodeURIComponent(first.skill)}`,
    'data-xslt-links',
    '/__xslt-probe',
  );
});
const check = (name, fn) =>
  test(`rich: ${name}`, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the theme here');
    fn();
  });

check('?skill= sets the filter target and stays in the address', () => {
  assert.equal(seen.fromQuery, seen.href);
  assert.equal(seen.queryKept, seen.skill);
});

check('the menu marks the section on screen', () => {
  assert.deepEqual(seen.atExperience, ['#experience']);
});

check('the toolbar stays at the top of the screen, under the views bar', () => {
  assert.equal(seen.toolbar[0], 'sticky');
  // The views bar is 2.25rem (36px) high.
  assert.ok(seen.toolbar[1] >= 0 && seen.toolbar[1] <= 40, `top at ${seen.toolbar[1]}px`);
});

// The rich XSLT theme's entry panel, laid out by a real browser: it has no
// script, so what has to be checked is that the CSS does it. An entry the URL
// points at (a bar of the timeline, a search result, a shared link) is lifted
// out of the flow into a panel over the page, so the timeline stays where it
// is; its close link leads back to the timeline, and the entry is an ordinary
// block again.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const seen = {};
  const item = $('#experience .item[id]');
  const pos = (el) => getComputedStyle(el).position;
  seen.closedByDefault = all('.entry-close').every((a) => !a.checkVisibility());
  seen.flowBefore = pos(item);
  const top = $('#timeline').getBoundingClientRect().top;
  location.hash = item.id;
  setTimeout(() => {
    seen.panel = pos(item);
    seen.timelineStays = $('#timeline').getBoundingClientRect().top === top;
    const close = item.querySelector('.entry-close');
    seen.closeShown = !!close && close.checkVisibility();
    seen.closeLeadsTo = close && close.getAttribute('href');
    seen.inViewport = item.getBoundingClientRect().bottom <= innerHeight + 1;
    seen.otherUntouched = all('#experience .item[id]').filter((i) => i !== item).every((i) => pos(i) === 'static');
    close?.click();
    setTimeout(() => {
      seen.afterClose = [pos(item), location.hash];
      seen.scripts = all('script[src]').map((s) => s.getAttribute('src')).filter((src) => /entry|drawer/.test(src));
      document.documentElement.setAttribute('data-entry-panel', JSON.stringify(seen));
    }, 150);
  }, 150);
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/fr', 'data-entry-panel', '/__xslt-probe');
});
const check = (name, fn) =>
  test(`rich: ${name}`, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the theme here');
    fn();
  });

check('no entry has a panel until the URL points at one', () => {
  assert.equal(seen.closedByDefault, true);
  assert.equal(seen.flowBefore, 'static');
});
check('the entry the URL points at becomes a panel over the page', () =>
  assert.equal(seen.panel, 'fixed'),
);
check('the timeline does not move', () => assert.equal(seen.timelineStays, true));
check('the panel is on screen, with a close link to the timeline', () => {
  assert.equal(seen.closeShown, true);
  assert.equal(seen.closeLeadsTo, '#timeline');
  assert.equal(seen.inViewport, true);
});
check('the other entries stay in the flow', () => assert.equal(seen.otherUntouched, true));
check('closing leaves the timeline in the URL and the entry in the flow', () =>
  assert.deepEqual(seen.afterClose, ['static', '#timeline']),
);
check('none of it needs a script', () => assert.deepEqual(seen.scripts, []));

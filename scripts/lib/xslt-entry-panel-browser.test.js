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
      // A project, a course unit or a volunteering row: its bar leads to an
      // empty span at the row's end, and the row is what becomes the panel.
      const anchor = $('li > .tl-anchor[id]');
      const row = anchor.parentElement;
      seen.rows = all('li > .tl-anchor[id]').length;
      seen.rowBefore = [pos(row), !!row.querySelector(':scope > .entry-close')];
      const rowTop = $('#timeline').getBoundingClientRect().top;
      location.hash = anchor.id;
      setTimeout(() => {
        const rclose = row.querySelector(':scope > .entry-close');
        seen.row = [pos(row), !!rclose && rclose.checkVisibility(), row.getBoundingClientRect().bottom <= innerHeight + 1];
        seen.rowTimelineStays = $('#timeline').getBoundingClientRect().top === rowTop;
        seen.rowOthers = all('li').filter((l) => l !== row && !l.contains(row)).every((l) => pos(l) === 'static');
        rclose?.click();
        setTimeout(() => {
          seen.rowAfter = [pos(row), location.hash];
          document.documentElement.setAttribute('data-entry-panel', JSON.stringify(seen));
        }, 150);
      }, 150);
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

check('every project, course unit and volunteering row has a way out of its panel', () => {
  assert.ok(seen.rows > 0);
  assert.deepEqual(seen.rowBefore, ['static', true]);
});
check('the row a bar leads to becomes a panel too, on screen, the timeline unmoved', () => {
  assert.deepEqual(seen.row, ['fixed', true, true]);
  assert.equal(seen.rowTimelineStays, true);
});
check('the other rows stay in the flow', () => assert.equal(seen.rowOthers, true));
check('closing a row leaves the timeline in the URL and the row in the flow', () =>
  assert.deepEqual(seen.rowAfter, ['static', '#timeline']),
);

// The rich XSLT theme's search in a real browser: the theme rendered with
// xsltproc, served as a browser draws it. ⌘K opens the classic page's dialog;
// a typed word is ranked; Enter on an entry leads to its id and marks its bar;
// Enter on a skill leads to the theme's filter (#skill-…), which CSS applies —
// the filter's own script, the classic page's, is not there.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const dialog = $('#cv-search');
  const input = $('.cv-search-input');
  const options = () => all('.cv-search-option');
  const key = (target, init) => target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
  const type = (text) => { input.value = text; input.dispatchEvent(new Event('input')); };
  const seen = {};
  seen.openerShown = !$('.tl-search-open').hidden;
  seen.closedAtFirst = !dialog.open;
  key(document, { key: 'k', metaKey: true });
  seen.openedByShortcut = dialog.open;
  type('rust');
  seen.first = [options()[0]?.dataset.type, options()[0]?.dataset.value];
  key(input, { key: 'Enter' });
  setTimeout(() => {
    seen.skill = [dialog.open, location.hash];
    const faded = all('#timeline .tl-bar').filter((b) => getComputedStyle(b).opacity === '0.18');
    seen.fadedByCss = faded.length > 0 && all('.tl-bar[data-dimmed]').length === 0;
    $('.tl-search-open').click();
    type('acteble');
    const at = options().findIndex((o) => o.dataset.type === 'entry');
    for (let i = 0; i < at; i++) key(input, { key: 'ArrowDown' });
    seen.entry = options()[at]?.dataset.value;
    key(input, { key: 'Enter' });
    setTimeout(() => {
      seen.led = [dialog.open, decodeURIComponent(location.hash)];
      seen.setApart = $('.tl-shown')?.querySelector('[id]')?.id;
      seen.barMarked = $('.tl-bar[aria-current="true"]')?.getAttribute('href');
      seen.scripts = all('script[src]').map((s) => s.getAttribute('src')).filter((src) => /skill|search/.test(src));
      document.documentElement.setAttribute('data-xslt-search', JSON.stringify(seen));
    }, 200);
  }, 200);
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/fr', 'data-xslt-search', '/__xslt-probe');
});
const check = (name, fn) =>
  test(`rich: ${name}`, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the theme here');
    fn();
  });

check('the script shows the button; the dialog starts closed', () => {
  assert.equal(seen.openerShown, true);
  assert.equal(seen.closedAtFirst, true);
});
check('⌘K opens the search', () => assert.equal(seen.openedByShortcut, true));
check('a typed skill comes first', () => assert.deepEqual(seen.first, ['skill', 'Rust']));
check('Enter on a skill leads to the filter, in the URL', () =>
  assert.deepEqual(seen.skill, [false, '#skill-rust']),
);
check('the filter is applied by CSS, not by a script', () => assert.equal(seen.fadedByCss, true));
check('Enter on an entry leads to its id', () => {
  assert.equal(seen.entry, 'project-acteble');
  assert.deepEqual(seen.led, [false, '#project-acteble']);
});
check('the entry is set apart and its bar marked', () => {
  assert.equal(seen.setApart, 'project-acteble');
  assert.equal(seen.barMarked, '#project-acteble');
});
check('the only scripts are the search, no filter script', () =>
  assert.deepEqual(seen.scripts, ['/js/search-rank.js', '/js/search.js']),
);

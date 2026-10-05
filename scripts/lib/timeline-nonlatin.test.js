// An entry's id may hold letters that are not Latin (the Chinese page: a role's
// title is part of it). A browser percent-encodes them in location.hash, and
// xsltproc in href — so js/timeline.js must compare and look ids up decoded.
// Asked of a real Chrome on the Chinese page: a click on such a bar, and an
// arrival on a URL that names such an entry.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probePage } = require('./chrome-probe');
const { loadResume } = require('./data');
const { applyHtmlOverrides } = require('./site-overrides');
const { anchorOf } = require('./anchors');

const [founder] = applyHtmlOverrides(loadResume('zh')).work;
const id = anchorOf('work', founder);

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const arrived = { shown: document.querySelectorAll('.tl-shown').length, current: document.querySelectorAll('.tl-bar[aria-current="true"]').length };
  const bar = [...document.querySelectorAll('.tl-lane[data-kind="work"] a.tl-bar')].at(-1);
  bar.click();
  setTimeout(() => {
    const clicked = { shown: document.querySelectorAll('.tl-shown').length, current: bar.getAttribute('aria-current'), hash: decodeURIComponent(location.hash) };
    document.documentElement.setAttribute('data-seen', JSON.stringify({ arrived, clicked, href: decodeURIComponent(bar.getAttribute('href')) }));
  }, 100);
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probePage(`zh/#${encodeURIComponent(id)}`, PROBE, 'data-seen');
});
const check = (name, fn) =>
  test(name, (t) => (seen ? fn() : t.skip('no Chrome found — set CHROME_PATH to check this here')));

test('the entry under test has an id that is not all Latin', () => {
  assert.match(id, /[^\p{ASCII}]/u);
});
check('arriving on a URL that names such an entry sets it apart', () =>
  assert.equal(seen.arrived.shown, 1),
);
check('arriving on it marks its bar', () => assert.equal(seen.arrived.current, 1));
check('a click on such a bar sets its entry apart', () => assert.equal(seen.clicked.shown, 1));
check('a click on such a bar marks it', () => assert.equal(seen.clicked.current, 'true'));
check('the URL then names that entry', () => assert.equal(seen.clicked.hash, seen.href));

// The classic page's skill filter and search, in a real browser: both only
// exist once their scripts have run against the laid-out page. One Chrome run,
// opened on a shared link (?skill=Rust), one probe; each test reads one thing
// the probe saw.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const root = $('.tl-skills'), status = $('.tl-skill-status'), dialog = $('#cv-search');
  const input = $('input', dialog), opener = $('.tl-search-open');
  const pressed = () => all('.tl-chip[aria-pressed="true"]').map((c) => c.dataset.skill);
  const dimmed = () => all('.tl-bar[data-dimmed="true"]');
  const skill = () => new URL(location.href).searchParams.get('skill');
  const type = (text) => { input.value = text; input.dispatchEvent(new Event('input')); };
  const key = (name) => input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  const seen = { filterShown: !root.hidden, openerShown: !opener.hidden };
  // Opened on ?skill=Rust.
  const rust = $('.tl-chip[data-skill="Rust"]');
  const users = new Set(rust.dataset.entries.split(' '));
  seen.fromUrl = pressed();
  seen.said = $('output', status).textContent === rust.dataset.status && !status.hidden;
  seen.lit = all('.tl-bar:not([data-dimmed])').every((b) => users.has(b.dataset.entry));
  seen.litCount = all('.tl-bar:not([data-dimmed])').length;
  seen.dimmedCount = dimmed().length;
  seen.dimOpacity = getComputedStyle(dimmed()[0]).opacity;
  seen.bullet = getComputedStyle(rust.closest('li'), '::before').content;
  // Another skill replaces it; the same one again clears it.
  const other = all('.tl-chip').find((c) => c !== rust);
  other.click();
  seen.replaced = [pressed().join(), skill()].join('|') === [other.dataset.skill, other.dataset.skill].join('|');
  other.click();
  seen.toggledOff = [pressed().length, dimmed().length, skill(), status.hidden];
  rust.click();
  $('.tl-skill-clear').click();
  seen.cleared = [pressed().length, dimmed().length, skill(), status.hidden];
  // The shortlist and the rest.
  const more = $('.tl-chip-more'), extra = $('.tl-chip-extra');
  seen.extraHidden = getComputedStyle(extra).display === 'none';
  more.click();
  seen.expanded = [getComputedStyle(extra).display !== 'none', more.getAttribute('aria-expanded'), more.textContent === more.dataset.fewer];
  more.click();
  $('.tl-chip', extra).click();
  seen.chosenExtraStays = getComputedStyle(extra).display !== 'none';
  $('.tl-skill-clear').click();
  // The search.
  seen.closedAtFirst = !dialog.open;
  opener.click();
  seen.opened = dialog.open;
  type('zzzzqq');
  seen.nothing = [all('#cv-search [role="option"]').length, $('.cv-search-empty').hidden];
  type('rust');
  const first = $('#cv-search [role="option"]');
  seen.skillFirst = [first.dataset.type, first.dataset.value, first.getAttribute('aria-selected')];
  key('Enter');
  seen.skillPicked = [dialog.open, pressed().join(), skill()];
  $('.tl-skill-clear').click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  seen.shortcut = dialog.open;
  seen.emptied = input.value === '' && all('#cv-search [role="option"]').every((o) => o.dataset.type === 'action');
  type('remi');
  const options = all('#cv-search [role="option"]');
  const entry = options.find((o) => o.dataset.type === 'entry');
  seen.entryFound = entry?.dataset.value;
  key('ArrowDown');
  seen.arrow = options.length < 2 || options[1].getAttribute('aria-selected') === 'true';
  key('ArrowUp');
  entry.click();
  seen.led = [dialog.open, location.hash, $('.tl-shown')?.textContent.includes('Remi') ?? false, all('.tl-shown').length];
  seen.barMarked = $('a.tl-bar[href="#project-remi"]')?.getAttribute('aria-current');
  seen.skillKept = skill();
  document.documentElement.setAttribute('data-browse', JSON.stringify(seen));
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/fr/?skill=Rust', 'data-browse');
});

const check = (name, fn) =>
  test(name, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the search here');
    fn();
  });

check('the script reveals the skill filter', () => assert.equal(seen.filterShown, true));
check('a shared link opens on its skill', () => assert.deepEqual(seen.fromUrl, ['Rust']));
check('the filter says how many entries use the skill', () => assert.equal(seen.said, true));
check('only the bars of the entries using the skill stay lit', () => {
  assert.equal(seen.lit, true);
  assert.ok(
    seen.litCount > 0 && seen.dimmedCount > 0,
    `${seen.litCount} lit, ${seen.dimmedCount} dimmed`,
  );
});
check('a dimmed bar fades back', () => assert.equal(seen.dimOpacity, '0.18'));
check('a chip carries no list bullet', () => assert.equal(seen.bullet, 'none'));
check('choosing another skill replaces the first, in the URL too', () =>
  assert.equal(seen.replaced, true),
);
check('choosing the chosen skill again clears the filter', () =>
  assert.deepEqual(seen.toggledOff, [0, 0, null, true]),
);
check('"clear" brings the whole CV back and takes the skill out of the URL', () =>
  assert.deepEqual(seen.cleared, [0, 0, null, true]),
);
check('the skills beyond the shortlist wait behind a button', () =>
  assert.equal(seen.extraHidden, true),
);
check('the button shows them and then offers fewer', () =>
  assert.deepEqual(seen.expanded, [true, 'true', true]),
);
check('a chosen skill stays in sight once the list is short again', () =>
  assert.equal(seen.chosenExtraStays, true),
);
check('the script reveals the button that opens the search', () =>
  assert.equal(seen.openerShown, true),
);
check('the search is closed until asked for', () => assert.equal(seen.closedAtFirst, true));
check('the button opens the search', () => assert.equal(seen.opened, true));
check('a query nothing matches says so', () => assert.deepEqual(seen.nothing, [0, false]));
check('a skill named exactly comes first, ready to be picked', () =>
  assert.deepEqual(seen.skillFirst, ['skill', 'Rust', 'true']),
);
check('Enter on a skill closes the search and applies the filter', () =>
  assert.deepEqual(seen.skillPicked, [false, 'Rust', 'Rust']),
);
check('Ctrl+K opens the search', () => assert.equal(seen.shortcut, true));
check('the search opens on an empty query each time, with its actions alone', () =>
  assert.equal(seen.emptied, true),
);
check('an entry is found by its name', () => assert.equal(seen.entryFound, 'project-remi'));
check('the arrows move through the results', () => assert.equal(seen.arrow, true));
check('picking an entry closes the search and leads to it, set apart alone', () =>
  assert.deepEqual(seen.led, [false, '#project-remi', true, 1]),
);
check('the bar of the entry is marked as the one on screen', () =>
  assert.equal(seen.barMarked, 'true'),
);
check('leading to an entry leaves the filter as it was', () => assert.equal(seen.skillKept, null));

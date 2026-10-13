// The XSLT themes' skill filter, laid out by a real browser: it has no script,
// so what has to be checked is that the CSS the theme writes does dim. Each
// theme is rendered with xsltproc, served as a browser would draw it and
// opened on a shared link (#skill-rust); the probe only reads and clicks.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const faded = () => all('#timeline .tl-bar').filter((b) => getComputedStyle(b).opacity === '0.18');
  const uses = (bar) => (bar.dataset.uses || '').split(' ').includes('rust');
  const shown = (el) => getComputedStyle(el).display !== 'none';
  const chip = $('.tl-chip[href="#skill-rust"]');
  const other = all('.tl-skills > .tl-chips .tl-chip').find((c) => c !== chip);
  const seen = {};
  // Opened on #skill-rust.
  seen.fadedOnlyOthers = faded().length > 0 && faded().every((b) => !uses(b));
  seen.litAllUsers = all('#timeline .tl-bar').filter(uses).every((b) => getComputedStyle(b).opacity === '1');
  seen.users = all('#timeline .tl-bar').filter(uses).length;
  seen.chosen = getComputedStyle(chip).backgroundColor !== getComputedStyle(other).backgroundColor;
  seen.said = all('.tl-skill-said').filter(shown).map((p) => p.dataset.skill);
  seen.targetTakesNoRoom = $('#skill-rust').getBoundingClientRect().height === 0;
  // The rest of the skills wait in a disclosure.
  const rest = $('.tl-chips-rest');
  seen.restClosed = !rest.open && !$('.tl-chips-rest .tl-chip').checkVisibility();
  $('.tl-chips-rest summary').click();
  seen.restOpened = rest.open && $('.tl-chips-rest .tl-chip').checkVisibility();
  // Clearing is a link to the timeline itself.
  all('.tl-skill-said').find(shown).querySelector('a').click();
  setTimeout(() => {
    seen.cleared = [faded().length, all('.tl-skill-said').filter(shown).length, location.hash];
    other.click();
    setTimeout(() => {
      seen.another = [faded().length > 0, location.hash === other.getAttribute('href')];
      seen.scripts = all('script[src]').map((s) => s.getAttribute('src')).filter((src) => /skill|search/.test(src));
      document.documentElement.setAttribute('data-xslt-filter', JSON.stringify(seen));
    }, 150);
  }, 150);
}, 900));
</script>`;

for (const [theme, route] of [
  ['rich', '/__xslt-probe'],
  ['minimal', '/__xslt-probe-minimal'],
]) {
  let seen;
  test.before(async () => {
    seen = await probed(PROBE, '/fr#skill-rust', 'data-xslt-filter', route);
  });
  const check = (name, fn) =>
    test(`${theme}: ${name}`, (t) => {
      if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the themes here');
      fn();
    });

  check('a shared link fades the bars of the entries that do not use the skill', () =>
    assert.equal(seen.fadedOnlyOthers, true),
  );
  check('the bars of the entries that use it stay lit', () => {
    assert.ok(seen.users > 0);
    assert.equal(seen.litAllUsers, true);
  });
  check('the chosen skill reads as chosen', () => assert.equal(seen.chosen, true));
  check('its sentence shows, alone', () => assert.deepEqual(seen.said, ['rust']));
  check('a target takes no room on the page', () => assert.equal(seen.targetTakesNoRoom, true));
  check('the skills beyond the shortlist are folded away', () =>
    assert.equal(seen.restClosed, true),
  );
  check('the disclosure shows them', () => assert.equal(seen.restOpened, true));
  check('"clear" lights every bar again and leaves the timeline in the URL', () =>
    assert.deepEqual(seen.cleared, [0, 0, '#timeline']),
  );
  check('another skill is one click away, and in the URL', () =>
    assert.deepEqual(seen.another, [true, true]),
  );
  check('none of it needs a script', () => assert.deepEqual(seen.scripts, []));
}

// The skill filter in the two XSLT themes, with no script: a skill is a link
// to a target of its own, set before the timeline's bars, and a rule written
// by the theme dims the bars that do not name the skill while its target is
// the one in the URL — so a filtered view is a link like any other. Rendered
// here with xsltproc; scripts/lib/xslt-skill-filter-browser.test.js checks
// that a browser does dim.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT } = require('./config');

const render = (minimal) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/resume-transform${minimal ? '-minimal' : ''}.xsl`),
      path.join(ROOT, `assets/data/resume-fr${minimal ? '-minimal' : ''}.xml`),
    ],
    { encoding: 'utf8', maxBuffer: 1 << 26 },
  );
const scripts = (html) => (html.match(/<script\b/g) || []).length;

for (const [theme, minimal] of [
  ['rich', false],
  ['minimal', true],
]) {
  const html = render(minimal);
  const timeline = html.slice(html.indexOf('<section id="timeline"'));
  const section = timeline.slice(0, timeline.indexOf('</section>'));

  test(`${theme}: a skill is a link to its own target`, () => {
    assert.match(
      section,
      /<a class="tl-chip" href="#skill-rust">Rust <span class="tl-chip-count">\d+<\/span><\/a>/,
    );
  });

  test(`${theme}: the target of a skill sits before the bars it dims`, () => {
    const target = section.indexOf('<span class="tl-skill-target" id="skill-rust">');
    assert.ok(target > 0, 'no target for Rust');
    assert.ok(target < section.indexOf('class="tl-scroll"'));
  });

  test(`${theme}: a bar names the skills its entry uses`, () => {
    const bars = [...section.matchAll(/<(a|span) class="tl-bar"[^>]*>/g)].map((m) => m[0]);
    const acteble = bars.find((b) => b.includes('data-name="Acteble"'));
    assert.match(acteble, /data-uses="[^"]*\brust\b[^"]*"/);
  });

  test(`${theme}: the theme writes the rule that dims the other bars`, () => {
    assert.match(section, /#skill-rust:target ~ \.tl-scroll \.tl-bar:not\(\[data-uses~="rust"\]\)/);
  });

  test(`${theme}: the chosen skill says how many entries use it, and how to clear it`, () => {
    assert.match(
      section,
      /<p class="tl-skill-said" data-skill="rust">\d+ éléments? utilisent? Rust <a href="#timeline">Retirer le filtre<\/a><\/p>/,
    );
  });

  test(`${theme}: the skills beyond the shortlist wait in a disclosure`, () => {
    assert.match(
      section,
      /<details class="tl-chips-rest">\s*<summary[^>]*>Toutes les compétences \(\d+\)<\/summary>/,
    );
    assert.equal(
      (section.slice(0, section.indexOf('<details')).match(/class="tl-chip"/g) || []).length,
      18,
    );
  });

  test(`${theme}: every skill listed has its target and its rule`, () => {
    const listed = [...section.matchAll(/class="tl-chip" href="#skill-([^"]+)"/g)].map((m) => m[1]);
    assert.ok(listed.length > 18, `${listed.length} skills`);
    assert.equal(new Set(listed).size, listed.length, 'two skills share a target');
    for (const token of listed.map(decodeURIComponent)) {
      assert.ok(section.includes(`id="skill-${token}"`), `no target for ${token}`);
      assert.ok(section.includes(`[data-uses~="${token}"]`), `no rule for ${token}`);
    }
  });

  test(`${theme}: the filter's sheet is loaded`, () => {
    assert.match(html, /<link[^>]*href="\/css\/skill-links\.css"/);
  });
}

test('the filter adds no script to the minimal theme', () => {
  const html = render(true);
  assert.doesNotMatch(html, /skill-filter\.js|search\.js/);
  // Its scripts are the ones it had: theme, language, print layout.
  assert.equal(scripts(html), 3);
});

// The search is the rich theme's one script by design (it cannot be done in
// CSS); the filter must still need none.
test('the filter adds no script to the rich theme either', () => {
  assert.doesNotMatch(render(false), /skill-filter\.js/);
});

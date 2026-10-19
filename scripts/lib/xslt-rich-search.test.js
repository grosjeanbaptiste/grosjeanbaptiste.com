// The rich XSLT theme's search: the classic page's own (js/search.js,
// js/search-rank.js, css/browse.css, loaded as they are), over the same index
// (sections/search.js), written by the theme from the XML mirror. Its results
// lead to the ids the theme shares with the classic page, a skill to the
// theme's filter (#skill-…, pure CSS), an action to another XSLT display or a
// file. Without a script everything stays hidden, as on the classic page. The
// minimal theme has no search: it has no script. Rendered with xsltproc.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS, langPath } = require('./config');

const render = (lang, minimal = false) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/resume-transform${minimal ? '-minimal' : ''}.xsl`),
      path.join(ROOT, `assets/data/resume-${lang}${minimal ? '-minimal' : ''}.xml`),
    ],
    { encoding: 'utf8' },
  );
const classic = (lang) =>
  fs.readFileSync(path.join(ROOT, `${langPath(lang).replace(/^\//, '')}index.html`), 'utf8');
const indexOf = (html) => {
  const raw = /<script type="application\/json" id="cv-index">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(raw, 'no search index');
  return JSON.parse(raw[1]);
};
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

for (const lang of LANGS) {
  const rich = render(lang);
  const page = classic(lang);

  test(`${lang}: the dialog is the classic page's, closed`, () => {
    assert.match(rich, /<dialog id="cv-search" aria-label="[^"]+">/);
    assert.match(
      rich,
      /<input type="search" class="cv-search-input"[^>]*aria-controls="cv-search-results"/,
    );
    assert.match(
      rich,
      /<ul id="cv-search-results" class="cv-search-results" role="listbox"><\/ul>/,
    );
    assert.match(rich, /<p class="cv-search-empty" hidden(="hidden")?>/);
    assert.doesNotMatch(rich, /<dialog[^>]*\sopen/);
  });

  test(`${lang}: the button opening it sits in the timeline's head, hidden until the script runs`, () => {
    const head = /<div class="tl-head">([\s\S]*?)<div class="tl-scroll">/.exec(rich)[1];
    assert.match(
      head,
      /<button type="button" class="tl-search-open" aria-haspopup="dialog" aria-controls="cv-search" hidden(="hidden")?>/,
    );
  });

  test(`${lang}: the classic page's script, ranking and styles are loaded as they are`, () => {
    const scripts = [...rich.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
    const rank = scripts.indexOf('/js/search-rank.js');
    assert.ok(rank >= 0 && rank < scripts.indexOf('/js/search.js'));
    assert.match(rich, /<link rel="stylesheet" href="\/css\/browse.css">/);
  });

  test(`${lang}: it searches the entries the classic page searches, each with its id here`, () => {
    const mine = indexOf(rich).entries.map((e) => e.id);
    assert.deepEqual(
      mine,
      indexOf(page).entries.map((e) => e.id),
    );
    for (const id of mine) assert.ok(ids(rich).has(id), `no #${id}`);
  });

  test(`${lang}: a skill leads to the theme's filter, counted as on the classic page`, () => {
    const skills = indexOf(rich).skills;
    assert.deepEqual(
      skills.map(({ skill, uses }) => [skill, uses]),
      indexOf(page).skills.map(({ skill, uses }) => [skill, uses]),
    );
    for (const { href } of skills) assert.ok(ids(rich).has(href.replace(/^#/, '')), href);
  });

  test(`${lang}: its actions lead to the other XSLT displays, the theme button and the PDFs`, () => {
    const actions = indexOf(rich).actions;
    const others = LANGS.filter((l) => l !== lang).map((l) => `/assets/data/resume-${l}.xml`);
    assert.deepEqual(
      actions.filter((a) => a.href?.endsWith('.xml')).map((a) => a.href),
      others,
    );
    assert.ok(actions.some((a) => a.press === '#theme-toggle'));
    assert.ok(rich.includes('id="theme-toggle"'));
    assert.deepEqual(
      actions.filter((a) => a.href?.endsWith('.pdf')).map((a) => a.href),
      [
        `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`,
        `/assets/cv/cv_grosjean_baptiste_timeline_${lang}.pdf`,
      ],
    );
  });

  test(`${lang}: the minimal theme has no search`, () => {
    const minimal = render(lang, true);
    assert.doesNotMatch(minimal, /cv-search|search\.js/);
  });
}

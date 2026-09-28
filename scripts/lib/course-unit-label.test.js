// Course units must never appear under the "Projects" heading.
//
// They were referenced the same way professional projects are, so the embedded
// list put Algorithmique and Anglais I under "Projects:" beside Acteble and
// fedrag-be. A degree's teaching units are not projects, and a reader scanning
// that line learns the opposite.
//
// They keep their own block, under their own label, in all six languages.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const { LANGS, langOutFile } = require('./config');
const { loadResume } = require('./data');
const I18N = require('./i18n');

const unitNames = (lang) =>
  loadResume(lang)
    .projects.filter((p) => p.type === 'Course unit')
    .map((p) => p.name);

// The block a name sits in: the nearest embedded-label before the <li> row
// that names it.
//
// Scoped to the row, not to the first occurrence of the name in the page: a
// project is also named in the sidebar, which comes before any embedded-label,
// so indexOf alone returned "no label" for every name and made the first
// assertion pass while checking nothing.
function labelFor(html, name) {
  const needle = `<strong>${name}</strong>`;
  for (const row of html.matchAll(/<li>(?:(?!<\/li>)[\s\S])*<\/li>/g)) {
    if (!row[0].includes(needle)) continue;
    const before = html.slice(0, row.index);
    const m = [...before.matchAll(/<p class="embedded-label">([^<]*):<\/p>/g)].pop();
    return m ? m[1] : null;
  }
  return null;
}

test('no course unit sits under the Projects heading', () => {
  for (const lang of LANGS) {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    const projects = I18N[lang].projects;
    for (const name of unitNames(lang)) {
      assert.notEqual(labelFor(html, name), projects, `${lang}: "${name}" is under "${projects}"`);
    }
  }
});

test('a real project still sits under the Projects heading', () => {
  for (const lang of LANGS) {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.equal(labelFor(html, 'Acteble'), I18N[lang].projects, `${lang}: Acteble moved`);
  }
});

test('the course-unit label is localized', () => {
  for (const lang of LANGS) {
    const label = I18N[lang].courseUnits;
    assert.ok(label, `${lang} has no courseUnits label`);
    assert.notEqual(label, I18N[lang].projects, `${lang} reuses the Projects label`);
  }
});

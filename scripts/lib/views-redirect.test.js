// Only the rich XSLT page is shown: every other display sends a visitor of the
// real domain to it (?classic keeps one there), in every language.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'];
const root = (lang) => (lang === 'en' ? 'index.html' : `${lang}/index.html`);

for (const lang of LANGS) {
  for (const file of [
    root(lang),
    `app/${lang}/index.html`,
    `app/${lang}/pdf/index.html`,
    `assets/data/resume-${lang}-minimal.html`,
  ]) {
    test(`${file} leads a visitor to the rich page`, () => {
      assert.ok(
        fs
          .readFileSync(file, 'utf8')
          .includes(`location.replace('/assets/data/resume-${lang}.html'`),
      );
    });
  }
}

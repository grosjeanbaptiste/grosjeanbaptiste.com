// Guard for the link from the classic site to the React view at /app/.
// Without it the interactive CV exists but nobody reaches it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { LANGS, langOutFile } = require('./config');
const I18N = require('./i18n');
const { generateNav } = require('./sections/nav');

for (const lang of LANGS) {
  test(`the ${lang} nav links to the interactive CV in ${lang}`, () => {
    assert.match(generateNav(lang), new RegExp(`<a href="/app/${lang}/"[^>]*>`));
  });

  test(`the ${lang} link is labelled in ${lang}`, () => {
    const label = I18N[lang].nav.interactive;
    assert.ok(label, `no nav.interactive string for ${lang}`);
    assert.ok(generateNav(lang).includes(`>${label}</a>`), `link not labelled "${label}"`);
  });

  test(`the shipped ${lang} page carries the link`, () => {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.ok(html.includes(`href="/app/${lang}/"`), `${langOutFile(lang)} is not regenerated`);
  });
}

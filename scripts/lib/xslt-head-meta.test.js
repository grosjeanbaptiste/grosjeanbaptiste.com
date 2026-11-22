// Both XSLT themes carry the metadata of the classic page's <head>: the same
// description, Open Graph and Twitter values, every hreflang, and the same
// schema.org Person. Rendered with xsltproc from the committed XML mirrors.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS, langPath } = require('./config');

const render = (lang, minimal) =>
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

const unescape = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const metaOf = (html, attr, key) => {
  const m = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
  return m && unescape(m[1]);
};
const hreflangs = (html) =>
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => `${m[1]} ${m[2]}`,
  );
const jsonLd = (html) =>
  JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

for (const lang of LANGS) {
  const page = classic(lang);
  for (const minimal of [false, true]) {
    const theme = minimal ? 'minimal' : 'rich';
    const out = render(lang, minimal);

    test(`${lang} ${theme}: description, Open Graph and Twitter as the classic page`, () => {
      for (const [attr, key] of [
        ['name', 'description'],
        ['name', 'author'],
        ['name', 'keywords'],
        ['property', 'og:title'],
        ['property', 'og:description'],
        ['property', 'og:url'],
        ['property', 'og:image'],
        ['property', 'og:locale'],
        ['name', 'twitter:title'],
        ['name', 'twitter:image'],
      ]) {
        assert.equal(metaOf(out, attr, key), metaOf(page, attr, key), key);
      }
    });

    test(`${lang} ${theme}: all six hreflang and x-default, canonical on the classic page`, () => {
      assert.deepEqual(hreflangs(out), hreflangs(page));
      assert.equal(hreflangs(out).length, 7);
      const canon = (h) => h.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.equal(canon(out), canon(page));
    });

    test(`${lang} ${theme}: the same schema.org Person`, () => {
      assert.deepEqual(jsonLd(out), jsonLd(page));
    });
  }
}

for (const minimal of [false, true]) {
  test(`${minimal ? 'minimal' : 'rich'}: the other displays are warmed as on the classic page`, () => {
    const out = render('en', minimal);
    const rules = (html) => html.match(/<script type="speculationrules">([\s\S]*?)<\/script>/)[1];
    assert.deepEqual(JSON.parse(rules(out)), JSON.parse(rules(classic('en'))));
    assert.match(out, /<script src="\/js\/views-ahead\.js" defer/);
  });
}

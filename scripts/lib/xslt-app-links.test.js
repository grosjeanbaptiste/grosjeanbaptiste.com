// The rich XSLT theme is the only display offered: no entry, in either theme,
// leads on to the interactive view (/app/), and the rich theme leads to neither
// the minimal theme nor the classic pages. (The minimal theme's own language
// switcher stays inside it, and the site's root address is the profile's website.)
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');

const render = (sheet, lang) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/${sheet}.xsl`),
      path.join(ROOT, `assets/data/resume-${lang}.xml`),
    ],
    { encoding: 'utf8' },
  );

for (const lang of LANGS) {
  for (const sheet of ['resume-transform', 'resume-transform-minimal']) {
    test(`${lang}, ${sheet}: no link leads to another view`, () => {
      const hrefs = [...render(sheet, lang).matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
      assert.ok(hrefs.length > 50, `only ${hrefs.length} links`);
      for (const href of hrefs) {
        assert.doesNotMatch(href, /^\/app\//, `${href} leads to the interactive view`);
        if (sheet === 'resume-transform') {
          assert.doesNotMatch(href, /-minimal\.html/, `${href} leads to the minimal theme`);
          assert.doesNotMatch(
            href,
            /^\/([a-z]{2}\/)?(index\.html)?$/,
            `${href} leads to the classic page`,
          );
        }
      }
    });
  }
}

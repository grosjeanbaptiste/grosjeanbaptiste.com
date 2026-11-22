// An entry of the rich XSLT theme leads on to the same entry in the interactive
// view: every link is a page the app's build wrote, in the page's own language,
// and every entry that has a page there carries one.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');

const render = (lang) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, 'assets/xslt/resume-transform.xsl'),
      path.join(ROOT, `assets/data/resume-${lang}.xml`),
    ],
    { encoding: 'utf8' },
  );

for (const lang of LANGS) {
  test(`${lang}: each entry's link leads to a page of the interactive view`, () => {
    const out = render(lang);
    const hrefs = [...out.matchAll(/<a class="entry-open" href="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(hrefs.length > 50, `only ${hrefs.length} links`);
    for (const href of hrefs) {
      assert.match(href, new RegExp(`^/app/${lang}/(work|education|project|course|volunteer)/`));
      assert.ok(fs.existsSync(path.join(ROOT, href, 'index.html')), `no page for ${href}`);
    }
  });
}

test('the links are the same pages in every language', () => {
  const tail = (lang) =>
    [...render(lang).matchAll(/<a class="entry-open" href="\/app\/[a-z]+\/([^"]+)"/g)].map(
      (m) => m[1],
    );
  const en = tail('en');
  for (const lang of LANGS) assert.deepEqual(tail(lang), en);
});

// The XSLT themes as plain pages (xslt-pages.js): each one is what the
// stylesheet makes of its XML mirror, in standards mode, and the views bar and
// the language switchers lead to them — Chrome no longer applies client-side
// XSLT, so a link to the XML would show a visitor nothing.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, LANGS } = require('./config');
const { renderPage } = require('./xslt-pages');

const data = (file) => path.join(ROOT, 'assets/data', file);

for (const lang of LANGS) {
  for (const [theme, suffix] of [
    ['rich', ''],
    ['minimal', '-minimal'],
  ]) {
    const name = `resume-${lang}${suffix}`;
    test(`${name}.html is what its stylesheet makes of ${name}.xml`, () => {
      const page = fs.readFileSync(data(`${name}.html`), 'utf8');
      assert.equal(page, renderPage(theme, data(`${name}.xml`)), 'run the generator');
      assert.ok(page.startsWith('<!DOCTYPE html>\n<html'));
      assert.ok(page.includes(`<html lang="${lang}"`));
    });

    test(`${name}.html: its links lead to pages, not to XML`, () => {
      const page = fs.readFileSync(data(`${name}.html`), 'utf8');
      for (const other of LANGS)
        assert.ok(
          page.includes(`href="/assets/data/resume-${other}${suffix || ''}.html"`) ||
            page.includes(`href="/assets/data/resume-${other}.html"`),
          `no link to the ${other} page`,
        );
      const bar = page.match(/<nav class="views-bar"[\s\S]*?<\/nav>/)[0];
      assert.ok(!/href="[^"]*\.xml"/.test(bar), 'the views bar links to XML');
    });
  }
}

// The built pages of the app (app/, committed) carry their own HTML: a visitor
// sees the CV before the app's JavaScript has arrived. The reader pages are
// not drawn (see route-pages-lib.mjs). Read from the build output, since that
// is what GitHub Pages serves.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, LANGS } = require('./config');

const page = (rel) => fs.readFileSync(path.join(ROOT, 'app', rel), 'utf8');
const rootOf = (html) => {
  const at = html.indexOf('<div id="root">');
  assert.ok(at >= 0, 'no #root in the page');
  return html.slice(at, html.indexOf('<noscript>', at));
};

for (const lang of LANGS) {
  test(`${lang}: the interactive page is drawn in its HTML, timeline included`, () => {
    const root = rootOf(page(`${lang}/index.html`));
    assert.match(root, /<h1[^>]*>[^<]+<\/h1>/);
    assert.ok((root.match(/class="timeline-bar"/g) || []).length > 20, 'the timeline is not drawn');
  });

  test(`${lang}: the reader page is left to the app, its picture preloaded from the head`, () => {
    const html = page(`${lang}/pdf/index.html`);
    assert.match(html, /<div id="root"><\/div>/);
    assert.ok(
      html.includes(`as="image" href="/assets/cv/previews/cv_grosjean_baptiste_${lang}-1.webp"`),
    );
  });

  test(`${lang}: no drawn page is left on a loading message`, () => {
    assert.ok(!rootOf(page(`${lang}/index.html`)).includes('aria-busy'));
  });
}

test('the page that only redirects to a language is left empty', () => {
  assert.match(page('index.html'), /<div id="root"><\/div>/);
});

test('a drawn timeline is opened on today before the first paint', () => {
  assert.match(
    page('fr/index.html'),
    /<script>[\s\S]*?\.timeline-scroll[\s\S]*?scrollLeft = \w+\.scrollWidth/,
  );
});

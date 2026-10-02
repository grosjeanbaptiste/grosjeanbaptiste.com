// The views bar: every display of the CV — classic HTML, interactive (React),
// XSLT rich, XSLT minimal, PDF — is just a way of showing the same CV, so each
// HTML display carries the same bar, in the same place, with the same buttons.
//
// One registry (scripts/lib/views.js) feeds three renderers: the static
// generator, the XML mirrors the XSLT themes read, and the React export. These
// tests hold the classic page and both XSLT themes to that registry; the React
// side is held to it by react/src/ui/views-bar.spec.tsx.
// Requires `xsltproc` on PATH.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS, langOutFile } = require('./config');
const I18N = require('./i18n');
const { VIEWS, viewsOf } = require('./views');

// The bar's links, as [{ href, label, current }], from any rendered page.
function barOf(html) {
  const bar = html.match(/<nav class="views-bar"[\s\S]*?<\/nav>/);
  assert.ok(bar, 'no <nav class="views-bar"> on the page');
  return [...bar[0].matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].map(([, attrs, label]) => ({
    href: attrs.match(/href="([^"]*)"/)?.[1],
    label: label.trim(),
    current: /aria-current="page"/.test(attrs),
  }));
}

const expected = (lang, current) =>
  viewsOf(lang).map((v) => ({ href: v.href, label: v.label, current: v.id === current }));

const xslt = (theme, lang) => {
  const xsl = path.join(
    ROOT,
    `assets/xslt/resume-transform${theme === 'xsltMinimal' ? '-minimal' : ''}.xsl`,
  );
  const xml = path.join(
    ROOT,
    `assets/data/resume-${lang}${theme === 'xsltMinimal' ? '-minimal' : ''}.xml`,
  );
  return execFileSync('xsltproc', [xsl, xml], { encoding: 'utf8' });
};

test('the registry lists the five displays, classic first', () => {
  assert.deepEqual(
    VIEWS.map((v) => v.id),
    ['classic', 'interactive', 'xsltRich', 'xsltMinimal', 'pdf'],
  );
});

for (const lang of LANGS) {
  test(`every display has a ${lang} label`, () => {
    for (const view of viewsOf(lang)) assert.ok(view.label, `${lang}: no label for ${view.id}`);
    assert.ok(I18N[lang].views.title, `${lang}: no title for the bar`);
  });

  test(`the classic ${lang} page shows the bar, itself current`, () => {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.deepEqual(barOf(html), expected(lang, 'classic'));
  });

  for (const theme of ['xsltRich', 'xsltMinimal']) {
    test(`the ${theme} ${lang} page shows the same bar, itself current`, () => {
      assert.deepEqual(barOf(xslt(theme, lang)), expected(lang, theme));
    });

    test(`the ${theme} ${lang} page styles the bar with the shared sheet`, () => {
      const html = xslt(theme, lang);
      assert.ok(html.includes('href="/css/views-bar.css"'), 'views-bar.css not linked');
      assert.ok(html.includes('href="/css/variables.css"'), 'the bar would miss the DSL palette');
    });

    // fonts.css serves Roboto, which sits in the XSLT theme's own font stack
    // behind -apple-system: harmless on macOS, but on Linux it swaps Arial for
    // Roboto across the whole page and re-paginates the printed sheet (CI's
    // print-fit-xslt.test.js caught a third page). The bar must not do that.
    test(`the ${theme} ${lang} page leaves the theme's own fonts alone`, () => {
      assert.doesNotMatch(xslt(theme, lang), /href="\/css\/fonts\.css"/);
    });

    test(`the ${theme} ${lang} page drops its own ⇄ theme switch`, () => {
      assert.doesNotMatch(xslt(theme, lang), /⇄/);
    });

    test(`the ${theme} ${lang} page drops its own ↩ link to the HTML site`, () => {
      assert.doesNotMatch(xslt(theme, lang), /↩/);
    });
  }

  test(`the classic ${lang} page no longer scatters display links`, () => {
    const html = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.doesNotMatch(html, /nav-app/, 'the old nav link to /app/ is still there');
    const sidebar = html.slice(html.indexOf('<aside'), html.indexOf('</aside>'));
    assert.doesNotMatch(sidebar, /resume-[a-z]+\.xml/, 'the sidebar still links the XSLT view');
  });
}

test('the classic site loads the shared sheet', () => {
  assert.match(
    fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8'),
    /@import "views-bar\.css"/,
  );
});

test('the bar never prints', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/views-bar.css'), 'utf8');
  assert.match(css, /@media print\s*\{[^}]*\.views-bar[^{]*\{[^}]*display:\s*none/);
});

test('the bar uses the system font, so it looks the same without any web font', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/views-bar.css'), 'utf8');
  assert.match(css, /font-family:\s*system-ui, sans-serif;/);
  assert.doesNotMatch(css, /Roboto/);
});

// Behavioural tests for the live "Print / Save-as-PDF" path of the rich XSLT
// theme. Run with `node --test` (requires `xsltproc` on PATH).
//
// The site ships pre-built LaTeX PDFs (assets/cv/cv_grosjean_baptiste_*.pdf),
// and those stay. On top of them, opening the XML in an XSLT-capable browser
// must offer a *live* PDF: a toolbar button that triggers window.print(), plus
// an @media print / @page block that turns the on-screen two-column view into a
// clean A4 sheet. This is generated straight from the XSLT — no build step, so
// the PDF always tracks the XML. These tests guard both halves and assert the
// pre-built LaTeX download link is NOT removed (non-regression).

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const XSL = path.join(ROOT, 'assets/xslt/resume-transform.xsl');

function render(lang) {
  const xml = path.join(ROOT, `assets/data/resume-${lang}.xml`);
  try {
    return execFileSync('xsltproc', [XSL, xml], { encoding: 'utf8' });
  } catch (err) {
    // "spawnSync xsltproc ENOENT" says nothing about what to do next, and it
    // reads like six broken assertions rather than one missing package.
    if (err.code === 'ENOENT') {
      throw new Error(
        'xsltproc is not installed — it renders the XSLT theme these tests check (apt: xsltproc, brew: libxslt)',
      );
    }
    throw err;
  }
}

test('rich theme exposes a live print/PDF button wired to window.print()', () => {
  const html = render('en');
  assert.match(html, /window\.print\(\)/, 'no window.print() trigger in the toolbar');
});

test('print styles size the sheet to A4', () => {
  const html = render('en');
  assert.match(html, /@page\s*\{[^}]*size:\s*A4/i, 'no @page A4 rule');
});

test('print styles force colours to render (print-color-adjust: exact)', () => {
  const html = render('en');
  assert.match(html, /print-color-adjust:\s*exact/i, 'sidebar tint would drop out when printed');
});

test('print styles keep an entry from splitting across a page break', () => {
  const html = render('en');
  assert.match(html, /break-inside:\s*avoid/i, 'no break-inside guard for items');
});

test('the pre-built LaTeX PDF download link is preserved (non-regression)', () => {
  for (const lang of ['en', 'fr']) {
    const html = render(lang);
    assert.match(
      html,
      new RegExp(`cv_grosjean_baptiste_${lang}\\.pdf`),
      `LaTeX download link dropped for ${lang}`,
    );
  }
});

test('the print label is localized in every toolbar language', () => {
  const expected = {
    en: 'Print / PDF',
    fr: 'Imprimer / PDF',
    nl: 'Afdrukken / PDF',
    es: 'Imprimir / PDF',
    de: 'Drucken / PDF',
    zh: '打印 / PDF',
  };
  for (const [lang, label] of Object.entries(expected)) {
    const html = render(lang);
    assert.ok(html.includes(label), `missing "${label}" for ${lang}`);
  }
});

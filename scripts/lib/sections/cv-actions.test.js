// The floating CV actions: the pre-built LaTeX PDF download, and the live
// browser print/PDF button next to it.
//
// The download link is the long-standing behaviour and must survive — the print
// button is an addition, never a replacement. Both live in the CV-DOWNLOAD
// marker block so they render as one control cluster.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateCvDownload } = require('./cv-download');
const I18N = require('../i18n');

const widgetsCss = fs.readFileSync(
  path.resolve(__dirname, '../../../css/widgets.css'),
  'utf8',
);

const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'];

test('the pre-built LaTeX PDF download link is preserved', () => {
  for (const lang of LANGS) {
    const html = generateCvDownload(lang);
    assert.match(
      html,
      new RegExp(`href="/assets/cv/cv_grosjean_baptiste_${lang}\\.pdf"`),
      `${lang}: the LaTeX PDF link went missing`,
    );
    assert.match(html, /\bdownload\b/, `${lang}: lost the download attribute`);
  }
});

test('a print/PDF button is rendered next to the download link', () => {
  const html = generateCvDownload('en');
  assert.match(html, /window\.print\(\)/, 'no window.print() trigger');
  assert.match(html, /class="cv-print-button"/, 'no cv-print-button element');
  assert.match(html, /<button[^>]+type="button"/, 'the trigger must be a button');
});

test('the print button label is localized in every language', () => {
  for (const lang of LANGS) {
    const label = I18N[lang].printPdf;
    assert.ok(label, `${lang}: no printPdf label`);
    assert.ok(
      generateCvDownload(lang).includes(label),
      `${lang}: printPdf label "${label}" missing from the rendered markup`,
    );
  }
});

test('the two actions are distinguishable labels, not the same string', () => {
  for (const lang of LANGS) {
    assert.notEqual(
      I18N[lang].printPdf,
      I18N[lang].downloadCV,
      `${lang}: print and download share a label — users cannot tell them apart`,
    );
  }
});

test('the print button is styled, not shipped bare', () => {
  // It is a <button>, so without an explicit rule it renders with the browser's
  // default chrome next to a styled anchor — obviously broken, and easy to miss
  // because the markup test above would still pass.
  assert.match(
    widgetsCss,
    /\.cv-print-button[^{]*\{/,
    'css/widgets.css has no rule for .cv-print-button',
  );
  assert.match(
    widgetsCss,
    /\.cv-actions[^{]*\{[^}]*position:\s*fixed/,
    '.cv-actions must own the fixed positioning the single button used to have',
  );
});

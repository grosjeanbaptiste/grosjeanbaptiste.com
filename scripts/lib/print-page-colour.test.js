// The printed sheet is white, in both print paths.
//
// This is a deliberate departure from the LaTeX CV, which sets
// \pagecolor{BackgroundColor} (#E2E2E2) and prints on a light grey ground. On
// paper that grey costs a full-bleed ink wash on every sheet for no legibility
// gain, so the two browser print paths print on white instead. Everything else
// — palette, geometry, column ratio, content selection — still tracks the PDF;
// print-parity.test.js owns those.
//
// Both paths are asserted together because they drifted apart once already: the
// XSLT sheet printed white while the HTML sheet printed grey, and nothing said
// so. Whatever the colour is, it has to be the same one in both.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderXslt } = require('./print-fit-harness');

const ROOT = path.resolve(__dirname, '../..');
const printCss = fs.readFileSync(path.join(ROOT, 'css/print.css'), 'utf8');

// #fff / #ffffff / white, as the value of the page-colour custom property.
const WHITE = /--page-color:\s*(#fff(?:fff)?|white)\s*[;}]/i;

test('the HTML print sheet lays down a white page colour', () => {
  assert.match(
    printCss,
    WHITE,
    'the printed page is not white — --page-color still carries the LaTeX grey',
  );
});

test('the page colour still reaches every sheet, not just the recto', () => {
  // Non-regression: white is the browser default for the recto, so a broken
  // fixed layer would look correct until someone changed the colour back and
  // the verso silently lost it again. Keep the mechanism asserted.
  assert.match(
    printCss,
    /body::before[^}]*position:\s*fixed/,
    'nothing paints the page colour across every sheet',
  );
  assert.match(
    printCss,
    /body::before[^}]*background:\s*var\(--page-color\)/,
    'the fixed layer no longer takes its colour from --page-color',
  );
});

test('the XSLT print sheet prints on the same white', () => {
  const html = renderXslt('en');
  const block = /@media print\s*\{([\s\S]*)\}\s*<\/style>/.exec(html);
  assert.ok(block, 'no @media print block in the rendered XSLT theme');
  assert.match(
    block[1],
    /html,\s*body\s*\{[^}]*background:\s*(#fff(?:fff)?|white)\b/i,
    'the XSLT print sheet no longer forces a white ground',
  );
});

// The vertical CV embedded the site's 837 px photo — 531 ppi for a 4 cm print,
// 160 kB of a 376 kB file that every reader of the PDF downloads. The LaTeX
// build now takes a copy sized for print (assets/images/profil-print.jpeg,
// about 300 ppi at 4 cm). Read back from the shipped PDFs with poppler.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { LANGS, OUTPUT_DIR, PROFILE_IMG } = require('./pdf/config');

const pdfOf = (lang) => path.join(OUTPUT_DIR, `cv_grosjean_baptiste_${lang}.pdf`);
// The photo as the PDF holds it: [width px, x-ppi].
const photoOf = (lang) => {
  const row = execFileSync('pdfimages', ['-list', pdfOf(lang)], { encoding: 'utf8' })
    .split('\n')
    .find((line) => /\bimage\b/.test(line));
  assert.ok(row, `${lang}: no photo in the PDF`);
  const cols = row.trim().split(/\s+/);
  return { width: Number(cols[3]), ppi: Number(cols[12]) };
};

test('the LaTeX build takes the photo sized for print', () => {
  assert.equal(path.basename(PROFILE_IMG), 'profil-print.jpeg');
  assert.ok(fs.existsSync(PROFILE_IMG), 'assets/images/profil-print.jpeg is missing');
});

for (const lang of LANGS) {
  test(`${lang}: the PDF's photo is print resolution, not more`, () => {
    const { ppi } = photoOf(lang);
    assert.ok(ppi >= 280 && ppi <= 360, `the photo is embedded at ${ppi} ppi`);
  });

  test(`${lang}: the PDF stays under 300 kB`, () => {
    const kB = Math.round(fs.statSync(pdfOf(lang)).size / 1024);
    assert.ok(kB < 300, `cv_grosjean_baptiste_${lang}.pdf weighs ${kB} kB`);
  });
}

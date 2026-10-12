// The timeline and the references sit on a landscape verso in every printable
// version of the CV. This file holds the shipped LaTeX PDFs to it; the browser
// prints are held to it where they are printed (print-verso.test.js,
// print-fit-firefox.test.js, print-fit-xslt.test.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { orientations, SHEET } = require('./print-orientation');

const ROOT = path.resolve(__dirname, '../..');

for (const lang of ['en', 'fr', 'nl', 'es', 'de', 'zh']) {
  test(`the ${lang} PDF has an upright recto and a landscape verso`, () => {
    const pdf = path.join(ROOT, `assets/cv/cv_grosjean_baptiste_${lang}.pdf`);
    assert.deepEqual(orientations(pdf), SHEET);
  });
}

test('a PDF pdfinfo cannot read is reported, not taken for a portrait one', () => {
  assert.throws(() => orientations(path.join(ROOT, 'package.json')));
});

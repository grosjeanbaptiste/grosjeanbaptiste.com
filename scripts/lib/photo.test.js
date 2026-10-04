// The photo is shown at 250px at most (80px in the interactive view), but the
// original is 837px and 160 kB. Each display offers sized WebP copies and lets
// the browser pick; the JPEG stays the fallback, and the original the LaTeX
// PDF and the social previews use.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, LANGS, langOutFile } = require('./config');

const WIDTHS = [160, 320, 500];
const variant = (w) => path.join(ROOT, `assets/images/profil-${w}.webp`);
const SRCSET = WIDTHS.map((w) => `/assets/images/profil-${w}.webp ${w}w`).join(', ');

for (const w of WIDTHS) {
  test(`the ${w}px copy of the photo exists and stays light`, () => {
    assert.ok(fs.statSync(variant(w)).size < 40 * 1024, `profil-${w}.webp is over 40 kB`);
  });
}

for (const lang of LANGS) {
  test(`${lang}: the classic page offers the sized copies of the photo`, () => {
    const img = fs
      .readFileSync(langOutFile(lang), 'utf8')
      .match(/<img[^>]*id="profile-picture"[^>]*>/);
    assert.ok(img, 'no profile picture on the page');
    assert.ok(img[0].includes(`srcset="${SRCSET}"`), `no srcset on ${img[0]}`);
    assert.match(img[0], /src="\/assets\/images\/profil\.jpeg"/, 'the JPEG fallback went missing');
  });
}

test('the XSLT theme offers the sized copies of the photo', () => {
  const xsl = fs.readFileSync(path.join(ROOT, 'assets/xslt/resume-transform.xsl'), 'utf8');
  assert.ok(xsl.includes(`srcset="${SRCSET}"`));
});

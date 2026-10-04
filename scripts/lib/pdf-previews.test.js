// Every shipped PDF has a picture of each page, shown by the reader while
// PDF.js loads and draws the real thing. A picture of an older PDF would show
// the wrong CV for a second, so each one is tied to its PDF by SHA-256 in the
// manifest — rebuild a PDF without its pictures and this fails.

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { OUTPUT_DIR } = require('./pdf/config');
const { webpSize } = require('./webp-size');

const MANIFEST = path.join(OUTPUT_DIR, 'previews', 'manifest.json');
const manifest = () => JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const shipped = fs.readdirSync(OUTPUT_DIR).filter((f) => /^cv_grosjean_baptiste_.*\.pdf$/.test(f));
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pdfPages = (file) =>
  Number(/^Pages:\s+(\d+)/m.exec(execFileSync('pdfinfo', [file], { encoding: 'utf8' }))[1]);
const pdfRatio = (file) => {
  const m = /^Page size:\s+([\d.]+) x ([\d.]+)/m.exec(
    execFileSync('pdfinfo', [file], { encoding: 'utf8' }),
  );
  return Number(m[1]) / Number(m[2]);
};

test('the manifest lists exactly the shipped PDFs', () => {
  assert.deepEqual(Object.keys(manifest().files).sort(), shipped.sort());
});

for (const name of shipped) {
  const pdf = path.join(OUTPUT_DIR, name);

  test(`${name}: its pictures come from the PDF as shipped`, () => {
    assert.equal(manifest().files[name]?.sha256, sha(pdf));
  });

  test(`${name}: one picture per page`, () => {
    assert.equal(manifest().files[name]?.pages.length, pdfPages(pdf));
  });

  test(`${name}: each picture is the page's shape, at the size the manifest says, and light`, () => {
    for (const page of manifest().files[name]?.pages ?? []) {
      const file = path.join(OUTPUT_DIR, '..', '..', page.src);
      const { width, height } = webpSize(fs.readFileSync(file));
      assert.deepEqual([width, height], [page.width, page.height], page.src);
      assert.ok(
        Math.abs(width / height - pdfRatio(pdf)) < 0.01,
        `${page.src} is not the page's shape`,
      );
      assert.ok(fs.statSync(file).size < 160 * 1024, `${page.src} is over 160 kB`);
    }
  });
}

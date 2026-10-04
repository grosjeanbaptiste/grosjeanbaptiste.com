// Reading a WebP's dimensions from its header, without an image library: the
// preview tests run in CI, where no WebP tool is installed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { webpSize } = require('./webp-size');

const photo = (w) => fs.readFileSync(path.join(__dirname, `../../assets/images/profil-${w}.webp`));

test('a lossy WebP reports its width and height', () => {
  assert.deepEqual(webpSize(photo(320)), { width: 320, height: 339 });
});

test('a file that is not a WebP is refused', () => {
  assert.throws(() => webpSize(Buffer.from('%PDF-1.4 not an image')), /not a WebP/);
});

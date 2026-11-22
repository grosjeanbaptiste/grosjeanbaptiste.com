// The theme a visitor chose follows them from one display to another: the XSLT
// themes keep it under the key js/theme.js and the React app use.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

for (const sheet of ['resume-transform.xsl', 'resume-transform-minimal.xsl']) {
  test(`${sheet} reads and writes the shared theme key`, () => {
    const xsl = read(`assets/xslt/${sheet}`);
    assert.match(xsl, /localStorage\.getItem\('theme'\)/);
    assert.match(xsl, /localStorage\.setItem\('theme'/);
    assert.doesNotMatch(xsl, /xslt-theme/);
  });
}

test('the shared key is the one the classic page and the app use', () => {
  assert.match(read('js/theme.js'), /localStorage\.getItem\('theme'\)/);
  assert.match(read('react/src/ui/theme.ts'), /const KEY = 'theme'/);
});

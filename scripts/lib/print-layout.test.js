// js/print-layout.js moves the header banner and Education into their LaTeX
// positions just before printing. Two ways that goes silently wrong: the script
// exists but no page loads it, or it moves nodes without restoring them, which
// would leave the on-screen page rearranged after the print dialog closes.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const PAGES = ['index.html', ...['fr', 'nl', 'es', 'de', 'zh'].map((l) => `${l}/index.html`)];
const script = fs.readFileSync(path.join(ROOT, 'js/print-layout.js'), 'utf8');

test('every localized page loads the print layout script', () => {
  const missing = PAGES.filter(
    (p) => !fs.readFileSync(path.join(ROOT, p), 'utf8').includes('/js/print-layout.js'),
  );
  assert.deepEqual(missing, [], `pages that would print unrearranged: ${missing.join(', ')}`);
});

test('the script restores the page after printing', () => {
  assert.match(script, /addEventListener\(['"]beforeprint['"]/, 'nothing prepares the layout');
  assert.match(script, /addEventListener\(['"]afterprint['"]/, 'nothing restores it');
});

test('it relocates exactly the nodes CSS cannot move', () => {
  for (const hook of ['profile-picture', 'contact-info', 'education']) {
    assert.ok(script.includes(hook), `no handling for the ${hook} node`);
  }
});

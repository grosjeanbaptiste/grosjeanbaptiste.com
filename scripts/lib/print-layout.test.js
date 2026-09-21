// js/print-layout.js moves Education and the degrees summary into their LaTeX
// positions just before printing. Two ways that goes silently wrong: the script
// exists but no page loads it, or it moves nodes without restoring them, which
// would leave the on-screen page rearranged after the print dialog closes.
//
// It no longer builds a full-width header banner. Firefox will not fragment the
// two-column block across sheets, so a banner above it pushed the whole block
// to its own page and the CV printed on three sheets instead of two.

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
  for (const hook of ['contact-info', 'education']) {
    assert.ok(script.includes(hook), `no handling for the ${hook} node`);
  }
});

test('no header banner is built, since Firefox pays a whole page for it', () => {
  assert.doesNotMatch(
    script,
    /print-header/,
    'a banner above the two columns costs Firefox an entire sheet — see print-fit-firefox.test.js',
  );
});

test('the degrees summary is filed under the Education heading', () => {
  // In the PDF the qualifications appear in the sidebar under Education, not
  // among the contact details where the page keeps them.
  assert.match(
    script,
    /\.contact-info \.degree/,
    'the degree lines would print among the contact details instead',
  );
});

// The print stylesheet names the LaTeX CV's typefaces (Roboto Slab for the name
// and headings, Lato for running text). Naming a font the site does not ship is
// a silent downgrade: the browser quietly falls back and the printed sheet stops
// matching the PDF, with nothing in CI to say so. These tests require every
// family print.css asks for to be backed by a self-hosted @font-face whose file
// is actually on disk.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const printCss = fs
  .readdirSync(path.join(ROOT, 'css'))
  .filter((f) => /^print.*\.css$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8'))
  .join('\n');
const fontsCss = fs.readFileSync(path.join(ROOT, 'css/fonts.css'), 'utf8');

// Quoted families in every font-family stack of the print stylesheet.
function familiesAskedFor() {
  const out = new Set();
  for (const decl of printCss.matchAll(/font-family:([^;]+);/g)) {
    for (const m of decl[1].matchAll(/"([^"]+)"/g)) out.add(m[1]);
  }
  return [...out];
}

function familiesDeclared() {
  return new Set([...fontsCss.matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1]));
}

test('every family the print sheet asks for is self-hosted', () => {
  const declared = familiesDeclared();
  const missing = familiesAskedFor().filter((f) => !declared.has(f));
  assert.deepEqual(
    missing,
    [],
    `print.css asks for these but css/fonts.css ships no @font-face: ${missing.join(', ')}`,
  );
});

test('every self-hosted font file exists on disk', () => {
  const missing = [];
  for (const m of fontsCss.matchAll(/url\("(\/assets\/fonts\/[^"]+)"\)/g)) {
    const file = path.join(ROOT, m[1].replace(/^\//, ''));
    if (!fs.existsSync(file)) missing.push(m[1]);
  }
  assert.deepEqual(missing, [], `declared but absent: ${missing.join(', ')}`);
});

test('the LaTeX typefaces are the ones actually requested', () => {
  // Guards against someone "simplifying" the stacks back to the screen font:
  // the sheet would still render, just no longer like the PDF.
  const asked = familiesAskedFor();
  for (const family of ['Roboto Slab', 'Lato']) {
    assert.ok(
      asked.includes(family),
      `print.css no longer asks for ${family}, which the LaTeX preamble sets`,
    );
  }
});

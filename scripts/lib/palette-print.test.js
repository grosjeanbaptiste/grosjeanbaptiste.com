// The dark palette is for a screen. On paper it is cream text on whatever the
// sheet's own rules painted — the two XSLT themes printed a timeline whose
// labels could not be read, for any reader whose system was in dark mode. So
// css/variables.css, which every display loads, declares the dark values for
// screens only, and a print always starts from the light ones.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.resolve(__dirname, '../../css/variables.css'), 'utf8');

test('the dark theme a reader picks is declared for screens only', () => {
  assert.match(css, /@media screen \{\s*\[data-theme="dark"\] \{/);
  assert.doesNotMatch(css, /^\[data-theme="dark"\]/m);
});

test('the dark theme the system asks for is declared for screens only', () => {
  assert.match(css, /@media screen and \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(css, /@media \(prefers-color-scheme: dark\)/);
});

test('the light palette is declared for every medium', () => {
  assert.match(css, /^:root \{\s*\/\* Colors \*\/\s*--primary-color:/m);
});

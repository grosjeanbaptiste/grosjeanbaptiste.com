const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPreamble } = require('./preamble');

// xeCJK files the en dash among CJK punctuation and squeezes it, so in
// "Maredsous–Dinant" it was printed over the end of "Maredsous".
test('the Chinese CV sets the en dash as a Latin character', () => {
  assert.match(buildPreamble('zh'), /\\xeCJKsetcharclass\{"2013\}\{"2013\}\{0\}/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { tex } = require('./tex');

// Under xeCJK the dash typed as a character went to the Chinese font and was
// squeezed over the letter before it ("Maredsous–Dinant" on the zh timeline);
// the LaTeX commands set the dash in the Latin font, in every language.
test('an en dash is written as \\textendash, so the Latin font sets it', () => {
  assert.equal(tex('Maredsous–Dinant'), 'Maredsous\\textendash{}Dinant');
});

test('an em dash is written as \\textemdash, for the same reason', () => {
  assert.equal(tex('a — b'), 'a \\textemdash{} b');
});

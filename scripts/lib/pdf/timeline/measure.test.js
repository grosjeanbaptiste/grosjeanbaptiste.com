// Rows are packed before TeX runs, so a label's width is estimated from its
// characters. Underestimating would let two labels overprint; these pin the
// two ways an estimate goes wrong.
const test = require('node:test');
const assert = require('node:assert/strict');
const { labelWidth } = require('./measure');

test('a longer label measures wider', () => {
  assert.ok(
    labelWidth({ strong: 'Xtrada', rest: 'Data Scientist' }) >
      labelWidth({ strong: 'Xtrada', rest: '' }),
  );
});

test('a Chinese character measures wider than a Latin letter', () => {
  assert.ok(labelWidth({ strong: '学', rest: '' }) > labelWidth({ strong: 'a', rest: '' }));
});

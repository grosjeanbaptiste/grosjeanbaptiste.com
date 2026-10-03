// On paper there is no hover: every bar carries its label. A label that does
// not fit inside its bar sits beside it, so rows are packed by what a bar and
// its label occupy together — never by the bar alone.
const test = require('node:test');
const assert = require('node:assert/strict');
const { packLane } = require('./rows');

// 1 mm per month, labels 1 mm per character: easy to reason about.
const scale = { x: (month) => month, labelWidth: (bar) => bar.strong.length, trackEnd: 100 };
const bar = (id, start, end, strong = id) => ({ id, start, end: end - 1, strong, rest: '' });

const placed = (bars) => Object.fromEntries(packLane(bars, scale).map((b) => [b.id, b]));

test('two bars that overlap in time go on two rows', () => {
  const p = placed([bar('a', 0, 20), bar('b', 10, 30)]);
  assert.notEqual(p.a.row, p.b.row);
});

test('a bar that starts after the previous one ends shares its row', () => {
  const p = placed([bar('a', 0, 20), bar('b', 25, 40)]);
  assert.equal(p.b.row, p.a.row);
});

test('a label that fits its bar is written inside it', () => {
  assert.equal(placed([bar('a', 0, 20)]).a.label.place, 'inside');
});

test('a label longer than its bar is written after it', () => {
  assert.equal(placed([bar('a', 0, 3, 'a long label')]).a.label.place, 'right');
});

test('the next bar on a row clears the label written after the previous one', () => {
  const p = placed([bar('a', 0, 3, 'a long label'), bar('b', 6, 30)]);
  assert.notEqual(p.b.row, p.a.row);
});

test('a label that would run off the page is written before its bar', () => {
  assert.equal(placed([bar('a', 97, 100, 'a long label')]).a.label.place, 'left');
});

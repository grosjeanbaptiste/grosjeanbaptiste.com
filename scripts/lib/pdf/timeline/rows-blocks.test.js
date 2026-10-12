// A block too narrow for its year was drawn as a bare grey stub, saying
// nothing. Its year is now written after it when the row leaves room there.
const test = require('node:test');
const assert = require('node:assert/strict');
const { packGroupsOnPaper } = require('./rows');

// 1 mm per month, labels 1 mm per character.
const scale = {
  x: (month) => month,
  labelWidth: (b) => b.strong.length + b.rest.length,
  trackEnd: 100,
};
const bar = (id, start, end) => ({ id, start, end: end - 1, strong: id, rest: '' });
const band = (id, start, end) => ({ ...bar(id, start, end), kind: 'block' });
const laid = (bands) =>
  packGroupsOnPaper([{ head: bar('host', 0, 60), bands, children: [] }], scale).bars.filter(
    (b) => b.kind === 'block',
  );

test('a block too narrow for its year has it written after it', () => {
  const [stub] = laid([band('16-17', 10, 13)]);
  assert.deepEqual([stub.strong, stub.label.place, stub.label.x], ['16-17', 'right', 14.2]);
});

test('a narrow block followed at once by another keeps no label', () => {
  const [stub] = laid([band('16-17', 10, 13), band('17-18', 13, 40)]);
  assert.equal(stub.strong, '');
});

test('a narrow block at the end of the track keeps no label', () => {
  const [stub] = laid([band('16-17', 96, 99)]);
  assert.equal(stub.strong, '');
});

// A label with room on neither side of its bar used to be written before it
// all the same, and ran off the start of the track into the lane's title. Its
// rest — a degree's type and speciality, a role — is now cut to the room left.
const test = require('node:test');
const assert = require('node:assert/strict');
const { packLane } = require('./rows');

// 1 mm per month, labels 1 mm per character.
const scale = {
  x: (month) => month,
  labelWidth: (bar) => bar.strong.length + bar.rest.length,
  trackEnd: 100,
};
const long = { id: 'a', start: 40, end: 89, strong: 'School', rest: 'x'.repeat(80) };
const [placed] = packLane([{ ...long, start: 30, end: 31 }], scale);

test('a label too long for either side stays on the track', () => {
  assert.ok(placed.label.from >= 0, `starts at ${placed.label.from}`);
  assert.ok(placed.label.to <= 100, `ends at ${placed.label.to}`);
});

test('it keeps its name, and its rest marked as cut', () => {
  assert.equal(placed.strong, 'School');
  assert.match(placed.rest, /^x+…$/);
});

test('a label that fits beside its bar is left whole', () => {
  const [short] = packLane([{ ...long, start: 30, end: 31, rest: 'Master' }], scale);
  assert.equal(short.rest, 'Master');
});

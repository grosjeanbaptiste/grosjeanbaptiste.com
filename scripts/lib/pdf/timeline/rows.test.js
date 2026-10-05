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

// A group: an entry with what it carried under it. On paper it is a block —
// its own rows, and the width of its bars and their labels together.
const { packGroupsOnPaper } = require('./rows');
const groupOf = (head, ...children) => ({ head, children });
const laid = (groups) => packGroupsOnPaper(groups, scale);
const byId = (lane) => Object.fromEntries(lane.bars.map((b) => [b.id, b]));

test('what an entry carried goes on the row under it', () => {
  const b = byId(laid([groupOf(bar('host', 0, 30), bar('child', 5, 20))]));
  assert.deepEqual([b.host.row, b.child.row, b.child.depth], [0, 1, 1]);
});

test('two things an entry carried at the same time take two rows under it', () => {
  const b = byId(laid([groupOf(bar('host', 0, 30), bar('one', 5, 20), bar('two', 10, 25))]));
  assert.deepEqual([b.one.row, b.two.row].sort(), [1, 2]);
});

test('the next entry goes below a group it overlaps, never through it', () => {
  const b = byId(
    laid([groupOf(bar('host', 0, 30), bar('child', 5, 20)), groupOf(bar('next', 10, 40))]),
  );
  assert.equal(b.next.row, 2);
});

test('an entry after a group shares its first row', () => {
  const b = byId(
    laid([groupOf(bar('host', 0, 30), bar('child', 5, 20)), groupOf(bar('later', 40, 60))]),
  );
  assert.equal(b.later.row, 0);
});

test('a lane says how many rows its groups need', () => {
  assert.equal(laid([groupOf(bar('host', 0, 30), bar('child', 5, 20))]).rows, 2);
});

test('a group is outlined over its rows, its bars and their labels', () => {
  const [outline] = laid([groupOf(bar('host', 0, 30), bar('c', 28, 30, 'a long label'))]).outlines;
  assert.deepEqual([outline.row, outline.rows, outline.x0], [0, 2, 0]);
  assert.ok(outline.x1 > 30, 'the label after the short bar is left outside the outline');
});

test('an entry that carried nothing is not outlined', () => {
  assert.deepEqual(laid([groupOf(bar('alone', 0, 30))]).outlines, []);
});

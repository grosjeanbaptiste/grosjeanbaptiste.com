// The timeline on the verso of the vertical CV: the rows of the screen (packed
// by time, so few of them), and each bar's name fitted where there is room —
// inside the bar, else after it, else before it, else cut short.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOutCompact } = require('./compact');

const FROM = 2020 * 12;
// 48 months on a 96 mm track: 2 mm a month. Every character is 1 mm wide.
const OPTIONS = { track: 96, measure: (text) => [...text].length };
const bar = (name, start, months, extra = {}) => ({
  kind: 'work',
  name,
  title: 'a role',
  start: FROM + start,
  end: FROM + start + months - 1,
  ongoing: false,
  depth: 0,
  row: 0,
  group: name,
  ...extra,
});
const model = (bars, groups = []) => ({
  from: FROM,
  months: 48,
  years: [{ year: 2021, month: 2021 * 12 }],
  lanes: [{ kind: 'work', rows: Math.max(...bars.map((b) => b.row)) + 1, bars, groups }],
});
const laid = (bars, groups) => layOutCompact(model(bars, groups), OPTIONS).lanes[0];
const named = (lane, name) => lane.bars.find((b) => b.name === name);

test('a bar is placed by its months', () => {
  const a = named(laid([bar('abc', 12, 12)]), 'abc');
  assert.deepEqual([a.x0, a.x1], [24, 48]);
});

test('a bar keeps the row the screen gave it', () => {
  const lane = laid([bar('abc', 0, 6), bar('def', 0, 6, { row: 1 })]);
  assert.equal(named(lane, 'def').row, 1);
});

test('a name that fits is written inside its bar', () => {
  const a = named(laid([bar('abc', 0, 12)]), 'abc');
  assert.deepEqual([a.label.place, a.strong], ['inside', 'abc']);
});

test('a bar is named alone, without its role, as on screen', () => {
  assert.equal(named(laid([bar('abc', 0, 12)]), 'abc').rest, '');
});

test('a name too long for its bar is written after it when the row is free there', () => {
  const a = named(laid([bar('a long name', 0, 2)]), 'a long name');
  assert.deepEqual([a.label.place, a.strong], ['right', 'a long name']);
});

test('a name with a neighbour right after it is written before the bar', () => {
  const lane = laid([bar('a long name', 20, 2), bar('next', 22, 20)]);
  assert.equal(named(lane, 'a long name').label.place, 'left');
});

test('a name with no room around its bar is cut short inside it', () => {
  const lane = laid([bar('first', 0, 10), bar('a long name', 10, 4), bar('next', 14, 30)]);
  const a = named(lane, 'a long name');
  assert.equal(a.label.place, 'inside');
  assert.match(a.strong, /^a .*…$/);
  assert.ok([...a.strong].length <= 8 - 2, 'the cut name fits the bar and its padding');
});

test('a name with only part of the room it needs after its bar is cut short there', () => {
  const lane = laid([bar('a long name', 0, 1), bar('next', 5, 30)]);
  const a = named(lane, 'a long name');
  assert.equal(a.label.place, 'right');
  assert.match(a.strong, /…$/);
  assert.ok(a.label.to <= 10, 'it stops before the next bar');
});

test('a bar too small for even a cut name carries none', () => {
  const lane = laid([bar('first', 0, 10), bar('a long name', 10, 1), bar('next', 11, 30)]);
  assert.equal(named(lane, 'a long name').strong, '');
});

test('a name written after its bar keeps the next one from writing before itself over it', () => {
  // "abcdefgh" overflows right of its 2-month bar; the next bar is 10 mm away.
  const lane = laid([bar('abcdefgh', 0, 2), bar('ijklmnop', 8, 2), bar('wall', 10, 30)]);
  const second = named(lane, 'ijklmnop');
  assert.notEqual(second.label.place, 'left');
});

test('a name does not run into the outline of a neighbouring group', () => {
  const groups = [{ group: 'host', start: FROM + 4, end: FROM + 40, row: 0, rows: 2 }];
  const lane = laid([bar('a long name', 0, 2), bar('host', 20, 20, { group: 'host' })], groups);
  // The outline starts 8 mm along: whatever is written must stop before it.
  assert.ok(named(lane, 'a long name').label.to <= 8);
});

test('a name may run across the outline of its own group', () => {
  const groups = [{ group: 'host', start: FROM, end: FROM + 3, row: 0, rows: 2 }];
  const lane = laid([bar('a long name', 0, 2, { group: 'host' })], groups);
  assert.equal(named(lane, 'a long name').label.place, 'right');
});

test('an outline covers its group by its months and its rows', () => {
  const groups = [{ group: 'host', start: FROM, end: FROM + 11, row: 0, rows: 2 }];
  const [outline] = laid([bar('host', 0, 12, { group: 'host' })], groups).outlines;
  assert.deepEqual(outline, { x0: 0, x1: 24, row: 0, rows: 2 });
});

test('the sheet is as tall as its axis, its rows and the gaps between lanes', () => {
  const sheet = layOutCompact(model([bar('abc', 0, 12), bar('def', 0, 12, { row: 1 })]), {
    ...OPTIONS,
    pitch: 3,
  });
  assert.equal(sheet.height, sheet.axis + 2 * 3 + 2);
});

test('each January is marked on the axis', () => {
  const sheet = layOutCompact(model([bar('abc', 0, 12)]), OPTIONS);
  assert.deepEqual(sheet.years, [{ year: 2021, x: 24 }]);
});

test('a bar told apart by its title is written with it', () => {
  const lane = laid([bar('Xtrada', 0, 20, { caption: 'Xtrada · Crafter' })]);
  assert.equal(named(lane, 'Xtrada').strong, 'Xtrada · Crafter');
});

test('with density, a busy year is drawn wider than a quiet one', () => {
  const busy = Array.from({ length: 5 }, (_, i) => bar(`b${i}`, 36, 12, { row: i + 1 }));
  const sheet = layOutCompact(model([bar('long', 0, 48), ...busy]), { ...OPTIONS, density: 0.6 });
  const b0 = sheet.lanes[0].bars.find((b) => b.name === 'b0');
  // The last of four years, to scale, would be 24 mm of 96.
  assert.ok(b0.x1 - b0.x0 > 36, `the busy year is ${b0.x1 - b0.x0} mm wide`);
});

// A block of a degree is a segment of a row of segments: its label stays
// inside it, shortened to the year when its name does not fit.
const block = (name, start, months, caption) =>
  bar(name, start, months, { kind: 'block', depth: 1, row: 1, caption });

test('a block whose name does not fit keeps its year, inside its segment', () => {
  const lane = laid([bar('host', 0, 48), block('22-23', 0, 4, '22-23 · a long name')]);
  const b = named(lane, '22-23');
  assert.deepEqual([b.label.place, b.strong], ['inside', '22-23']);
});

test('a block with room for its name carries it', () => {
  const lane = laid([bar('host', 0, 48), block('22-23', 0, 24, '22-23 · a long name')]);
  assert.equal(named(lane, '22-23').strong, '22-23 · a long name');
});

test('a block too narrow for its year carries no label rather than one beside it', () => {
  const lane = laid([bar('host', 0, 48), block('22-23', 0, 2, '22-23 · a long name')]);
  const b = named(lane, '22-23');
  assert.deepEqual([b.label.place, b.strong], ['inside', '']);
});

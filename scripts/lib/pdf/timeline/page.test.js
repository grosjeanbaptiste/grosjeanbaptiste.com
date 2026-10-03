// The sheet: lanes stacked under a year axis, on one A4 landscape page.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOut, TRACK } = require('./page');

const at = (year, month) => year * 12 + month - 1;
const bar = (id, start, end) => ({ id, start, end, ongoing: false, strong: id, rest: '' });
const timeline = (lanes) => ({ from: at(2020, 3), to: at(2023, 6), lanes });
const crowd = (n) => Array.from({ length: n }, (_, i) => bar(`e${i}`, at(2020, 3), at(2023, 6)));

test('the career fills the width of the track', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: [bar('a', at(2020, 3), at(2023, 6))] }]));
  const [only] = sheet.lanes[0].bars;
  assert.deepEqual([only.x0, Math.round(only.x1)], [0, TRACK]);
});

test('each January gets a mark on the axis', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: [bar('a', at(2020, 3), at(2021, 1))] }]));
  assert.deepEqual(
    sheet.years.map((y) => y.year),
    [2021, 2022, 2023],
  );
});

test('a lane starts below the one before it', () => {
  const sheet = layOut(
    timeline([
      {
        kind: 'work',
        bars: [bar('a', at(2020, 3), at(2021, 1)), bar('b', at(2020, 6), at(2021, 1))],
      },
      { kind: 'education', bars: [bar('c', at(2020, 3), at(2021, 1))] },
    ]),
  );
  const [work, education] = sheet.lanes;
  assert.equal(work.rows, 2);
  assert.ok(education.top < work.top - work.rows * sheet.pitch);
});

test('a short timeline is set in a larger type than a crowded one', () => {
  const short = layOut(timeline([{ kind: 'work', bars: crowd(5) }]));
  const crowded = layOut(timeline([{ kind: 'work', bars: crowd(30) }]));
  assert.ok(short.font > crowded.font);
});

test('the rows never run below the page', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: crowd(30) }]));
  assert.ok(sheet.height <= 170);
});

test('a timeline taller than the page is refused rather than cut off', () => {
  assert.throws(
    () => layOut(timeline([{ kind: 'work', bars: crowd(60) }])),
    /does not fit on one page/,
  );
});

// The sheet: lanes stacked under a year axis, on one A4 landscape page.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOut, TRACK } = require('./page');

const at = (year, month) => year * 12 + month - 1;
const bar = (id, start, end) => ({ id, start, end, ongoing: false, strong: id, rest: '' });
// Each bar an entry of its own; `under` puts bars under the first one.
const timeline = (lanes) => ({
  from: at(2020, 3),
  to: at(2023, 6),
  lanes: lanes.map(({ kind, bars, under = [] }) => ({
    kind,
    groups: bars.map((head, i) => ({ head, children: i === 0 ? under : [] })),
  })),
});
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
  // 40 rows: more than the largest type can stack on the page (34), fewer than
  // the smallest can (46).
  const crowded = layOut(timeline([{ kind: 'work', bars: crowd(40) }]));
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

test('what an entry carried is laid out under it, inside its outline', () => {
  const sheet = layOut(
    timeline([
      {
        kind: 'work',
        bars: [bar('host', at(2020, 3), at(2023, 6))],
        under: [bar('child', at(2021, 1), at(2021, 6))],
      },
    ]),
  );
  const [lane] = sheet.lanes;
  assert.deepEqual(
    lane.bars.map((b) => [b.id, b.row, b.depth]),
    [
      ['host', 0, 0],
      ['child', 1, 1],
    ],
  );
  assert.equal(lane.outlines.length, 1);
});

test('a narrower sheet lays the same timeline out in its own width', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: [bar('a', at(2020, 3), at(2023, 6))] }]), {
    track: 150,
  });
  assert.equal(Math.round(sheet.lanes[0].bars[0].x1), 150);
});

// Labels say "name · role". When no type fits them on the page, the roles go:
// shorter labels need fewer rows — and the sheet says which labels it carries.
const busy = Array.from({ length: 50 }, (_, i) => ({
  ...bar(`e${i}`, at(2020, 3) + (i % 40), at(2020, 3) + (i % 40)),
  rest: 'a role',
}));
const wideWithRole = (b) => (b.rest ? 300 : 1);

test('a sheet that fits says its labels are in full', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: [bar('a', at(2020, 3), at(2023, 6))] }]));
  assert.equal(sheet.labels, 'full');
});

test('a timeline too crowded for its roles keeps the names alone, and says so', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: busy }]), { measure: wideWithRole });
  assert.equal(sheet.labels, 'names');
});

test('with the names alone, no bar carries a role any more', () => {
  const sheet = layOut(timeline([{ kind: 'work', bars: busy }]), { measure: wideWithRole });
  assert.deepEqual([...new Set(sheet.lanes[0].bars.map((b) => b.rest))], ['']);
});

// Even with the names alone, two entries of one name keep their role: without
// it the two bars would read the same.
test('with the names alone, entries that share a name keep their role', () => {
  const twins = [
    { ...bar('Xtrada', at(2020, 3), at(2020, 3)), strong: 'Xtrada', rest: 'Crafter' },
    { ...bar('Xtrada2', at(2021, 3), at(2021, 3)), strong: 'Xtrada', rest: 'Data Scientist' },
  ];
  const sheet = layOut(timeline([{ kind: 'work', bars: [...busy, ...twins] }]), {
    measure: (b) => (b.rest === 'a role' ? 300 : 1),
  });
  assert.equal(sheet.labels, 'names');
  const rests = sheet.lanes[0].bars.filter((b) => b.strong === 'Xtrada').map((b) => b.rest);
  assert.deepEqual(rests.sort(), ['Crafter', 'Data Scientist']);
});

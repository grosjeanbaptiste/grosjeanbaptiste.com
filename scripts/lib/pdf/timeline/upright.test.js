// The upright timeline: a label is never cut, nothing runs off the axis, every
// entry is named, and each entry is outlined with what it carried.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOut, buildUpright } = require('./upright');

const at = (year, month) => year * 12 + month - 1;
const bar = (name, start, end, kind = 'work', rest = '') => ({
  kind,
  start,
  end,
  ongoing: false,
  clipped: false,
  strong: name,
  rest,
  full: { strong: name, rest },
});
const LONG = 'A very long name that a horizontal bar would have to cut short';
const timeline = {
  from: at(2015, 1),
  to: at(2026, 6),
  lanes: [
    {
      kind: 'work',
      groups: [
        {
          head: bar(LONG, at(2020, 1), at(2026, 6), 'work', 'Developer'),
          children: [
            bar('Alpha', at(2021, 1), at(2022, 1), 'project'),
            bar('Beta', at(2022, 6), at(2026, 6), 'project'),
          ],
          bands: [],
        },
        { head: bar('Old job', at(2015, 3), at(2016, 3)), children: [], bands: [] },
      ],
    },
  ],
};
const T = { experience: 'Experience' };

test('no label is cut: no ellipsis, the whole name is there', () => {
  const sheet = layOut(timeline);
  const words = sheet.lanes[0].labels.flatMap((l) => l.lines.flat().map((w) => w.w));
  assert.ok(!words.some((w) => w.includes('…')));
  for (const word of LONG.split(' ')) assert.ok(words.includes(word), word);
});

test('every entry has its label', () => {
  const sheet = layOut(timeline);
  assert.equal(sheet.lanes[0].labels.length, 4);
});

test('the labels stay inside the axis', () => {
  const sheet = layOut(timeline);
  for (const { lines, top } of sheet.lanes[0].labels)
    assert.ok(top - lines.length * 2.7 >= -sheet.height - 1e-6);
});

test('the newest is above the oldest', () => {
  const [lane] = layOut(timeline).lanes;
  const y = (name) => lane.bars.find((b) => b.strong === name).y0;
  assert.ok(y('Beta') > y('Old job'));
});

test('an entry that carried projects is outlined, one alone is not', () => {
  const [lane] = layOut(timeline).lanes;
  assert.deepEqual(lane.groups.map((g) => g.outlined).toSorted(), [false, true]);
  assert.match(buildUpright(layOut(timeline), T), /filldraw/);
});

test('what an entry carried sits beside its head, not under it', () => {
  const [lane] = layOut(timeline).lanes;
  const head = lane.bars.find((b) => b.strong === LONG);
  const alpha = lane.bars.find((b) => b.strong === 'Alpha');
  assert.ok(alpha.dx > head.dx);
});

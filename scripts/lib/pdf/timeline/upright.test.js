// The upright timeline: a label is never cut, nothing runs off the axis, every
// entry is named, and each entry is outlined with what it carried.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOut, buildUpright } = require('./upright');
const { inGroups } = require('./upright-groups');

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
  assert.deepEqual(
    lane.groups
      .filter((g) => g.employer !== true)
      .map((g) => g.outlined)
      .toSorted(),
    [false, true],
  );
  assert.match(buildUpright(layOut(timeline), T), /dash pattern/);
});

test('what an entry carried sits beside its head, not under it', () => {
  const [lane] = layOut(timeline).lanes;
  const head = lane.bars.find((b) => b.strong === LONG);
  const alpha = lane.bars.find((b) => b.strong === 'Alpha');
  assert.ok(alpha.dx > head.dx);
});

test('the experiences of one employer stand side by side in one solid outline', () => {
  const job = (strong, start, end) => ({
    head: { kind: 'work', strong, start, end, label: strong },
    children: [],
    bands: [],
  });
  const { groups } = inGroups(
    [job('Acme', 0, 5), job('Acme', 6, 9), job('Solo', 0, 9)],
    (m) => -m,
    1,
  );
  const employers = groups.filter((g) => g.employer === true);
  assert.equal(employers.length, 2, 'every employer is outlined, one role or several');
  const [a, b] = groups.filter((g) => g.employer === 'Acme');
  assert.ok(b.x0 >= a.x1 - 1e-6 || a.x0 >= b.x1 - 1e-6);
  assert.ok(employers[0].x0 <= Math.min(a.x0, b.x0) && employers[0].x1 >= Math.max(a.x1, b.x1));
});

test('no lane runs past the page', () => {
  const sheet = layOut(timeline);
  const last = sheet.lanes.at(-1);
  assert.ok(last.labelX + 1.6 + 1 + last.room <= 190 + 1e-6);
});

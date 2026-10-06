// A degree reads with its title — the school alone does not say what was
// studied. When the roles go for want of room, the degrees keep theirs; only
// when that still does not fit do they go too.
const test = require('node:test');
const assert = require('node:assert/strict');
const { layOut } = require('./page');

const at = (year, month) => year * 12 + month - 1;
const bar = (id, start, end, rest = 'a role') => ({
  id,
  start,
  end,
  ongoing: false,
  strong: id,
  rest,
});
const busy = Array.from({ length: 50 }, (_, i) =>
  bar(`e${i}`, at(2020, 3) + (i % 40), at(2020, 3) + (i % 40)),
);
const degree = { ...bar('UMons', at(2020, 3), at(2023, 6), 'Master'), kind: 'education' };
const timeline = {
  from: at(2020, 3),
  to: at(2023, 6),
  lanes: [
    { kind: 'work', groups: busy.map((head) => ({ head, children: [] })) },
    { kind: 'education', groups: [{ head: degree, children: [] }] },
  ],
};
const degreeOn = (sheet) => sheet.lanes[1].bars[0];

test('with the names alone, a degree keeps its title', () => {
  const sheet = layOut(timeline, { measure: (b) => (b.rest === 'a role' ? 300 : 1) });
  assert.deepEqual([sheet.labels, degreeOn(sheet).rest], ['names', 'Master']);
});

test('degrees give their titles up when the page has no room for them either', () => {
  const degrees = busy.map((head) => ({ head: { ...head, kind: 'education' }, children: [] }));
  const sheet = layOut(
    { ...timeline, lanes: [{ kind: 'education', groups: degrees }] },
    { measure: (b) => (b.rest ? 300 : 1) },
  );
  assert.deepEqual(
    [sheet.labels, [...new Set(sheet.lanes[0].bars.map((x) => x.rest))]],
    ['names', ['']],
  );
});

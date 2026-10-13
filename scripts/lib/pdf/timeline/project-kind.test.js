// On paper a project reads what kind of project it is where there is room:
// under its host, inside a bar wide enough for the whole label — never beside
// it, where it would push the neighbours along; standing alone, after its name
// as any entry's title.
const test = require('node:test');
const assert = require('node:assert/strict');
const { packLane } = require('./rows');
const { timelineBars } = require('./bars');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble API'] },
  ],
  projects: [
    { name: 'Acteble API', startDate: '2025-07-01', type: 'API' },
    { name: 'Baba', startDate: '2026-07-02', type: 'CLI', entity: 'Lab' },
    { name: 'KAG', startDate: '2026-07-05', entity: 'Lab' },
  ],
};
const lanes = timelineBars(resume, TODAY).lanes;
const [carried] = lanes.find((l) => l.kind === 'work').groups[0].children;
const alone = (name) =>
  lanes.find((l) => l.kind === 'projects').groups.find((g) => g.head.strong === name).head;
// 1 mm per month, labels 1 mm per character.
const scale = {
  x: (month) => month - carried.start,
  labelWidth: (bar) => bar.strong.length + bar.rest.length,
  trackEnd: 200,
};

test('under its host a project is told apart by its name', () => {
  assert.deepEqual([carried.strong, carried.rest], ['Acteble API', '']);
});

test('a bar wide enough for it carries the kind of the project', () => {
  const [wide] = packLane([{ ...carried, end: carried.start + 40 }], scale);
  assert.deepEqual([wide.rest, wide.label.place], ['API', 'inside']);
});

test('a bar too narrow for it keeps the name alone', () => {
  const [narrow] = packLane([{ ...carried, end: carried.start + 5 }], scale);
  assert.equal(narrow.rest, '');
});

test('a project that stands alone reads its kind after its name', () => {
  assert.equal(alone('Baba').rest, 'CLI');
});

test('a project of no stated kind keeps reading who it was for', () => {
  assert.equal(alone('KAG').rest, 'Lab');
});

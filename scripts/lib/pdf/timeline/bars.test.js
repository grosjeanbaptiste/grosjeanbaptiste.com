// The landscape PDF draws the same timeline as the interactive view: one lane
// per kind of entry, one bar per dated entry, the whole career up to today.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineBars } = require('./bars');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const at = (year, month) => year * 12 + month - 1;

const aResume = (extra = {}) => ({
  work: [
    { id: 'founder', company: 'Acteble', position: 'Founder', startDate: '2025-07-01' },
    {
      id: 'crafter',
      company: 'Xtrada',
      position: 'Software Crafter',
      startDate: '2023-08-21',
      endDate: '2024-09-22',
    },
  ],
  education: [
    {
      id: 'ms',
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
    },
  ],
  projects: [
    { id: 'baba', name: 'Baba', startDate: '2026-07-02' },
    { id: 'algo', name: 'Algorithmique', entity: 'UMONS', courseUnit: true },
  ],
  volunteer: [],
  ...extra,
});

const lane = (timeline, kind) => timeline.lanes.find((l) => l.kind === kind);

test('a bar spans its entry from its first month to its last', () => {
  const bar = lane(timelineBars(aResume(), TODAY), 'work').bars.find((b) => b.id === 'crafter');
  assert.deepEqual([bar.start, bar.end], [at(2023, 8), at(2024, 9)]);
});

test('an ongoing entry runs up to the current month', () => {
  const bar = lane(timelineBars(aResume(), TODAY), 'work').bars.find((b) => b.id === 'founder');
  assert.equal(bar.end, at(2026, 10));
});

test('an ongoing entry is marked as such', () => {
  const bar = lane(timelineBars(aResume(), TODAY), 'work').bars.find((b) => b.id === 'founder');
  assert.equal(bar.ongoing, true);
});

test('course units stay out of the timeline', () => {
  const ids = lane(timelineBars(aResume(), TODAY), 'projects').bars.map((b) => b.id);
  assert.deepEqual(ids, ['baba']);
});

test('a kind with no dated entry draws no lane', () => {
  assert.deepEqual(
    timelineBars(aResume(), TODAY).lanes.map((l) => l.kind),
    ['work', 'education', 'projects'],
  );
});

test('the axis runs from the earliest start to the current month', () => {
  const { from, to } = timelineBars(aResume(), TODAY);
  assert.deepEqual([from, to], [at(2022, 10), at(2026, 10)]);
});

test('a work bar is named by its employer, then the role', () => {
  const bar = lane(timelineBars(aResume(), TODAY), 'work').bars.find((b) => b.id === 'crafter');
  assert.deepEqual([bar.strong, bar.rest], ['Xtrada', 'Software Crafter']);
});

test('an entry that ends before it starts is refused', () => {
  const broken = aResume({
    volunteer: [
      { id: 'x', organization: 'O', position: 'P', startDate: '2024-05', endDate: '2023-01' },
    ],
  });
  assert.throws(() => timelineBars(broken, TODAY), /ends .* before it starts/);
});

test('an unreadable date is refused', () => {
  const broken = aResume({ volunteer: [{ id: 'x', organization: 'O', startDate: 'spring 2024' }] });
  assert.throws(() => timelineBars(broken, TODAY), /Unreadable date "spring 2024"/);
});

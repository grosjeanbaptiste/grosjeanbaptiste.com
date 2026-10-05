// The PDFs draw the timeline of the site: a lane for the experiences, one for
// the degrees, one for the competitions; under each entry, the projects and
// the volunteering it carried. Over the whole career, or cut to its last years.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineBars } = require('./bars');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const at = (year, month) => year * 12 + month - 1;

const aResume = (extra = {}) => ({
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble'] },
    {
      company: 'Xtrada',
      position: 'Software Crafter',
      startDate: '2023-08-21',
      endDate: '2024-09-22',
      projects: ['Kwalitijd'],
    },
  ],
  education: [
    { institution: 'UMons', studyType: 'Master', startDate: '2022-10-15', endDate: '2026-09-04' },
  ],
  projects: [
    { name: 'Acteble', startDate: '2025-07-01' },
    { name: 'Kwalitijd', startDate: '2023-09-01', endDate: '2026-01-31' },
    { name: 'Baba', startDate: '2026-07-02' },
    { name: 'Algorithmique', entity: 'UMONS', courseUnit: true },
  ],
  volunteer: [
    { organization: 'UMons', position: 'Buddy', startDate: '2023-11-30', endDate: '2026-09-04' },
  ],
  ...extra,
});

const lane = (timeline, kind) => timeline.lanes.find((l) => l.kind === kind);
const group = (timeline, kind, name) =>
  lane(timeline, kind).groups.find((g) => g.head.strong === name);
const whole = () => timelineBars(aResume(), TODAY);

test('a bar spans its entry from its first month to its last', () => {
  const { head } = group(whole(), 'work', 'Xtrada');
  assert.deepEqual([head.start, head.end], [at(2023, 8), at(2024, 9)]);
});

test('an ongoing entry runs up to the current month, and says so', () => {
  const { head } = group(whole(), 'work', 'Acteble');
  assert.deepEqual([head.end, head.ongoing], [at(2026, 10), true]);
});

test('a work bar is named by its employer, then the role', () => {
  const { head } = group(whole(), 'work', 'Xtrada');
  assert.deepEqual([head.strong, head.rest], ['Xtrada', 'Software Crafter']);
});

test('a project sits under the experience that carried it', () => {
  assert.deepEqual(
    group(whole(), 'work', 'Acteble').children.map((c) => c.strong),
    ['Acteble'],
  );
});

test('a volunteering role sits under the degree of its organisation, named by the role', () => {
  assert.deepEqual(
    group(whole(), 'education', 'UMons').children.map((c) => [c.strong, c.kind]),
    [['Buddy', 'volunteer']],
  );
});

test('a project nothing references keeps a lane', () => {
  assert.deepEqual(
    lane(whole(), 'projects').groups.map((g) => g.head.strong),
    ['Baba'],
  );
});

test('the lanes are the experiences, the degrees and the unhosted projects', () => {
  assert.deepEqual(
    whole().lanes.map((l) => l.kind),
    ['work', 'education', 'projects'],
  );
});

test('course units stay out of the timeline', () => {
  const all = whole().lanes.flatMap((l) =>
    l.groups.flatMap((g) => [g.head, ...g.children].map((b) => b.strong)),
  );
  assert.ok(!all.includes('Algorithmique'));
});

test('the axis runs from the earliest start to the current month', () => {
  const { from, to } = whole();
  assert.deepEqual([from, to], [at(2022, 10), at(2026, 10)]);
});

test('an entry that ends before it starts is refused', () => {
  const broken = aResume({
    volunteer: [{ organization: 'O', position: 'P', startDate: '2024-05', endDate: '2023-01' }],
  });
  assert.throws(() => timelineBars(broken, TODAY), /ends .* before it starts/);
});

test('an unreadable date is refused', () => {
  const broken = aResume({
    volunteer: [{ organization: 'O', position: 'P', startDate: 'spring 2024' }],
  });
  assert.throws(() => timelineBars(broken, TODAY), /Unreadable date "spring 2024"/);
});

// The 2- and 5-year PDFs: the same groups, cut to the last years.
const lastTwo = () => timelineBars(aResume(), TODAY, 2);

test('a span starts its axis that many years before the current month', () => {
  assert.equal(lastTwo().from, at(2024, 11));
});

test('a span leaves out the entries that ended before it', () => {
  assert.deepEqual(
    lane(lastTwo(), 'work').groups.map((g) => g.head.strong),
    ['Acteble'],
  );
});

test('an entry begun before the span is cut at its start', () => {
  const { head } = group(lastTwo(), 'education', 'UMons');
  assert.deepEqual([head.start, head.clipped], [at(2024, 11), true]);
});

test('what an entry carried is cut to the span like the entry', () => {
  const [buddy] = group(lastTwo(), 'education', 'UMons').children;
  assert.deepEqual([buddy.start, buddy.clipped], [at(2024, 11), true]);
});

// Kwalitijd outlived the job it was built at: in the last two years the job is
// gone and the project is not.
test('a project still running when its host has left the span stands alone, not dropped', () => {
  assert.ok(lane(lastTwo(), 'projects').groups.some((g) => g.head.strong === 'Kwalitijd'));
});

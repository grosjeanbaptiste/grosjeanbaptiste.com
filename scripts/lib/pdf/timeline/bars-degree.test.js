// What a degree brings to the PDF timeline besides its bar: its academic
// years, and whether it was followed on an evening schedule.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineBars } = require('./bars');

const TODAY = new Date(Date.UTC(2026, 9, 3));

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

// 21 August 2023 to 22 September 2024, to the day: a bar runs to `end + 1`.
// A degree's academic years — its blocks — come with it, to be drawn on a row
// of their own under its bar.
const BLOCKS = [
  { year: '2022-2023', label: 'Bridging block', startDate: '2022-10-15', endDate: '2023-09-13' },
  { year: '2025-2026', startDate: '2025-09-14', endDate: '2026-09-04' },
];
const studied = () => {
  const base = aResume();
  return { ...base, education: [{ ...base.education[0], blocks: BLOCKS }] };
};

test('a degree comes with its blocks, named by their year and the programme’s name', () => {
  const { bands } = group(timelineBars(studied(), TODAY), 'education', 'UMons');
  assert.deepEqual(
    bands.map((b) => [b.strong, b.rest]),
    [
      ['22-23', 'Bridging block'],
      ['25-26', ''],
    ],
  );
});

test('an entry without blocks has none', () => {
  assert.deepEqual(group(whole(), 'work', 'Xtrada').bands, []);
});

test('a span keeps the blocks that reach into it, and only those', () => {
  const { bands } = group(timelineBars(studied(), TODAY, 2), 'education', 'UMons');
  assert.deepEqual(
    bands.map((b) => b.strong),
    ['25-26'],
  );
});

test('a degree followed in the evening says so, and its blocks with it', () => {
  const base = aResume();
  const evening = {
    ...base,
    education: [{ ...base.education[0], schedule: 'evening', blocks: BLOCKS }],
  };
  const { head, bands } = group(timelineBars(evening, TODAY), 'education', 'UMons');
  assert.deepEqual(
    [head.schedule, ...bands.map((b) => b.schedule)],
    ['evening', 'evening', 'evening'],
  );
});

test('what an entry carried, and an experience, have no schedule', () => {
  const { head, children } = group(whole(), 'work', 'Acteble');
  assert.deepEqual([head.schedule, ...children.map((c) => c.schedule)], [undefined, undefined]);
});

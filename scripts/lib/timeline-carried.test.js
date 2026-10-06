// What an entry carried is drawn for as long as the entry carried it. A
// project begun as a dissertation and still running today sits under its
// degree up to the day the degree was obtained — the dissertation — and under
// the experience that goes on with it for the rest.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');

const TODAY = new Date(Date.UTC(2026, 9, 6));
const Y = (year, month) => year * 12 + month - 1;
const cv = (project) => ({
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble'] },
  ],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      projects: ['Acteble'],
    },
  ],
  projects: [{ name: 'Acteble', startDate: '2025-07-01', ...project }],
  volunteer: [],
});
const under = (resume, lane) =>
  timelineOf(resume, TODAY)
    .lanes.find((l) => l.kind === lane)
    .bars.find((b) => b.depth === 1);
const degree = (resume) =>
  timelineOf(resume, TODAY)
    .lanes.find((l) => l.kind === 'education')
    .bars.find((b) => b.depth === 0);

test('a project still running stops, under its degree, when the degree was obtained', () => {
  assert.equal(under(cv(), 'education').end, degree(cv()).end);
});

test('under the experience that goes on, it runs on to today', () => {
  assert.equal(under(cv(), 'work').end + 1, Y(2026, 10) + 1);
});

test('the group of the degree no longer reaches past the degree', () => {
  const [outline] = timelineOf(cv(), TODAY).lanes.find((l) => l.kind === 'education').groups;
  assert.equal(outline.end, degree(cv()).end);
});

test('a project begun before its host starts, under it, with the host', () => {
  const early = cv({ startDate: '2021-01-01', endDate: '2023-06-30' });
  assert.equal(under(early, 'education').start, degree(early).start);
});

test('a project within the dates of its host is drawn as it is', () => {
  const within = cv({ startDate: '2024-12-01', endDate: '2025-06-30' });
  const bar = under(within, 'education');
  assert.deepEqual([bar.start, bar.end + 1], [Y(2024, 12), Y(2025, 6) + 29 / 30]);
});

test('a project the host names but never overlapped is drawn on its own dates, not dropped', () => {
  const before = cv({ startDate: '2020-01-01', endDate: '2020-12-31' });
  const bar = under(before, 'education');
  assert.equal(bar.name, 'Acteble');
  assert.equal(bar.start, Y(2020, 1));
});

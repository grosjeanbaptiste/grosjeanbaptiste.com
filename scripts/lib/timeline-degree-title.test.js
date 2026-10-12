// A degree reads with what was studied: its type, then its speciality —
// "UMons · Master — Computer Science". The school alone says neither.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const degree = (extra) => ({
  institution: 'UMons',
  startDate: '2022-10-15',
  endDate: '2026-09-04',
  ...extra,
});
const captionOf = (extra) =>
  timelineOf({ education: [degree(extra)] }, TODAY).lanes[0].bars[0].caption;

test('a degree reads its school, its type and its speciality', () => {
  assert.equal(
    captionOf({ studyType: 'Master', area: 'Computer Science' }),
    'UMons · Master — Computer Science',
  );
});

test('a degree with no speciality reads its school and its type', () => {
  assert.equal(captionOf({ studyType: 'Master' }), 'UMons · Master');
});

test('a degree with no type reads its school and its speciality', () => {
  assert.equal(captionOf({ area: 'Latin & Greek' }), 'UMons · Latin & Greek');
});

test('a degree with neither reads its school alone', () => {
  assert.equal(captionOf({}), 'UMons');
});

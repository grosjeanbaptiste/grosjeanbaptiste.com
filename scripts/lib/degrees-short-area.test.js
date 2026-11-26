// A degree's `shortArea` (DSL) stands for its `area` in the header's one-line summary.
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDegreeLine } = require('./degrees');

test('the header line prefers shortArea, and falls back to area without credits', () => {
  const base = { studyType: 'Master', area: 'CS (120 ECTS)' };
  assert.equal(formatDegreeLine({ ...base, shortArea: 'CS' }, 'en'), 'Master in CS');
  assert.equal(formatDegreeLine(base, 'en'), 'Master in CS');
});

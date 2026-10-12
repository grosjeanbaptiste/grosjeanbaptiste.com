// A label is shortened so that, written beside a short bar, it does not push
// its neighbours along. Inside a bar wide enough to hold it whole there is
// nothing to push: it is written in full, never cut with room to spare.
const test = require('node:test');
const assert = require('node:assert/strict');
const { packLane } = require('./rows');
const { timelineBars } = require('./bars');

// 1 mm per month, labels 1 mm per character.
const scale = {
  x: (month) => month,
  labelWidth: (bar) => bar.strong.length + bar.rest.length,
  trackEnd: 200,
};
const cut = {
  id: 'a',
  strong: 'UMons',
  rest: 'Master — Computer…',
  full: { strong: 'UMons', rest: 'Master — Computer Science (work-study)' },
};

test('a bar wide enough for its whole label carries it in full', () => {
  const [wide] = packLane([{ ...cut, start: 0, end: 99 }], scale);
  assert.deepEqual(
    [wide.rest, wide.label.place],
    ['Master — Computer Science (work-study)', 'inside'],
  );
});

test('a bar too narrow for it keeps the shortened label', () => {
  const [narrow] = packLane([{ ...cut, start: 0, end: 29 }], scale);
  assert.equal(narrow.rest, 'Master — Computer…');
});

test('every bar of the timeline knows its whole label', () => {
  const name = 'A school whose name is far longer than thirty characters';
  const resume = {
    education: [
      { institution: name, studyType: 'Master', startDate: '2022-10-15', endDate: '2026-09-04' },
    ],
  };
  const { head } = timelineBars(resume, new Date(Date.UTC(2026, 9, 3))).lanes[0].groups[0];
  assert.deepEqual(head.full, { strong: name, rest: 'Master' });
  assert.match(head.strong, /…$/);
});

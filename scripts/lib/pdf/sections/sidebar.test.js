// Tests for the PDF sidebar "Typical Day" wheelchart block. Run with `node --test`.

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDayBlock } = require('./sidebar');

const t = {
  typicalDay: 'Typical Day',
  dailyLifeLabels: { sleep: 'Sleep', work: 'Work' },
};
const resume = {
  meta: {
    dailyLife: {
      items: [
        { key: 'sleep', hours: 7 },
        { key: 'work', hours: 8 },
      ],
    },
  },
};

test('renders a wheelchart', () => {
  assert.match(buildDayBlock(resume, t), /\\wheelchart/);
});

test('each slice label shows its hour count next to the name', () => {
  const out = buildDayBlock(resume, t);
  // The numeric legend the donut was missing: the hour count sits on the same
  // slice line as its label so it renders next to the name, not in a separate
  // block. Regression guard for the "no numbers on the donut" defect.
  assert.match(out, /Sleep[^,\n]*7h/);
  assert.match(out, /Work[^,\n]*8h/);
});

test('returns an empty string when there is no daily-life data', () => {
  assert.equal(buildDayBlock({ meta: {} }, t), '');
});

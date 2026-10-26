// On paper, a host whose projects all still run stacks one row per project;
// when the page cannot hold them, the most recent ones share one bar, named
// after each of them.
const test = require('node:test');
const assert = require('node:assert/strict');
const { gatherNewest } = require('./gather');
const { buildTimelineDocument } = require('./document');
const { loadResume } = require('../data');
const { applyPdfOverrides } = require('../../site-overrides');

const bar = (strong, start, ongoing = true) => ({
  kind: 'project',
  start,
  end: 100,
  ongoing,
  clipped: false,
  strong,
  rest: '',
  full: { strong, rest: '' },
});
const timeline = (children) => ({
  from: 0,
  to: 100,
  lanes: [{ kind: 'work', groups: [{ head: bar('Host', 0), children, bands: [] }] }],
});

test('the two newest projects still running share one bar', () => {
  const [group] = gatherNewest(timeline([bar('Old', 10), bar('Mid', 50), bar('New', 90)])).lanes[0]
    .groups;
  assert.deepEqual(
    group.children.map((c) => c.strong),
    ['Old', 'Mid, New'],
  );
});

test('the shared bar runs from the earlier of the two', () => {
  const [, shared] = gatherNewest(timeline([bar('Old', 10), bar('Mid', 50), bar('New', 90)]))
    .lanes[0].groups[0].children;
  assert.deepEqual([shared.start, shared.end, shared.ongoing], [50, 100, true]);
});

test('a finished project is never gathered', () => {
  assert.equal(gatherNewest(timeline([bar('Done', 10, false), bar('New', 90)])), null);
});

test('nothing left to gather says so', () => {
  assert.equal(gatherNewest(timeline([bar('Alone', 10)])), null);
});

test('the whole-career timeline of the CV fits on its page', () => {
  const resume = applyPdfOverrides(loadResume('en'));
  assert.doesNotThrow(() => buildTimelineDocument(resume, 'en', new Date(Date.UTC(2026, 9, 21))));
});

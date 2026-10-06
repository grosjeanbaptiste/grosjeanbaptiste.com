// A degree is followed year by year. Its academic years — its blocks — are
// drawn as one row of segments right under its bar, so that what the degree
// carried falls, visibly, in the year it belongs to.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { TODAY, resume } = require('./timeline-model.fixture');

const BLOCKS = [
  {
    year: '2022-2023',
    label: 'Bridging block',
    startDate: '2022-10-15',
    endDate: '2023-09-13',
    units: [],
  },
  {
    year: '2023-2024',
    label: 'Bridging block',
    startDate: '2023-09-14',
    endDate: '2024-09-13',
    units: [],
  },
  { year: '2024-2025', startDate: '2024-09-14', endDate: '2026-09-04', units: [] },
];
const withBlocks = () => {
  const base = resume();
  return { ...base, education: [{ ...base.education[0], blocks: BLOCKS }] };
};
const lane = (r) => timelineOf(r, TODAY).lanes.find((l) => l.kind === 'education');
const bands = (r) => lane(r).bars.filter((b) => b.kind === 'block');
const head = (r) => lane(r).bars.find((b) => b.depth === 0);

test('a degree draws one segment per block', () => {
  assert.equal(bands(withBlocks()).length, 3);
});

test('the blocks share one row, right under the degree', () => {
  const rows = new Set(bands(withBlocks()).map((b) => b.row));
  assert.deepEqual([...rows], [head(withBlocks()).row + 1]);
});

test('what the degree carried goes below its blocks', () => {
  const carried = lane(withBlocks()).bars.filter((b) => b.depth === 1 && b.kind !== 'block');
  assert.ok(carried.length > 0);
  assert.ok(carried.every((b) => b.row > head(withBlocks()).row + 1));
});

test('a block reads by its academic year, shortened, and its name', () => {
  assert.equal(bands(withBlocks())[0].caption, '22-23 · Bridging block');
});

test('a block the programme does not name reads by its year alone', () => {
  assert.equal(bands(withBlocks())[2].caption, '24-25');
});

test('a block is placed on its own dates, to the day', () => {
  const [first, second] = bands(withBlocks());
  assert.ok(Math.abs(first.end + 1 - second.start) < 0.04, 'two years in a row do not meet');
});

test('the blocks are inside the outline of their degree', () => {
  const [outline] = lane(withBlocks()).groups;
  assert.ok(outline.rows >= 3);
  assert.ok(bands(withBlocks()).every((b) => b.group === outline.group));
});

test('a degree without blocks draws none, and loses no row to them', () => {
  assert.deepEqual(bands(resume()), []);
  const carried = lane(resume()).bars.filter((b) => b.depth === 1);
  assert.ok(carried.some((b) => b.row === head(resume()).row + 1));
});

test('a block links nowhere: it is a part of its degree, not an entry', () => {
  assert.ok(bands(withBlocks()).every((b) => !b.anchor));
});

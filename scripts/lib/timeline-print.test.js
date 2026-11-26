// On paper the timeline has no room for the course units: they are left out
// and the rows close up. The page carries both layouts — where each bar sits
// on screen, and where it sits once printed.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { withPrintRows } = require('./timeline-print');
const { TODAY, resume } = require('./timeline-model.fixture');

const studied = () => {
  const base = resume();
  return {
    ...base,
    courses: [...base.courses, { name: 'Réseaux' }],
    education: [
      {
        ...base.education[0],
        blocks: [
          {
            year: '2022-2023',
            startDate: '2022-10-15',
            endDate: '2023-09-13',
            units: ['Algorithmique', 'Réseaux'],
          },
        ],
      },
    ],
  };
};
const lane = (kind = 'education') =>
  withPrintRows(studied(), TODAY).lanes.find((l) => l.kind === kind);
const bare = () =>
  timelineOf(studied(), TODAY, { units: false }).lanes.find((l) => l.kind === 'education');

test('the screen layout is kept as it is', () => {
  const screen = timelineOf(studied(), TODAY).lanes.find((l) => l.kind === 'education');
  assert.deepEqual(
    lane().bars.map((b) => [b.name, b.row]),
    screen.bars.map((b) => [b.name, b.row]),
  );
});

test('a course unit has no row on paper', () => {
  const units = lane().bars.filter((b) => b.kind === 'unit');
  assert.equal(units.length, 2);
  assert.ok(units.every((b) => b.printRow === undefined));
});

test('every other bar gets the row it has once the units are gone', () => {
  assert.deepEqual(
    lane()
      .bars.filter((b) => b.kind !== 'unit')
      .map((b) => [b.name, b.printRow]),
    bare().bars.map((b) => [b.name, b.row]),
  );
});

test('a lane is as tall on paper as it is without its units', () => {
  assert.equal(lane().printRows, bare().rows);
  assert.ok(lane().printRows < lane().rows);
});

test('an outline closes up with its group', () => {
  const [outline] = lane().groups;
  assert.deepEqual(
    [outline.printRow, outline.printRows],
    [bare().groups[0].row, bare().groups[0].rows],
  );
});

test('a lane with no unit prints as it shows', () => {
  const work = lane('work');
  assert.equal(work.printRows, work.rows);
  assert.ok(work.bars.every((b) => b.printRow === b.row));
});

// On a phone the parts of a family of projects (OpenActe) are folded into its bar.
test('a phone folds the parts of a family into its bar and closes the rows up', () => {
  const base = resume();
  const host = base.work[0];
  const project = (name, extra = {}) => ({
    name,
    startDate: '2023-03-01',
    description: name,
    ...extra,
  });
  const family = {
    ...base,
    work: [{ ...host, projects: [host.name, 'Family', 'A', 'B'].slice(1) }, ...base.work.slice(1)],
    projects: [
      project('Family'),
      project('A', { partOf: 'Family' }),
      project('B', { partOf: 'Family' }),
    ],
  };
  const folded = withPrintRows(family, TODAY).lanes.find((l) => l.bars.some((b) => b.part));
  assert.ok(folded, 'no bar was folded');
  assert.deepEqual(
    folded.bars.filter((b) => b.part).map((b) => b.name),
    ['A', 'B'],
  );
  assert.ok(folded.foldRows < folded.rows, 'the rows did not close up');
  assert.ok(folded.bars.filter((b) => !b.part).every((b) => b.foldRow !== undefined));
});

test('on a phone the course units are folded and the rows close up', () => {
  const l = lane();
  const units = l.bars.filter((b) => b.kind === 'unit');
  assert.ok(units.length > 0 && units.every((b) => b.part));
  assert.equal(l.foldRows, bare().rows);
  assert.ok(l.bars.filter((b) => b.kind !== 'unit').every((b) => b.foldRow !== undefined));
});

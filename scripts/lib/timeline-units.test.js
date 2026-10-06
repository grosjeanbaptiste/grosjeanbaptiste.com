// The course units of a degree are drawn in the timeline, under the block —
// the academic year — they were taken in: one thin bar each, as wide as the
// year, stacked. What the degree carried otherwise goes below them.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineOf } = require('./timeline-model');
const { TODAY, resume } = require('./timeline-model.fixture');

const unit = (name) => ({ name, type: 'Course unit', entity: 'UMONS' });
const studied = () => {
  const base = resume();
  return {
    ...base,
    projects: [...base.projects, unit('Mathématique'), unit('Réseaux')],
    education: [
      {
        ...base.education[0],
        blocks: [
          {
            year: '2022-2023',
            startDate: '2022-10-15',
            endDate: '2023-09-13',
            units: ['Algorithmique', 'Mathématique'],
          },
          { year: '2023-2024', startDate: '2023-09-14', endDate: '2026-09-04', units: ['Réseaux'] },
        ],
      },
    ],
  };
};
const lane = (r = studied()) => timelineOf(r, TODAY).lanes.find((l) => l.kind === 'education');
const units = (r) => lane(r).bars.filter((b) => b.kind === 'unit');
const byName = (name) => units().find((b) => b.name === name);
const head = () => lane().bars.find((b) => b.depth === 0);
const band = (year) => lane().bars.find((b) => b.kind === 'block' && b.name === year);

test('each course unit of a block is drawn', () => {
  assert.deepEqual(
    units()
      .map((b) => b.name)
      .sort(),
    ['Algorithmique', 'Mathématique', 'Réseaux'],
  );
});

test('a unit is as wide as the year it was taken in', () => {
  const algo = byName('Algorithmique');
  assert.deepEqual([algo.start, algo.end], [band('22-23').start, band('22-23').end]);
});

test('the units of one block are stacked under it', () => {
  const rows = [byName('Algorithmique').row, byName('Mathématique').row];
  assert.deepEqual(rows, [head().row + 2, head().row + 3]);
});

test('the units of two blocks share the same rows', () => {
  assert.equal(byName('Réseaux').row, byName('Algorithmique').row);
});

test('what the degree carried otherwise goes below its units', () => {
  const carried = lane().bars.filter((b) => b.depth === 1 && !['block', 'unit'].includes(b.kind));
  assert.ok(carried.length > 0);
  assert.ok(carried.every((b) => b.row > byName('Mathématique').row));
});

test('a unit reads by its official designation', () => {
  assert.equal(byName('Réseaux').caption, 'Réseaux');
});

test('a unit leads to its own line on the page', () => {
  assert.match(byName('Algorithmique').anchor, /^project-algorithmique/);
});

test('the outline of the degree covers its units', () => {
  const [outline] = lane().groups;
  assert.ok(outline.row + outline.rows > byName('Mathématique').row);
});

test('a block that names a unit the CV does not have is refused, not skipped', () => {
  const broken = studied();
  broken.education[0].blocks[0].units = ['Ghost'];
  assert.throws(() => timelineOf(broken, TODAY), /Ghost/);
});

test('the units can be left out, for a page that has no room for them', () => {
  const without = timelineOf(studied(), TODAY, { units: false }).lanes.find(
    (l) => l.kind === 'education',
  );
  assert.deepEqual(
    without.bars.filter((b) => b.kind === 'unit'),
    [],
  );
  assert.ok(without.rows < lane().rows);
});

test('a degree without blocks draws no unit', () => {
  assert.deepEqual(units(resume()), []);
});

// A degree's course units on the timeline PDFs: one bar each under the block
// — the academic year — they were taken in, named inside it. They are drawn
// where a year is wide enough to read them (the 2- and 5-year PDFs) and left
// out, aloud, where it is not.
const test = require('node:test');
const assert = require('node:assert/strict');
const { timelineBars } = require('./bars');
const { packGroupsOnPaper } = require('./rows');
const { layOut } = require('./page');
const { buildPicture } = require('./picture');
const { compileTimeline } = require('./compile');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  work: [],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      projects: ['Thesis'],
      blocks: [
        {
          year: '2024-2025',
          startDate: '2024-09-14',
          endDate: '2025-09-13',
          units: ['Algorithmique', 'Réseaux'],
        },
        { year: '2025-2026', startDate: '2025-09-14', endDate: '2026-09-04', units: ['Logique'] },
      ],
    },
  ],
  projects: [
    { name: 'Thesis', startDate: '2025-11-13', endDate: '2026-09-04' },
    { name: 'Algorithmique', type: 'Course unit' },
    { name: 'Réseaux', type: 'Course unit' },
    { name: 'Logique', type: 'Course unit' },
  ],
  volunteer: [],
};
const bands = (years = null) => timelineBars(resume, TODAY, years).lanes[0].groups[0].bands;

test('a block carries the course units taken in it', () => {
  assert.deepEqual(
    bands().map((b) => b.units.map((u) => u.strong)),
    [['Algorithmique', 'Réseaux'], ['Logique']],
  );
});

// 2 mm per month, 1 mm per character; `tight` halves the months.
const scale = (units, perMonth = 2) => ({
  x: (month) => (month - 24290) * perMonth,
  labelWidth: (bar) => bar.strong.length + bar.rest.length,
  trackEnd: 200,
  units,
});
const packed = (units, perMonth) =>
  packGroupsOnPaper(timelineBars(resume, TODAY).lanes[0].groups, scale(units, perMonth));
const unitsOf = (sheet) => sheet.bars.filter((b) => b.kind === 'unit');
const named = (sheet, name) => sheet.bars.find((b) => b.strong === name);

test('the units of a block are stacked under it', () => {
  const sheet = packed(true);
  assert.deepEqual([named(sheet, 'Algorithmique').row, named(sheet, 'Réseaux').row], [2, 3]);
});

test('a unit is as wide as its block, its name inside', () => {
  const sheet = packed(true);
  const block = sheet.bars.find((b) => b.kind === 'block');
  const unit = named(sheet, 'Algorithmique');
  assert.deepEqual([unit.x0, unit.x1, unit.label.place], [block.x0, block.x1, 'inside']);
});

test('the units of two blocks share rows', () => {
  const sheet = packed(true);
  assert.equal(named(sheet, 'Logique').row, named(sheet, 'Algorithmique').row);
});

test('what the degree carried goes below its units', () => {
  assert.equal(named(packed(true), 'Thesis').row, 4);
});

test('a name longer than its block is cut to it', () => {
  // 12 mm of block, less the padding: "Algorithmique" (13) does not fit.
  const [first] = unitsOf(packed(true, 1));
  assert.match(first.strong, /^Algo.*…$/);
});

test('a sheet with no room for units leaves them out', () => {
  const sheet = packed(false);
  assert.equal(unitsOf(sheet).length, 0);
  assert.equal(named(sheet, 'Thesis').row, 2);
});

const measure = (bar, size) => (bar.strong.length + bar.rest.length) * size * 0.2;

test('over two years a year is wide enough: the units are drawn', () => {
  const sheet = layOut(timelineBars(resume, TODAY, 2), { measure });
  assert.equal(sheet.units, 'drawn');
  assert.equal(unitsOf(sheet.lanes[0]).length, 3);
});

test('on a narrow sheet a year cannot be read: the units are left out, and the sheet says so', () => {
  const sheet = layOut(timelineBars(resume, TODAY), { measure, track: 40 });
  assert.equal(sheet.units, 'dropped');
  assert.equal(unitsOf(sheet.lanes[0]).length, 0);
});

test('a career with no course unit has none to drop', () => {
  const plain = { ...resume, education: [{ ...resume.education[0], blocks: [] }] };
  assert.equal(layOut(timelineBars(plain, TODAY), { measure }).units, 'none');
});

test('a unit is drawn in the tint of the degrees, its name in regular weight', () => {
  const sheet = layOut(timelineBars(resume, TODAY, 2), { measure });
  const picture = buildPicture(sheet, { education: 'Education', eveningSchedule: '' });
  assert.match(picture, /\{Logique\}/);
  assert.doesNotMatch(picture, /\\textbf\{Logique\}/);
});

test('a timeline drawn without its course units says so', () => {
  const warnings = [];
  compileTimeline({ basics: { name: 'B' } }, 'de', '/nowhere/out.pdf', TODAY, null, {
    document: () => ({ tex: '', labels: 'full', units: 'dropped' }),
    compile: () => ({ ok: true, pages: 1 }),
    warn: (message) => warnings.push(message),
  });
  assert.match(warnings.join('\n'), /de: .*course units/);
});

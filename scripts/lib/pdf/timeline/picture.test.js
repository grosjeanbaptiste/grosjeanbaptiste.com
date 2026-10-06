// The TikZ picture of a sheet.
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPicture } = require('./picture');
const I18N = require('../i18n');

const bar = (strong) => ({
  kind: 'work',
  depth: 0,
  row: 0,
  x0: 0,
  x1: 10,
  strong,
  rest: '',
  clipped: false,
  label: { place: 'inside', x: 1 },
});
const sheet = (bars, extra = {}) => ({
  lanes: [{ kind: 'work', top: -5, rows: 1, bars, outlines: [] }],
  years: [],
  height: 10,
  pitch: 3,
  bar: 2.4,
  font: 6,
  axis: 5,
  ...extra,
});
const nodes = (tex) => tex.split('\n').filter((line) => line.startsWith('\\node'));

test('a bar is drawn with its name', () => {
  assert.match(buildPicture(sheet([bar('Acteble')]), I18N.en), /\\textbf\{Acteble\}/);
});

test('a bar that carries no name draws no label', () => {
  // The lane title is the only text left.
  assert.equal(nodes(buildPicture(sheet([bar('')]), I18N.en)).length, 1);
});

test('lane titles sit 27 mm left of the axis unless the sheet says otherwise', () => {
  assert.match(buildPicture(sheet([bar('a')]), I18N.en), /text width=24mm[^\n]*at \(-27,/);
});

test('a narrower sheet gives its lane titles less room', () => {
  const narrow = sheet([bar('a')], { titles: { x: -20, width: 18, size: 7 } });
  assert.match(
    buildPicture(narrow, I18N.en),
    /text width=18mm[^\n]*\\fontsize\{7\}[^\n]*at \(-20,/,
  );
});

// Two entries that follow one another the same day have outlines that meet:
// neither is drawn over the other, across or down the page.
const outlined = (outlines) =>
  buildPicture(
    { ...sheet([bar('a')]), lanes: [{ kind: 'work', top: -5, rows: 4, bars: [], outlines }] },
    I18N.en,
  )
    .split('\n')
    .filter((line) => line.startsWith('\\filldraw'))
    .map((line) =>
      [...line.matchAll(/\(([-\d.]+),([-\d.]+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]),
    );

test('an outline is drawn from the start of its first bar to the end of its last', () => {
  const [[from, to]] = outlined([{ x0: 10, x1: 30, row: 0, rows: 2 }]);
  assert.deepEqual([from[0], to[0]], [10, 30]);
});

test('the outlines of two groups stacked one under the other do not overlap', () => {
  const [[, upperEnd], [lowerStart]] = outlined([
    { x0: 0, x1: 30, row: 0, rows: 2 },
    { x0: 0, x1: 30, row: 2, rows: 2 },
  ]);
  assert.ok(upperEnd[1] > lowerStart[1], 'the upper outline runs into the lower one');
});

test('a block of a degree is drawn in a light tint of the degrees’ colour', () => {
  const block = { ...bar('22-23'), kind: 'block', depth: 1, row: 1 };
  assert.match(buildPicture(sheet([block]), I18N.en), /\\fill\[PrimaryColor!30!BackgroundColor/);
});

// A degree followed on an evening schedule ("horaire décalé") carries a crescent
// moon before its name — the bar itself stays plain, so the name stays easy to
// read — and a legend under the lane's title says what the moon means.
const evening = (strong) => ({ ...bar(strong), kind: 'education', schedule: 'evening' });
const day = (strong) => ({ ...bar(strong), kind: 'education', schedule: 'day' });
const labelOf = (tex, name) => tex.split('\n').find((line) => line.includes(`\\textbf{${name}}`));

test('an evening degree is named with a moon before its name', () => {
  assert.match(labelOf(buildPicture(sheet([evening('UMons')]), I18N.fr), 'UMons'), /\\faMoon/);
});

test('a day degree is named plainly', () => {
  const label = labelOf(buildPicture(sheet([day('Saint-Louis')]), I18N.fr), 'Saint-Louis');
  assert.doesNotMatch(label, /\\faMoon/);
});

test('an evening degree is not hatched: its bar is plain', () => {
  assert.doesNotMatch(buildPicture(sheet([evening('UMons')]), I18N.fr), /clip|hatch/);
});

test('the blocks of an evening degree carry no moon', () => {
  const block = { ...bar('22-23'), kind: 'block', depth: 1, row: 1, schedule: 'evening' };
  assert.doesNotMatch(labelOf(buildPicture(sheet([block]), I18N.fr), '22-23'), /\\faMoon/);
});

test('a lane with an evening degree says what the moon means', () => {
  assert.match(buildPicture(sheet([evening('UMons')]), I18N.fr), /\\faMoon[^\n]*horaire décalé/);
  assert.match(buildPicture(sheet([evening('UMons')]), I18N.en), /\\faMoon[^\n]*evening schedule/);
});

test('a lane without one carries no legend', () => {
  assert.doesNotMatch(buildPicture(sheet([day('Saint-Louis')]), I18N.fr), /horaire décalé/);
});

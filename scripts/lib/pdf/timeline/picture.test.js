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

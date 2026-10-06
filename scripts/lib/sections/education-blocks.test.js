// On the page a degree lists its course units year by year: under each block
// (an academic year, with the programme's name for it), the units taken then.
const test = require('node:test');
const assert = require('node:assert/strict');
const { appendEmbeds } = require('./embeds');
const I18N = require('../i18n');

const unit = (name) => ({ name, type: 'Course unit' });
const ctx = {
  projects: [
    unit('Algorithmique'),
    unit('Mathématique'),
    unit('Réseaux'),
    unit('Anglais'),
    { name: 'Remi' },
  ],
  volunteer: [],
  references: [],
};
const degree = (blocks) => ({
  institution: 'UMons',
  projects: ['Remi', 'Algorithmique', 'Mathématique', 'Réseaux', 'Anglais'],
  blocks,
});
const BLOCKS = [
  { year: '2022-2023', label: 'Bloc complémentaire', units: ['Algorithmique', 'Mathématique'] },
  { year: '2023-2024', units: ['Réseaux'] },
];
const html = (entry) => {
  const parts = [];
  appendEmbeds(parts, entry, entry.institution, ctx, I18N.fr, 'fr');
  return parts.join('\n');
};
const between = (text, from, to) =>
  text.slice(text.indexOf(from), to ? text.indexOf(to) : undefined);

test('a block is headed by its academic year and the programme’s name for it', () => {
  assert.match(
    html(degree(BLOCKS)),
    /<p class="embedded-block">2022-2023 · Bloc complémentaire<\/p>/,
  );
});

test('a block the programme does not name is headed by its year alone', () => {
  assert.match(html(degree(BLOCKS)), /<p class="embedded-block">2023-2024<\/p>/);
});

test('each unit is listed under the block it was taken in', () => {
  const page = html(degree(BLOCKS));
  const first = between(page, '2022-2023', '2023-2024');
  assert.match(first, /Algorithmique[\s\S]*Mathématique/);
  assert.doesNotMatch(first, /Réseaux/);
  assert.match(between(page, '2023-2024'), /Réseaux/);
});

test('a unit on no block is still listed, after the blocks', () => {
  const page = html(degree(BLOCKS));
  assert.ok(page.lastIndexOf('Anglais') > page.indexOf('Réseaux'));
});

test('every unit is listed once', () => {
  assert.equal(html(degree(BLOCKS)).split('<strong>Algorithmique</strong>').length - 1, 1);
});

test('the blocks sit under the course units heading, not among the projects', () => {
  const page = html(degree(BLOCKS));
  assert.ok(page.indexOf('<strong>Remi</strong>') < page.indexOf(`${I18N.fr.courseUnits}:`));
  assert.ok(page.indexOf(`${I18N.fr.courseUnits}:`) < page.indexOf('embedded-block'));
});

test('a degree the CV does not divide lists its units as one list', () => {
  const page = html(degree(undefined));
  assert.doesNotMatch(page, /embedded-block/);
  assert.match(page, /Algorithmique[\s\S]*Réseaux/);
});

// The classic page's search, ranked as the interactive view ranks it
// (react/src/domain/search.ts): every word must match, a match is weighted by
// where it lands, and a skill is a hit of its own.
const test = require('node:test');
const assert = require('node:assert/strict');
const { search, fold } = require('../../js/search-rank');

const entries = [
  { id: 'acteble-founder', title: 'Founder', organisation: 'Acteble', skills: ['Rust', 'Flutter'] },
  {
    id: 'xtrada-data-scientist',
    title: 'Data Scientist',
    organisation: 'Xtrada',
    skills: ['Python'],
  },
  { id: 'baba', title: 'Baba', subtitle: 'A shell.', skills: ['Rust', 'Prolog'] },
  { id: 'acteble', title: 'Acteble', skills: ['Flutter'] },
  { id: 'algorithmique', title: 'Algorithmique', skills: ['Algorithms'] },
  { id: 'umons-rep', title: 'Student representative', organisation: 'UMons', skills: [] },
];
const usage = [
  { skill: 'Rust', uses: 2 },
  { skill: 'Flutter', uses: 2 },
  { skill: 'Prolog', uses: 1 },
  { skill: 'Python', uses: 1 },
];
const hits = (query) => search(entries, usage, query);
const ids = (query) =>
  hits(query).map((hit) => (hit.type === 'entry' ? hit.entry.id : `skill:${hit.skill}`));

test('a blank query finds nothing', () => {
  assert.deepEqual(hits('   '), []);
});

test('an entry is found by its title, whatever the case', () => {
  assert.ok(ids('baba').includes('baba'));
});

test('an entry is found by its organisation', () => {
  assert.deepEqual(ids('xtrada'), ['xtrada-data-scientist']);
});

test('accents are ignored on both sides', () => {
  assert.ok(ids('ALGORÎTHMIQUE').includes('algorithmique'));
});

test('every word of the query must match somewhere in the entry', () => {
  assert.deepEqual(ids('founder acteble'), ['acteble-founder']);
});

test('a skill is a hit of its own, with the number of entries using it', () => {
  const [hit] = hits('prolog').filter((h) => h.type === 'skill');
  assert.deepEqual([hit.skill, hit.uses], ['Prolog', 1]);
});

test('a skill named exactly comes before the entries that use it', () => {
  assert.equal(ids('rust')[0], 'skill:Rust');
});

test('a match at the start of a word comes before one inside a word', () => {
  assert.match(ids('act')[0], /^acteble/);
});

test('an entry is found by what it was', () => {
  assert.deepEqual(ids('shell'), ['baba']);
});

test('folding drops accents and case', () => {
  assert.equal(fold('Mémoire'), 'memoire');
});

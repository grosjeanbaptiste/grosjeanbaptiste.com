// The skill filter as the XML mirrors carry it for the XSLT themes, which draw
// it with no script: each skill gets a token of its own — the id of its link's
// target and the word a bar is matched on in CSS — and each bar names the
// tokens of the skills its entry uses.
const test = require('node:test');
const assert = require('node:assert/strict');
const { skillFilterForXml } = require('./xml-skill-filter');
const I18N = require('./i18n');

const entries = [
  { id: 'work-a', skills: ['Rust', 'C', 'C#'] },
  { id: 'project-b', skills: ['Rust', 'C++', '.NET'] },
  { id: 'course-c', skills: ['中文处理'] },
  { id: 'project-undrawn', skills: ['Cobol'] },
];
const drawn = new Set(['work-a', 'project-b', 'course-c']);
const { filter, tokensOf } = skillFilterForXml(entries, drawn, I18N.en);
const all = [...filter.shortlist, ...(filter.rest || [])];
const skill = (name) => all.find((s) => s.name === name);

test('a skill is counted by the entries on the timeline that use it', () => {
  assert.deepEqual([skill('Rust').uses, skill('C').uses], [2, 1]);
});

test('an entry the timeline does not draw lends no skill', () => {
  assert.equal(skill('Cobol'), undefined);
});

test('the most used skill comes first', () => {
  assert.equal(all[0].name, 'Rust');
});

test('a skill gets a token from its name', () => {
  assert.deepEqual([skill('Rust').token, skill('.NET').token], ['rust', 'net']);
});

test('skills whose names fold to one word get tokens of their own', () => {
  const tokens = ['C', 'C#', 'C++'].map((name) => skill(name).token);
  assert.equal(new Set(tokens).size, 3);
  assert.ok(
    tokens.every((token) => /^c(-\d+)?$/.test(token)),
    tokens.join(),
  );
});

test('a token holds nothing a CSS word or a URL fragment would need escaped', () => {
  for (const { token } of all) assert.match(token, /^[\p{L}\p{N}-]+$/u);
});

test('a skill carries the sentence shown once it is chosen', () => {
  assert.equal(skill('Rust').said, '2 entries use Rust');
});

test('a bar is handed the tokens of the skills its entry uses', () => {
  assert.equal(tokensOf('project-b'), ['rust', skill('C++').token, 'net'].join(' '));
});

test('an entry with no skill, or unknown, hands a bar nothing', () => {
  assert.deepEqual([tokensOf('volunteer-x'), tokensOf(undefined)], [undefined, undefined]);
});

test('the filter is worded in the language of the page', () => {
  assert.deepEqual([filter.title, filter.clear], ['Filter by skill', 'Clear filter']);
});

test('eighteen skills are shown; the rest wait behind their count', () => {
  const many = [{ id: 'work-a', skills: Array.from({ length: 25 }, (_, i) => `S${i}`) }];
  const out = skillFilterForXml(many, new Set(['work-a']), I18N.en).filter;
  assert.deepEqual([out.shortlist.length, out.rest.length, out.more], [18, 7, 'All skills (25)']);
});

test('a CV whose timeline uses no skill has no filter', () => {
  assert.equal(skillFilterForXml([], new Set(), I18N.en).filter, undefined);
});

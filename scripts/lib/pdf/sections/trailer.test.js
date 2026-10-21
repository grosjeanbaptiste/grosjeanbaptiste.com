// What an entry carried, on paper: a few projects read as a list with their
// descriptions; many go into three columns, each named with its kind, so a
// founder's long list costs a third of the height.
const test = require('node:test');
const assert = require('node:assert/strict');
const { appendItemTrailer } = require('./_trailer');

const t = { projects: 'Projects', volunteer: 'Volunteering' };
const limits = { show_skills: false, proj_desc: 80 };
const project = (name) => ({ name, type: 'Platform', description: `${name} does things.` });
const trailerOf = (names) => {
  const resume = { projects: names.map(project), volunteer: [] };
  const parts = [];
  appendItemTrailer(parts, { projects: names }, resume, t, limits, { lang: 'en' });
  return parts.join('\n');
};

test('three projects stay a list, each with its description', () => {
  const out = trailerOf(['A', 'B', 'C']);
  assert.doesNotMatch(out, /multicols/);
  assert.match(out, /\\textbf\{A\} — A does things\./);
});

// Three top-aligned minipages, filled column by column: the recto is set
// with paracol, where multicols has no place.
test('four projects or more go into three columns', () => {
  const out = trailerOf(['A', 'B', 'C', 'D']);
  assert.equal(out.match(/\\begin\{minipage\}\[t\]\{0\.32\\linewidth\}/g)?.length, 3);
  assert.doesNotMatch(out, /multicols/);
  assert.ok(out.indexOf('{A}') < out.indexOf('{B}') && out.indexOf('{B}') < out.indexOf('{C}'));
});

test('in columns a project reads with its kind, not its description', () => {
  const out = trailerOf(['A', 'B', 'C', 'D']);
  assert.match(out, /\\textbf\{A\} \\textperiodcentered\{\} Platform/);
  assert.doesNotMatch(out, /does things/);
});

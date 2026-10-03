// The TeX source of the landscape timeline PDF.
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateTimelineLatex } = require('./document');

const TODAY = new Date(Date.UTC(2026, 9, 3));
const resume = {
  basics: { name: 'Baptiste Grosjean', label: 'Informaticien' },
  work: [
    { id: 'w', company: 'R&D Lab', position: 'Dev', startDate: '2023-01', endDate: '2024-06' },
  ],
  education: [],
  projects: [],
  volunteer: [],
};

test('the page is A4 in landscape', () => {
  assert.match(generateTimelineLatex(resume, 'fr', TODAY), /\\geometry\{landscape/);
});

test('it is titled after the timeline, in the language of the CV', () => {
  assert.match(generateTimelineLatex(resume, 'fr', TODAY), /Chronologie/);
});

test('each bar is named, with TeX specials escaped', () => {
  assert.match(generateTimelineLatex(resume, 'fr', TODAY), /R\\&D Lab/);
});

test('each lane is titled in the language of the CV', () => {
  assert.match(generateTimelineLatex(resume, 'de', TODAY), /Berufserfahrung/);
});

test('a span says which years it covers, under the title', () => {
  assert.match(generateTimelineLatex(resume, 'fr', TODAY, 5), /5 dernières années/);
});

test('the whole career names no span', () => {
  assert.doesNotMatch(generateTimelineLatex(resume, 'fr', TODAY), /dernières années/);
});

test('a bar cut by the span points left, past the start of the axis', () => {
  const old = {
    ...resume,
    work: [{ ...resume.work[0], startDate: '2020-01', endDate: '2025-06' }],
  };
  assert.match(
    generateTimelineLatex(old, 'fr', TODAY, 2),
    /\(-0\.20,[^)]*\) -- \(-1\.60,[^)]*\) -- \(-0\.20,[^)]*\) -- cycle/,
  );
});

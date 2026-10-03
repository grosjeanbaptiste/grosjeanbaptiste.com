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

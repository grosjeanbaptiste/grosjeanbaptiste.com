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

test('the first sheet is landscape and the timeline comes again upright after it', () => {
  const tex = generateTimelineLatex(resume, 'fr', TODAY);
  assert.match(tex, /\\begin\{landscape\}[\s\S]*\\end\{landscape\}[\s\S]*\\begin\{tikzpicture\}/);
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

test('the header carries the photo, the contacts and the highest degree', () => {
  const cv = {
    ...resume,
    basics: { ...resume.basics, email: 'a@b.c', phone: '+32 1' },
    education: [
      {
        institution: 'UMons',
        studyType: 'Master',
        area: 'Informatique',
        startDate: '2022-10',
        endDate: '2026-09',
      },
    ],
  };
  const tex = generateTimelineLatex(cv, 'fr', TODAY);
  assert.match(tex, /\\@makeaphoto\{17mm\}\{profil\}/);
  assert.match(tex, /\\email\{a@b\.c\}/);
  assert.match(tex, /faGraduationCap[^\n]*Informatique/);
});

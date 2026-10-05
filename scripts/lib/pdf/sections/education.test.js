// A degree in the PDF: its heading, then what it carried — the projects on the
// left and, in a column to their right, the volunteering done at the school.
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildEducation } = require('./education');
const { buildWork } = require('./work');
const I18N = require('../i18n');

const LIMITS = { work: 8, education: 2, summary: 220, proj_desc: 80, show_skills: false };
const resume = {
  work: [
    { company: 'Acteble', position: 'Founder', startDate: '2025-07-01', projects: ['Acteble'] },
  ],
  education: [
    {
      institution: 'UMons',
      studyType: 'Master',
      startDate: '2022-10-15',
      endDate: '2026-09-04',
      projects: ['Remi', 'Algorithmique'],
    },
    { institution: 'ULB', studyType: 'Bachelor', startDate: '2015-09-01', endDate: '2016-06-30' },
  ],
  projects: [
    { name: 'Remi', summary: 'Reminiscence app', startDate: '2024-12-01', endDate: '2025-06-30' },
    { name: 'Acteble', summary: 'Mobile app', startDate: '2025-07-01' },
    { name: 'Algorithmique', entity: 'UMons', type: 'Course unit' },
  ],
  volunteer: [
    {
      organization: 'UMons',
      position: 'Buddy TandeMons',
      startDate: '2023-11-30',
      endDate: '2026-09-04',
    },
  ],
};
const education = () => buildEducation(resume, I18N.en, 'en', LIMITS);
const umons = () => education().split('\\divider')[0];

test('a degree lists the projects it carried', () => {
  assert.match(umons(), /\\item \\textbf\{Remi\} — Reminiscence app/);
});

test('its course units stay out of the PDF', () => {
  assert.doesNotMatch(education(), /Algorithmique/);
});

test('a degree shows the volunteering done at its school', () => {
  assert.match(umons(), /\\textbf\{Volunteer:\}[\s\S]*\\item \\textbf\{Buddy TandeMons\}/);
});

test('the volunteering is a column to the right of the projects', () => {
  const tex = umons();
  const columns = [...tex.matchAll(/\\begin\{minipage\}\[t\]/g)].map((m) => m.index);
  assert.equal(columns.length, 2);
  assert.ok(columns[0] < tex.indexOf('Remi') && tex.indexOf('Remi') < columns[1]);
  assert.ok(columns[1] < tex.indexOf('Buddy TandeMons'));
});

test('under its school a role gives its period, never broken across lines', () => {
  assert.match(umons(), /\\textbf\{Buddy TandeMons\} — \\mbox\{Nov 2023 -- Sep 2026\}/);
});

test('a degree that carried nothing shows no column at all', () => {
  const ulb = education().split('\\divider')[1];
  assert.doesNotMatch(ulb, /minipage|itemize/);
});

test('an experience without volunteering keeps its projects across the full width', () => {
  const work = buildWork(resume, I18N.en, 'en', LIMITS);
  assert.match(work, /\\item \\textbf\{Acteble\} — Mobile app/);
  assert.doesNotMatch(work, /minipage/);
});

test('an experience shows the volunteering done there, to the right of its projects', () => {
  const withRole = {
    ...resume,
    volunteer: [{ organization: 'Acteble', position: 'Mentor', startDate: '2025-09-01' }],
  };
  const work = buildWork(withRole, I18N.en, 'en', LIMITS);
  assert.ok(work.indexOf('\\textbf{Acteble}') < work.indexOf('\\textbf{Mentor}'));
  assert.equal([...work.matchAll(/\\begin\{minipage\}\[t\]/g)].length, 2);
});

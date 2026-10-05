// Behavioural tests for the PDF volunteering section.
//
// Volunteering was the one part of the CV that existed on the site but not in
// the PDF — nothing under scripts/lib/pdf/ read `volunteer`, and the education
// summary that mentions it is cut by every fit plan's truncation. So the
// printed CV said nothing about four years of it.
//
// It is rendered in the shape the project lists already use — bold name, em
// dash, details — so the two read as the same kind of list rather than as a
// new visual idiom.

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildVolunteer } = require('./volunteer');
const I18N = require('../i18n');

const resume = {
  volunteer: [
    {
      organization: 'EPHEC',
      position: 'Tutor',
      startDate: '2019-09-30',
      endDate: '2022-10-15',
    },
    {
      organization: 'UMons',
      position: 'Buddy TandeMons',
      startDate: '2023-11-30',
      endDate: '2026-09-04',
    },
  ],
};

test('every volunteer role reaches the section', () => {
  const tex = buildVolunteer(resume, I18N.en, 'en');
  assert.match(tex, /Buddy TandeMons/);
  assert.match(tex, /Tutor/);
});

test('a role carries its organization and both dates', () => {
  const tex = buildVolunteer(resume, I18N.en, 'en');
  assert.match(tex, /UMons/);
  assert.match(tex, /Nov 2023 -- Sep 2026/);
});

test('roles render in the same shape as a project list', () => {
  const tex = buildVolunteer(resume, I18N.en, 'en');
  // \textbf{name} — details, one \item per role inside a tight itemize.
  assert.match(tex, /\\item \\textbf\{Buddy TandeMons\} — /);
  assert.match(tex, /\\begin\{itemize\}\\itemsep=0pt/);
});

test('the most recent role comes first', () => {
  const tex = buildVolunteer(resume, I18N.en, 'en');
  assert.ok(tex.indexOf('Buddy TandeMons') < tex.indexOf('Tutor'));
});

test('the heading is localized', () => {
  assert.match(buildVolunteer(resume, I18N.fr, 'fr'), /Bénévolat/);
});

test('nothing is emitted when there is no volunteering', () => {
  assert.equal(buildVolunteer({}, I18N.en, 'en'), '');
  assert.equal(buildVolunteer({ volunteer: [] }, I18N.en, 'en'), '');
});

// Where the roles go is no longer this section's business: the CV shows each
// role inside the experience or the degree that hosts it, in a column to the
// right of its projects (education.test.js), and in the timeline of the verso.

// The column a role is written in is narrow. In Dutch and Spanish the
// translated position is long enough to push the period past the column edge,
// and TeX broke it at the last space — leaving the year alone on the next
// line, "… nov 2023 – sep" / "2026". English, French, German and Chinese all
// fitted, so it only showed in two of the six sheets.
//
// An \mbox makes the period atomic: it moves to the next line whole, or not
// at all.
test('the period never breaks across lines', () => {
  const latex = buildVolunteer(resume, I18N.en, 'en');
  assert.match(latex, /\\mbox\{Nov 2023 -- Sep 2026\}/);
});

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

// The point of the placement, not just of the markup: the verso's left column
// was blank because buildReferences is emitted after \switchcolumn. Filling it
// is what makes the section free. If it ever moves after the switch it lands
// under the references and the page count is at risk again.
test('the section occupies the verso left column, before the switch', () => {
  const { generateLatex } = require('../document');
  const { loadResume } = require('../data');
  const { FIT_PLANS } = require('../config');
  const latex = generateLatex(loadResume('en'), 'en', FIT_PLANS[4]);
  // The heading text goes through nohyphen(), so match the macro, not a literal.
  const heading = latex.search(/\\cvsectionsidebar\{[^}]*Volunteer/);
  const switchAt = latex.lastIndexOf('\\switchcolumn');
  assert.ok(heading > 0, 'the volunteering section is not in the document');
  assert.ok(heading < switchAt, 'the volunteering section is not in the left column');
});

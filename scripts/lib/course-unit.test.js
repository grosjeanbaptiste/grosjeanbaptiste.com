// A course unit is a course, never a project. The CV's data keeps the two in
// separate sections, as it keeps education apart from work: a degree names
// the courses it carried under `courses`, never among its `projects`.
const test = require('node:test');
const assert = require('node:assert/strict');

const { findCourse } = require('./course-unit');
const { anchorOf } = require('./anchors');
const { loadResume } = require('./data');
const { timelineOf } = require('./timeline-model');

const unit = { name: 'Projet de développement web', entity: 'EPHEC' };
const project = { name: 'Remi', type: 'Mobile Application' };
const degree = { institution: 'EPHEC', projects: ['Remi'], courses: [unit.name] };
const resume = {
  work: [],
  volunteer: [],
  education: [degree],
  projects: [project],
  courses: [unit],
};

test('a course is found among the courses of the CV', () => {
  assert.equal(findCourse(resume, unit.name), unit);
});

test('a project is not found among the courses', () => {
  assert.equal(findCourse(resume, 'Remi'), undefined);
});

test('every course a degree of the CV names is a course of the CV', () => {
  const cv = loadResume('en');
  const named = cv.education.flatMap((e) => e.courses || []);
  assert.deepEqual(
    named.filter((name) => !findCourse(cv, name)),
    [],
  );
  assert.equal(named.length, 50);
});

test('the line of a course is named as a course', () => {
  assert.equal(anchorOf('course', unit), 'course-projet-de-developpement-web');
});

test('a dated course is never drawn among the projects', () => {
  const span = { startDate: '2024-01-01', endDate: '2024-06-30' };
  const dated = {
    ...resume,
    education: [],
    projects: [{ ...project, ...span }],
    courses: [{ ...unit, ...span }],
  };
  const names = timelineOf(dated, new Date('2026-01-01'))
    .lanes.flatMap((lane) => lane.bars)
    .map((bar) => bar.name);
  assert.deepEqual(names, ['Remi']);
});

test('no project of the CV is a course unit', () => {
  const filed = loadResume('en').projects.filter((p) => p.type === 'Course unit');
  assert.deepEqual(filed, []);
});

// resume.json is a JSON Resume file anyone's tools can read: the courses live
// in the repository's own sidecar, and the loader puts the two together.
test('the JSON Resume file carries no section of its own invention', () => {
  const { RESUME_PATH } = require('./config');
  const strict = JSON.parse(require('node:fs').readFileSync(RESUME_PATH, 'utf8'));
  assert.equal(strict.courses, undefined);
  assert.deepEqual(strict.education[0].courses.slice(0, 1), ['Algorithmique']);
});

test('no name is both a project and a course', () => {
  const { projects, courses } = loadResume('en');
  const both = courses.filter((c) => projects.some((p) => p.name === c.name));
  assert.deepEqual(both, []);
});

test('a course carries its title in the language of the page', () => {
  const title = (lang) => findCourse(loadResume(lang), 'Réseaux').summary;
  assert.deepEqual([title('en'), title('nl')], ['Networks', 'Netwerken']);
});

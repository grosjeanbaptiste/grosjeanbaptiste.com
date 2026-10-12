// A course unit is a course, never a project. The CV's data files both in one
// list, told apart by their type: everything that draws or names an entry
// asks here which of the two it holds.
const test = require('node:test');
const assert = require('node:assert/strict');

const { isCourseUnit, kindOf } = require('./course-unit');
const { anchorOf } = require('./anchors');
const { timelineOf } = require('./timeline-model');

const unit = { name: 'Projet de développement web', type: 'Course unit' };
const project = { name: 'Remi', type: 'Mobile Application' };

test('a course unit is told by its type', () => {
  assert.equal(isCourseUnit(unit), true);
});

test('a project is not a course unit', () => {
  assert.equal(isCourseUnit(project), false);
});

test('nothing is not a course unit', () => {
  assert.equal(isCourseUnit(undefined), false);
});

test('a course unit is of the course kind, whatever its name holds', () => {
  assert.equal(kindOf(unit), 'course');
});

test('a project is of the project kind', () => {
  assert.equal(kindOf(project), 'project');
});

test('the line of a course unit is named as a course', () => {
  assert.equal(anchorOf(kindOf(unit), unit), 'course-projet-de-developpement-web');
});

test('a dated course unit is never drawn among the projects', () => {
  const resume = {
    work: [],
    education: [],
    volunteer: [],
    projects: [
      { ...unit, startDate: '2024-01-01', endDate: '2024-06-30' },
      { ...project, startDate: '2024-01-01', endDate: '2024-06-30' },
    ],
  };
  const names = timelineOf(resume, new Date('2026-01-01'))
    .lanes.flatMap((lane) => lane.bars)
    .map((bar) => bar.name);
  assert.deepEqual(names, ['Remi']);
});

// A course unit is a course, never a project: it may hold a project, and it
// stays a course. The CV's data files the two in one list, told apart by
// their type — asked here, so no renderer draws or names a unit as a project.
const isCourseUnit = (record) => record?.type === 'Course unit';

// The kind an entry of that list is of: what its line on the page is named by.
const kindOf = (record) => (isCourseUnit(record) ? 'course' : 'project');

module.exports = { isCourseUnit, kindOf };

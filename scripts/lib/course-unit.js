// A course unit is a course, never a project: the CV's data keeps courses in
// their own section, and a degree names the ones it carried under `courses`,
// apart from its `projects`. Everything that needs a course asks here.
const findCourse = (resume, name) => (resume.courses || []).find((c) => c.name === name);

module.exports = { findCourse };

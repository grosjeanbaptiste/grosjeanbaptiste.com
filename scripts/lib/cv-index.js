// Query: the entries of the CV as the classic page's search and skill filter
// read them — what the interactive view calls its entries
// (react/src/domain/entries.ts). One line per experience, degree, project,
// course unit, role and competition, under the id it carries on the page
// (anchors.js), so a hit or a filter can point at its entry and at its bars.
const { anchorOf } = require('./anchors');

// What each kind of record is read by: its title, who it was for, a line on
// what it was, and the skills it used.
const SHAPES = {
  work: (w) => ({
    title: w.position,
    organisation: w.company,
    summary: w.summary,
    skills: w.skills,
  }),
  // A degree: its type, then its speciality.
  education: (e) => ({
    title: e.studyType || e.institution,
    organisation: e.institution,
    subtitle: e.area,
    summary: e.summary,
    skills: e.skills,
  }),
  project: (p) => ({
    title: p.name,
    organisation: p.entity,
    subtitle: p.description,
    summary: p.summary,
    skills: p.keywords,
  }),
  // A course unit: its official designation, then its translated title.
  course: (c) => ({
    title: c.name,
    organisation: c.entity,
    subtitle: c.summary,
    skills: c.keywords,
  }),
  volunteer: (v) => ({ title: v.position, organisation: v.organization, summary: v.summary }),
  competition: (c) => ({ title: c.title, organisation: c.organizer, summary: c.summary }),
};
const SECTIONS = [
  ['work', 'work'],
  ['education', 'education'],
  ['projects', 'project'],
  ['courses', 'course'],
  ['volunteer', 'volunteer'],
  ['competitions', 'competition'],
];

function entryOf(kind, record) {
  const { skills, ...read } = SHAPES[kind](record);
  const told = Object.fromEntries(Object.entries(read).filter(([, text]) => text));
  return { id: anchorOf(kind, record), kind, ...told, skills: [...new Set(skills || [])] };
}

const entriesOf = (resume) =>
  SECTIONS.flatMap(([section, kind]) => (resume[section] || []).map((r) => entryOf(kind, r)));

// Skills are compared by exact name: "C", "C#" and "C++" are three skills.
function skillUsage(entries) {
  const counts = new Map();
  for (const entry of entries)
    for (const skill of new Set(entry.skills)) counts.set(skill, (counts.get(skill) ?? 0) + 1);
  return [...counts]
    .map(([skill, uses]) => ({ skill, uses }))
    .sort((a, b) => b.uses - a.uses || a.skill.localeCompare(b.skill));
}

module.exports = { entriesOf, skillUsage };

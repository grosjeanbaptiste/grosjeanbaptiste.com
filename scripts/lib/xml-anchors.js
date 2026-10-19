// The ids the XML mirrors hand the XSLT themes, the classic page's own
// (anchors.js): each job and degree carries its `anchor`; each project, course
// unit and volunteering role too, with `anchoredIn`, the anchor of the entry
// whose row keeps the id. A row is listed under every entry that names it, and
// only its first appearance in the page keeps the id — as sections/main.js
// does — which XSLT 1.0 cannot find out by itself.
const { anchorOf } = require('./anchors');

const HOSTS = { work: 'company', education: 'institution' };

// The volunteering a host lists: by the first word of its organization, the
// rule of sections/embeds.js and of both themes.
const volunteersOf = (volunteer, hostName) =>
  (volunteer || []).filter((v) => {
    const firstWord = v.organization?.split(/\s+/)[0];
    return hostName && firstWord && hostName.includes(firstWord);
  });

// The rows an entry lists, in the classic page's order (sections/embeds.js).
const rowsOf = (resume, section, entry) => [
  ...(entry.projects || []).map((name) => `project:${name}`),
  ...(entry.courses || []).map((name) => `course:${name}`),
  ...volunteersOf(resume.volunteer, entry[HOSTS[section]]).map(
    (v) => `volunteer:${anchorOf('volunteer', v)}`,
  ),
];

// `${kind}:${name}` → the anchor of the first entry that lists that row.
function firstHosts(resume) {
  const order = resume.meta?.sectionOrder ?? ['about', 'work', 'education', 'references'];
  const hosts = new Map();
  for (const section of order.filter((name) => HOSTS[name]))
    for (const entry of resume[section] || [])
      for (const key of rowsOf(resume, section, entry))
        if (!hosts.has(key)) hosts.set(key, anchorOf(section, entry));
  return hosts;
}

function anchoredResume(resume) {
  const hosts = firstHosts(resume);
  const own = (kind, key) => (r) => ({
    ...r,
    anchor: anchorOf(kind, r),
    anchoredIn: hosts.get(`${kind}:${key(r)}`),
  });
  const each = (entries, tag) => (entries ? entries.map(tag) : entries);
  return {
    ...resume,
    work: each(resume.work, (e) => ({ ...e, anchor: anchorOf('work', e) })),
    education: each(resume.education, (e) => ({ ...e, anchor: anchorOf('education', e) })),
    projects: each(
      resume.projects,
      own('project', (p) => p.name),
    ),
    courses: each(
      resume.courses,
      own('course', (c) => c.name),
    ),
    volunteer: each(
      resume.volunteer,
      own('volunteer', (v) => anchorOf('volunteer', v)),
    ),
  };
}

module.exports = { anchoredResume };

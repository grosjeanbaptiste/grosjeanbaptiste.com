// The ids the XML mirrors hand the XSLT themes, the classic page's own
// (anchors.js): each job and degree carries its `anchor`; each project, course
// unit and volunteering role too, with `anchoredIn`, the anchor of the entry
// whose row keeps the id. A row is listed under every entry that names it, and
// only its first appearance in the page keeps the id — as sections/main.js
// does — which XSLT 1.0 cannot find out by itself.
// Each entry also carries `app`, where the interactive view shows it
// (/app/{lang}/{kind}/{id}/). The ids are the app's own (react/scripts/
// export-lib.mjs), read from the data its build exported, the English entry's
// slug in every language; only the list's length is checked here, and
// xslt-app-links.test.js holds the rest.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');
const { anchorOf } = require('./anchors');

const APP_KINDS = {
  work: 'work',
  education: 'education',
  projects: 'project',
  courses: 'course',
  volunteer: 'volunteer',
};

function appIds() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'app/data/en.json'), 'utf8')).resume;
  } catch {
    return {};
  }
}

// `section`'s entries with the interactive view's path, when the app's data
// lists the same entries.
function withApp(section, entries, lang, ids) {
  const known = ids[section];
  if (!entries || known?.length !== entries.length) return entries;
  return entries.map((e, i) => ({
    ...e,
    app: `/app/${lang}/${APP_KINDS[section]}/${known[i].id}/`,
  }));
}

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

function anchoredResume(resume, lang) {
  const hosts = firstHosts(resume);
  const ids = appIds();
  const own = (kind, key) => (r) => ({
    ...r,
    anchor: anchorOf(kind, r),
    anchoredIn: hosts.get(`${kind}:${key(r)}`),
  });
  const each = (entries, tag) => (entries ? entries.map(tag) : entries);
  const linked = (section, entries) => withApp(section, entries, lang, ids);
  return {
    ...resume,
    work: linked(
      'work',
      each(resume.work, (e) => ({ ...e, anchor: anchorOf('work', e) })),
    ),
    education: linked(
      'education',
      each(resume.education, (e) => ({ ...e, anchor: anchorOf('education', e) })),
    ),
    projects: linked(
      'projects',
      each(
        resume.projects,
        own('project', (p) => p.name),
      ),
    ),
    courses: linked(
      'courses',
      each(
        resume.courses,
        own('course', (c) => c.name),
      ),
    ),
    volunteer: linked(
      'volunteer',
      each(
        resume.volunteer,
        own('volunteer', (v) => anchorOf('volunteer', v)),
      ),
    ),
  };
}

module.exports = { anchoredResume };

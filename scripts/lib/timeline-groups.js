// Which entry carried what: the grouping behind every timeline of the CV (the
// classic page and the XSLT themes through timeline-model.js, the PDFs through
// pdf/timeline/bars.js). An experience, a degree or a competition is a host; a
// project belongs to the hosts that reference it by name, a volunteering role
// to the host of its organisation. Bars are measured in months
// (year * 12 + month - 1), an ongoing entry running to the current month.
const { anchorOf } = require('./anchors');
const { hostsProject: namesProject, namesRole } = require('./hosting');

const ISO = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/;

function monthOf(text) {
  const match = ISO.exec(String(text));
  if (!match) throw new Error(`Unreadable date "${text}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  return Number(match[1]) * 12 + (match[2] ? Number(match[2]) : 1) - 1;
}

const ongoing = (end) => !end || end === 'Present';
const datedProjects = (resume) =>
  (resume.projects || []).filter((p) => !p.courseUnit && p.startDate);
const datedRoles = (resume) => (resume.volunteer || []).filter((v) => v.startDate);

// What each kind of entry reads from its record: its bar's name, then the rest.
const SHAPES = {
  work: { name: (w) => w.company, title: (w) => w.position },
  education: { name: (e) => e.institution, title: (e) => e.studyType },
  competition: { name: (c) => c.title, title: (c) => c.organizer },
  project: { name: (p) => p.name, title: (p) => p.entity },
  // Under its organisation's entry the role is what tells two bars apart.
  volunteer: { name: (v) => v.position, title: (v) => v.organization },
};

function barOf(kind, record, now) {
  const start = monthOf(record.startDate);
  const end = ongoing(record.endDate) ? now : monthOf(record.endDate);
  const name = SHAPES[kind].name(record) || '';
  if (end < start)
    throw new Error(`${name} ends (${record.endDate}) before it starts (${record.startDate})`);
  return {
    kind,
    ongoing: ongoing(record.endDate),
    anchor: anchorOf(kind, record),
    record,
    start,
    end,
    name,
    title: SHAPES[kind].title(record) || '',
  };
}

// A project belongs to the entries that reference it by name; a role, to the
// entry of its organisation (lib/hosting.js).
// A competition is held on a day: it is an entry of one month.
const held = (c) => ({ ...c, startDate: c.date, endDate: c.date });
const hosts = (resume) => [
  ...(resume.work || [])
    .filter((w) => w.startDate)
    .map((record) => ({ kind: 'work', record, name: record.company })),
  ...(resume.education || [])
    .filter((e) => e.startDate)
    .map((record) => ({ kind: 'education', record, name: record.institution })),
  ...(resume.competitions || [])
    .filter((c) => c.date)
    .map((c) => ({ kind: 'competition', record: held(c), name: c.title })),
];
const hostsProject = (host, project) => namesProject(host.record, project);
const hostsRole = (host, role) => namesRole(host.name, role);

// One host with what it carried, unpacked: each display packs rows its own way.
function groupOf(host, resume, now) {
  const carried = [
    ...datedProjects(resume)
      .filter((p) => hostsProject(host, p))
      .map((p) => barOf('project', p, now)),
    ...datedRoles(resume)
      .filter((v) => hostsRole(host, v))
      .map((v) => barOf('volunteer', v, now)),
  ];
  return { head: barOf(host.kind, host.record, now), children: carried };
}

// Every entry of the CV, by lane: hosts with what they carried, then whatever
// nothing hosts, each standing alone.
function entryGroups(resume, now) {
  const all = hosts(resume);
  const groups = (kind) => all.filter((h) => h.kind === kind).map((h) => groupOf(h, resume, now));
  const alone = (kind, records) =>
    records.map((r) => ({ head: barOf(kind, r, now), children: [] }));
  const unhostedProjects = datedProjects(resume).filter(
    (p) => !all.some((h) => hostsProject(h, p)),
  );
  const unhostedRoles = datedRoles(resume).filter((v) => !all.some((h) => hostsRole(h, v)));
  return [
    { kind: 'work', groups: groups('work') },
    { kind: 'education', groups: groups('education') },
    { kind: 'competitions', groups: groups('competition') },
    { kind: 'projects', groups: alone('project', unhostedProjects) },
    { kind: 'volunteer', groups: alone('volunteer', unhostedRoles) },
  ].filter((lane) => lane.groups.length > 0);
}

const monthNow = (today) => today.getUTCFullYear() * 12 + today.getUTCMonth();

module.exports = { entryGroups, monthOf, monthNow };

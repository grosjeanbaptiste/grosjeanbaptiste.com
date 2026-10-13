// Which entry carried what: the grouping behind every timeline of the CV (the
// classic page and the XSLT themes through timeline-model.js, the PDFs through
// pdf/timeline/bars.js). An experience, a degree or a competition is a host; a
// project belongs to the hosts that reference it by name, a volunteering role
// to the host of its organisation. Bars are measured in months
// (year * 12 + month - 1) and placed to the day, an ongoing entry running to
// the end of the current month.
const { anchorOf } = require('./anchors');
const { blocksOf } = require('./timeline-blocks');
const { monthOf, monthNow, ongoing, spanOf } = require('./timeline-dates');
const { hostsProject: namesProject, namesRole } = require('./hosting');
const { detailsOf } = require('./timeline-details');

const datedProjects = (resume) => (resume.projects || []).filter((p) => p.startDate);
const datedRoles = (resume) => (resume.volunteer || []).filter((v) => v.startDate);

// What each kind of entry reads from its record: its bar's name, then the rest.
const SHAPES = {
  work: { name: (w) => w.company, title: (w) => w.position },
  // A degree: its type, then its speciality — what was studied.
  education: {
    name: (e) => e.institution,
    title: (e) => [e.studyType, e.area].filter(Boolean).join(' — '),
  },
  competition: { name: (c) => c.title, title: (c) => c.organizer },
  project: { name: (p) => p.name, title: (p) => p.entity },
  // Under its organisation's entry the role is what tells two bars apart.
  volunteer: { name: (v) => v.position, title: (v) => v.organization },
};

function barOf(kind, record, now) {
  const name = SHAPES[kind].name(record) || '';
  const { start, end } = spanOf(record, name, now);
  return {
    kind,
    ongoing: ongoing(record.endDate),
    anchor: anchorOf(kind, record),
    record,
    start,
    end,
    name,
    title: SHAPES[kind].title(record) || '',
    // What it tells beyond that: a project its kind, its roles, its stack.
    ...detailsOf(kind, record),
    // A degree is followed by day or on an evening schedule; nothing else has one.
    ...(kind === 'education' ? { schedule: record.schedule || 'day' } : {}),
  };
}

// A project belongs to the entries that reference it by name; a role, to the
// entry of its organisation (lib/hosting.js).
// A competition is held on a day: it is an entry of one month.
// On the timeline it shows as its month: a day would be a hairline.
const monthly = (date) => String(date).slice(0, 7);
const held = (c) => ({ ...c, startDate: monthly(c.date), endDate: monthly(c.date) });
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
// `blocks`: the academic years of a degree, to be drawn on one row of their own.
// What an entry carried is drawn for as long as the entry carried it: a
// project that outlives its degree (a dissertation that became a company) stops
// under the degree when the degree was obtained. A bar the host names but never
// overlapped is left on its own dates rather than dropped.
function during(head, bar) {
  const start = Math.max(bar.start, head.start);
  const end = Math.min(bar.end, head.end);
  if (end + 1 <= start) return bar;
  return { ...bar, start, end, ongoing: bar.ongoing && end === bar.end };
}

function groupOf(host, resume, now) {
  const head = barOf(host.kind, host.record, now);
  const carried = [
    ...datedProjects(resume)
      .filter((p) => hostsProject(host, p))
      .map((p) => barOf('project', p, now)),
    ...datedRoles(resume)
      .filter((v) => hostsRole(host, v))
      .map((v) => barOf('volunteer', v, now)),
  ];
  return {
    head,
    children: carried.map((bar) => during(head, bar)),
    blocks: blocksOf(host.record, now, resume),
  };
}

// Every entry of the CV, by lane: hosts with what they carried, then whatever
// nothing hosts, each standing alone.
function entryGroups(resume, now) {
  const all = hosts(resume);
  const groups = (kind) => all.filter((h) => h.kind === kind).map((h) => groupOf(h, resume, now));
  const alone = (kind, records) =>
    records.map((r) => ({ head: barOf(kind, r, now), children: [], blocks: [] }));
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

module.exports = { entryGroups, monthOf, monthNow };

// Which entry carried what: the grouping behind every timeline of the CV (the
// classic page and the XSLT themes through timeline-model.js, the PDFs through
// pdf/timeline/bars.js). An experience, a degree or a competition is a host; a
// project belongs to the hosts that reference it by name, a volunteering role
// to the host of its organisation. Bars are measured in months
// (year * 12 + month - 1) and placed to the day, an ongoing entry running to
// the end of the current month.
const { anchorOf } = require('./anchors');
const { hostsProject: namesProject, namesRole } = require('./hosting');

const ISO = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

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

// Where a date falls, in months and to the day: the 15th of a 30-day month is
// 14/30 of the way in. A date given to the month only is its first day.
function dayOf(text) {
  const month = monthOf(text);
  const day = ISO.exec(String(text))[3];
  if (!day) return month;
  const days = new Date(Date.UTC(Math.floor(month / 12), (month % 12) + 1, 0)).getUTCDate();
  return month + (Number(day) - 1) / days;
}

// A bar runs from `start` to `end + 1` (the convention of whole months, kept:
// an entry dated to the month covers its last month). Dated to the day, it
// stops as its last day begins — so an entry that begins the day another ends
// follows it without overlapping — and is never shorter than a day.
const A_DAY = 1 / 31;
function spanOf(record, name, now) {
  const start = dayOf(record.startDate);
  if (ongoing(record.endDate)) return { start, end: now };
  const toTheDay = ISO.exec(String(record.endDate))?.[3];
  const until = toTheDay ? dayOf(record.endDate) : monthOf(record.endDate) + 1;
  if (until < start)
    throw new Error(`${name} ends (${record.endDate}) before it starts (${record.startDate})`);
  return { start, end: Math.max(until, start + A_DAY) - 1 };
}

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

// A degree is followed year by year: each academic year is a block, a part of
// the degree rather than an entry — it links nowhere. "2022-2023" reads "22-23".
const shortYear = (year) => String(year || '').replace(/\b\d\d(\d\d)\b/g, '$1');
function blockBar(block, now) {
  const name = shortYear(block.year);
  const { start, end } = spanOf(block, name, now);
  return {
    kind: 'block',
    ongoing: false,
    anchor: null,
    record: block,
    start,
    end,
    name,
    title: block.label || '',
  };
}
const blocksOf = (record, now) =>
  (record.blocks || []).filter((b) => b.startDate).map((b) => blockBar(b, now));

// One host with what it carried, unpacked: each display packs rows its own way.
// `blocks`: the academic years of a degree, to be drawn on one row of their own.
function groupOf(host, resume, now) {
  const carried = [
    ...datedProjects(resume)
      .filter((p) => hostsProject(host, p))
      .map((p) => barOf('project', p, now)),
    ...datedRoles(resume)
      .filter((v) => hostsRole(host, v))
      .map((v) => barOf('volunteer', v, now)),
  ];
  return {
    head: barOf(host.kind, host.record, now),
    children: carried,
    blocks: blocksOf(host.record, now),
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

const monthNow = (today) => today.getUTCFullYear() * 12 + today.getUTCMonth();

module.exports = { entryGroups, monthOf, monthNow };

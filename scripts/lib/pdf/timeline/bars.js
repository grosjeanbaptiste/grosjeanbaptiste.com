// Query: the read model behind the landscape timeline PDF — the interactive
// view's timeline, on paper. One lane per kind of entry, one bar per dated
// entry, measured in months (year * 12 + month - 1), up to the current month.

const { truncate } = require('../tex');

// Long names ("EDITx: IT Challenges, IT Jobs, Education in IT for X") would
// push their row's neighbours far along; the bar's place says the rest.
const STRONG_MAX = 30;
const REST_MAX = 34;

const ISO = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/;

function monthOf(text) {
  const match = ISO.exec(String(text));
  if (!match) throw new Error(`Unreadable date "${text}" (expected YYYY, YYYY-MM or YYYY-MM-DD)`);
  return Number(match[1]) * 12 + (match[2] ? Number(match[2]) : 1) - 1;
}

const isOngoing = (endDate) => !endDate || endDate === 'Present';

// What each lane reads from its records: the name in bold, then the rest.
const LANES = [
  { kind: 'work', records: (r) => r.work, strong: (w) => w.company, rest: (w) => w.position },
  {
    kind: 'education',
    records: (r) => r.education,
    strong: (e) => e.institution,
    rest: (e) => e.studyType,
  },
  {
    kind: 'projects',
    records: (r) => (r.projects || []).filter((p) => !p.courseUnit),
    strong: (p) => p.name,
    rest: (p) => p.entity,
  },
  {
    kind: 'volunteer',
    records: (r) => r.volunteer,
    strong: (v) => v.organization,
    rest: (v) => v.position,
  },
];

function barOf(lane, record, now) {
  const start = monthOf(record.startDate);
  const ongoing = isOngoing(record.endDate);
  const end = ongoing ? now : monthOf(record.endDate);
  if (end < start) {
    throw new Error(`${record.id} ends (${record.endDate}) before it starts (${record.startDate})`);
  }
  return {
    id: record.id,
    start,
    end,
    ongoing,
    strong: truncate(lane.strong(record), STRONG_MAX),
    rest: truncate(lane.rest(record), REST_MAX),
  };
}

function timelineBars(resume, today) {
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const lanes = LANES.flatMap((lane) => {
    const dated = (lane.records(resume) || []).filter((record) => record.startDate);
    const bars = dated.map((record) => barOf(lane, record, now));
    return bars.length ? [{ kind: lane.kind, bars }] : [];
  });
  const starts = lanes.flatMap((lane) => lane.bars.map((bar) => bar.start));
  return { from: Math.min(now, ...starts), to: now, lanes };
}

module.exports = { timelineBars, monthOf };

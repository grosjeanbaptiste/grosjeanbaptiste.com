// Query: the classic page's timeline — the interactive view's, built at
// generation time. One lane per kind of entry, a bar per dated entry measured
// in months (year * 12 + month - 1), overlaps stacked in rows, the axis running
// from the earliest start to the current month.
const { monthOf } = require('./pdf/timeline/bars');
const { anchorOf } = require('./anchors');

const LANES = [
  {
    kind: 'work',
    anchor: 'work',
    records: (r) => r.work,
    name: (w) => w.company,
    title: (w) => w.position,
  },
  {
    kind: 'education',
    anchor: 'education',
    records: (r) => r.education,
    name: (e) => e.institution,
    title: (e) => e.studyType,
  },
  {
    kind: 'projects',
    anchor: 'project',
    records: (r) => (r.projects || []).filter((p) => !p.courseUnit),
    name: (p) => p.name,
    title: (p) => p.entity,
  },
  {
    kind: 'volunteer',
    anchor: 'volunteer',
    records: (r) => r.volunteer,
    name: (v) => v.organization,
    title: (v) => v.position,
  },
];

const ongoing = (end) => !end || end === 'Present';

// Greedy interval packing: each bar takes the first row free when it starts.
function packRows(bars) {
  const rowEnds = [];
  return [...bars]
    .sort((a, b) => a.start - b.start)
    .map((bar) => {
      let row = rowEnds.findIndex((end) => end < bar.start);
      if (row === -1) row = rowEnds.length;
      rowEnds[row] = bar.end;
      return { ...bar, row };
    });
}

function barOf(lane, record, now) {
  const start = monthOf(record.startDate);
  const end = ongoing(record.endDate) ? now : monthOf(record.endDate);
  if (end < start)
    throw new Error(
      `${lane.name(record)} ends (${record.endDate}) before it starts (${record.startDate})`,
    );
  return {
    anchor: anchorOf(lane.anchor, record),
    record,
    start,
    end,
    name: lane.name(record) || '',
    title: lane.title(record) || '',
  };
}

function timelineOf(resume, today) {
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const lanes = LANES.flatMap((lane) => {
    const bars = (lane.records(resume) || [])
      .filter((r) => r.startDate)
      .map((r) => barOf(lane, r, now));
    if (!bars.length) return [];
    const placed = packRows(bars);
    return [{ kind: lane.kind, rows: Math.max(...placed.map((b) => b.row)) + 1, bars: placed }];
  });
  const from = Math.min(now, ...lanes.flatMap((l) => l.bars.map((b) => b.start)));
  const years = [];
  for (let year = Math.floor(from / 12) + 1; year <= Math.floor(now / 12); year++)
    years.push({ year, month: year * 12 });
  return { from, months: now + 1 - from, years, lanes };
}

module.exports = { timelineOf };

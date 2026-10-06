// What the classic page and the XSLT themes share when they draw the timeline
// (scripts/lib/timeline-model.js): percentages, an entry's period in words, the
// lanes' titles and the zoom's choices.
const { formatDate } = require('./format');

const pct = (part, whole) => `${Number(((part / whole) * 100).toFixed(2))}%`;
const periodOf = (record, lang) =>
  `${formatDate(record.startDate, lang)} – ${formatDate(record.endDate, lang)}`;
// A bar's accessible name: what it is, when, and — for a degree followed on
// an evening schedule — that it was.
const labelOf = (bar, period, t) =>
  [bar.name, bar.title, period, bar.schedule === 'evening' ? t.scheduleEvening : null]
    .filter(Boolean)
    .join(' — ');
// The legend of the hatching, when the career has an evening degree.
const legendOf = (timeline, t) =>
  timeline.lanes.some((lane) => lane.bars.some((bar) => bar.schedule === 'evening'))
    ? { day: t.scheduleDay, evening: t.scheduleEvening }
    : undefined;
const LANE_LABEL = {
  work: 'experience',
  education: 'education',
  competitions: 'competitions',
  projects: 'projects',
  volunteer: 'volunteer',
};
// Years per screen; null is the whole career.
const zoomsOf = (t) =>
  [2, 5, null].map((years) => ({
    years: years ?? 'all',
    label: years === null ? t.wholeCareer : t.lastYears(years),
  }));

module.exports = { pct, periodOf, labelOf, legendOf, LANE_LABEL, zoomsOf };

// The timeline as the XML mirrors carry it (meta/timeline), already laid out:
// XSLT 1.0 can neither do the month arithmetic nor pack overlapping bars into
// rows, so the themes are handed positions and only draw them — the entries,
// what each carried under it, and the outline of each such group.
const I18N = require('./i18n');
const { timelineOf } = require('./timeline-model');
const { pct, periodOf, labelOf, legendOf, LANE_LABEL, zoomsOf } = require('./timeline-view');

// The XSLT themes give an id to each job and each degree, nothing else: a bar
// leads to its own entry, or to the entry that carried it.
const ON_PAGE = new Set(['work', 'education']);
function targetOf(bar) {
  const entry = bar.depth === 0 ? bar : bar.host;
  return ON_PAGE.has(entry.kind) ? entry.anchor : undefined;
}

function timelineForXml(resume, lang, today) {
  const t = I18N[lang];
  const timeline = timelineOf(resume, today);
  return {
    title: t.timelineTitle,
    months: timeline.months,
    // What the moon on a bar means; absent when no bar carries one.
    legend: legendOf(timeline, t),
    zooms: zoomsOf(t),
    ticks: timeline.years.map((y) => ({
      label: y.year,
      left: pct(y.month - timeline.from, timeline.months),
    })),
    lanes: timeline.lanes.map((lane) => ({
      kind: lane.kind,
      label: t[LANE_LABEL[lane.kind]],
      rows: lane.rows,
      // The outline of each entry that carried something, behind its bars.
      groups: lane.groups.map((g) => ({
        left: pct(g.start - timeline.from, timeline.months),
        width: pct(g.end + 1 - g.start, timeline.months),
        row: g.row,
        rows: g.rows,
      })),
      bars: lane.bars.map((bar) => {
        const period = periodOf(bar.record, lang);
        return {
          target: targetOf(bar),
          kind: bar.kind,
          depth: bar.depth,
          name: bar.name,
          title: bar.title,
          caption: bar.caption,
          period,
          label: labelOf(bar, period, t),
          // 'evening' for a degree followed on an evening schedule.
          schedule: bar.schedule,
          left: pct(bar.start - timeline.from, timeline.months),
          width: pct(bar.end + 1 - bar.start, timeline.months),
          row: bar.row,
        };
      }),
    })),
  };
}

module.exports = { timelineForXml };

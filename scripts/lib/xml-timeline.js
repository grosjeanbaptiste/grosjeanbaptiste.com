// The timeline as the XML mirrors carry it (meta/timeline), already laid out:
// XSLT 1.0 can neither do the month arithmetic nor pack overlapping bars into
// rows, so the themes are handed positions and only draw them — the entries,
// what each carried under it, and the outline of each such group.
const I18N = require('./i18n');
const { withPrintRows } = require('./timeline-print');
const { toldBy, standsFor } = require('./timeline-details');
const { entriesOf } = require('./cv-index');
const { skillFilterForXml } = require('./xml-skill-filter');
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
  const timeline = withPrintRows(resume, today);
  // The skill filter the themes draw with no script (xml-skill-filter.js).
  const drawn = new Set(timeline.lanes.flatMap((lane) => lane.bars.map(standsFor)));
  const { filter, tokensOf } = skillFilterForXml(entriesOf(resume), drawn, t);
  return {
    title: t.timelineTitle,
    months: timeline.months,
    // What the moon on a bar means; absent when no bar carries one.
    legend: legendOf(timeline, t),
    zooms: zoomsOf(t),
    skillFilter: filter,
    ticks: timeline.years.map((y) => ({
      label: y.year,
      left: pct(y.month - timeline.from, timeline.months),
    })),
    lanes: timeline.lanes.map((lane) => ({
      kind: lane.kind,
      label: t[LANE_LABEL[lane.kind]],
      rows: lane.rows,
      // On paper the course units are left out and the rows close up.
      printRows: lane.printRows,
      // The outline of each entry that carried something, behind its bars.
      groups: lane.groups.map((g) => ({
        left: pct(g.start - timeline.from, timeline.months),
        width: pct(g.end + 1 - g.start, timeline.months),
        row: g.row,
        rows: g.rows,
        printRow: g.printRow,
        printRows: g.printRows,
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
          // The tokens of the skills its entry uses, for the filter to match on.
          uses: tokensOf(standsFor(bar)),
          period,
          // What a project tells beyond that, for the preview; absent otherwise.
          ...Object.fromEntries(toldBy(bar)),
          label: labelOf(bar, period, t),
          // 'evening' for a degree followed on an evening schedule.
          schedule: bar.schedule,
          left: pct(bar.start - timeline.from, timeline.months),
          width: pct(bar.end + 1 - bar.start, timeline.months),
          row: bar.row,
          printRow: bar.printRow,
        };
      }),
    })),
  };
}

module.exports = { timelineForXml };

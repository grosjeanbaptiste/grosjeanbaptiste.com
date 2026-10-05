// The timeline as the XML mirrors carry it (meta/timeline), already laid out:
// XSLT 1.0 can neither do the month arithmetic nor pack overlapping bars into
// rows, so the themes are handed positions and only draw them. A bar's target
// is the entry it leads to on the XSLT page — a job or a degree: a project or a
// volunteering role leads to the entry that hosts it there, as the themes
// embed them (projects by reference, volunteering by its organisation's first
// word), and has no target when none does.
const I18N = require('./i18n');
const { anchorOf } = require('./anchors');
const { timelineOf } = require('./timeline-model');
const { pct, periodOf, labelOf, LANE_LABEL, zoomsOf } = require('./timeline-view');

function targetsOf(resume) {
  const hosts = [
    ...(resume.work || []).map((w) => ({
      anchor: anchorOf('work', w),
      name: w.company,
      projects: w.projects,
    })),
    ...(resume.education || []).map((e) => ({
      anchor: anchorOf('education', e),
      name: e.institution,
      projects: e.projects,
    })),
  ];
  const firstWord = (text) => String(text || '').split(/\s+/)[0];
  return {
    work: (bar) => bar.anchor,
    education: (bar) => bar.anchor,
    projects: (bar) => hosts.find((h) => (h.projects || []).includes(bar.record.name))?.anchor,
    volunteer: (bar) => {
      const word = firstWord(bar.record.organization);
      return word ? hosts.find((h) => (h.name || '').includes(word))?.anchor : undefined;
    },
  };
}

function timelineForXml(resume, lang, today) {
  const t = I18N[lang];
  const timeline = timelineOf(resume, today);
  const targets = targetsOf(resume);
  return {
    title: t.timelineTitle,
    months: timeline.months,
    zooms: zoomsOf(t),
    ticks: timeline.years.map((y) => ({
      label: y.year,
      left: pct(y.month - timeline.from, timeline.months),
    })),
    lanes: timeline.lanes.map((lane) => ({
      kind: lane.kind,
      label: t[LANE_LABEL[lane.kind]],
      rows: lane.rows,
      bars: lane.bars.map((bar) => {
        const period = periodOf(bar.record, lang);
        return {
          target: targets[lane.kind](bar),
          name: bar.name,
          title: bar.title,
          period,
          label: labelOf(bar, period),
          left: pct(bar.start - timeline.from, timeline.months),
          width: pct(bar.end + 1 - bar.start, timeline.months),
          row: bar.row,
        };
      }),
    })),
  };
}

module.exports = { timelineForXml };

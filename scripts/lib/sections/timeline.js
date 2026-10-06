// The classic page's timeline section: a lane for the experiences and one for
// the degrees, bars placed in percent of the career. A project or a
// volunteering role is drawn under the entry that carried it, inside that
// entry's outline. Each bar is a link to its entry further down the page when
// the entry is there. js/timeline.js adds the zoom (hidden until it runs), the arrow keys
// and the hover preview; css/timeline.css lays it out.
const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { withPrintRows } = require('../timeline-print');
const { pct, periodOf, labelOf, legendOf, LANE_LABEL, zoomsOf } = require('../timeline-view');

// What the moon means: shown only when a degree carries one.
const legendHtml = (legend) =>
  legend
    ? [
        `  <p class="tl-legend"><span class="tl-moon" aria-hidden="true"></span>${escapeHtml(legend.evening)}</p>`,
      ]
    : [];

function renderBar(bar, timeline, lang, onPage, t) {
  const { record } = bar;
  const period = periodOf(record, lang);
  const label = labelOf(bar, period, t);
  // --print-row: the row once the course units are left out, on paper.
  const printed = bar.printRow === undefined ? '' : `;--print-row:${bar.printRow}`;
  const style = `left:${pct(bar.start - timeline.from, timeline.months)};width:${pct(bar.end + 1 - bar.start, timeline.months)};--row:${bar.row}${printed}`;
  const data = `data-name="${escapeHtml(bar.name)}" data-title="${escapeHtml(bar.title)}" data-period="${escapeHtml(period)}"`;
  // data-depth 1: a project or a role, drawn under the entry that carried it.
  // data-schedule: a degree followed on an evening schedule; the sheet sets a
  // crescent moon before its name.
  const evening = bar.schedule === 'evening' ? ' data-schedule="evening"' : '';
  const nesting = `data-kind="${bar.kind}" data-depth="${bar.depth}"${evening}`;
  const common = `class="tl-bar" style="${style}" aria-label="${escapeHtml(label)}" ${nesting} ${data}`;
  const text = `<span>${escapeHtml(bar.caption)}</span>`;
  return onPage.has(bar.anchor)
    ? `<a ${common} href="#${bar.anchor}">${text}</a>`
    : `<span ${common} tabindex="0">${text}</span>`;
}

function generateTimeline(resume, lang, today, onPage) {
  const t = I18N[lang];
  const timeline = withPrintRows(resume, today);
  const zoom = zoomsOf(t).map(
    ({ years, label }) =>
      `<button type="button" data-years="${years}">${escapeHtml(label)}</button>`,
  );
  const years = timeline.years.map(
    (y) => `<span style="left:${pct(y.month - timeline.from, timeline.months)}">${y.year}</span>`,
  );
  const lanes = timeline.lanes.map((lane) =>
    [
      `<div class="tl-lane" data-kind="${lane.kind}">`,
      `  <span class="tl-lane-label">${escapeHtml(t[LANE_LABEL[lane.kind]])}</span>`,
      `  <div class="tl-track" style="--rows:${lane.rows};--print-rows:${lane.printRows}">`,
      // Behind the bars: the outline of each entry that carried something.
      ...lane.groups.map(
        (g) =>
          `    <span class="tl-group" aria-hidden="true" style="left:${pct(g.start - timeline.from, timeline.months)};width:${pct(g.end + 1 - g.start, timeline.months)};--row:${g.row};--group-rows:${g.rows};--print-row:${g.printRow};--print-group-rows:${g.printRows}"></span>`,
      ),
      ...lane.bars.map((bar) => `    ${renderBar(bar, timeline, lang, onPage, t)}`),
      '  </div>',
      '</div>',
    ].join('\n'),
  );
  return [
    `<section id="timeline" aria-labelledby="timeline-title">`,
    '  <div class="tl-head">',
    `    <h2 id="timeline-title">${escapeHtml(t.timelineTitle)}</h2>`,
    `    <div class="tl-zoom" role="group" aria-label="${escapeHtml(t.timelineTitle)}" hidden>${zoom.join('')}</div>`,
    '  </div>',
    '  <div class="tl-scroll">',
    `    <div class="tl-grid" data-months="${timeline.months}">`,
    `      <div class="tl-years" aria-hidden="true">${years.join('')}</div>`,
    ...lanes.map((l) => l.replace(/^/gm, '      ')),
    '    </div>',
    '  </div>',
    ...legendHtml(legendOf(timeline, t)),
    '</section>',
  ].join('\n');
}

module.exports = { generateTimeline };

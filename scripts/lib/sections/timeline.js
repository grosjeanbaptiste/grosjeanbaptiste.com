// The classic page's timeline section: lanes of bars placed in percent of the
// career, each bar a link to its entry further down the page when the entry is
// there. js/timeline.js adds the zoom (hidden until it runs), the arrow keys
// and the hover preview; css/timeline.css lays it out.
const I18N = require('../i18n');
const { escapeHtml, formatDate } = require('../format');
const { timelineOf } = require('../timeline-model');

const pct = (part, whole) => `${Number(((part / whole) * 100).toFixed(2))}%`;
const LANE_LABEL = {
  work: 'experience',
  education: 'education',
  projects: 'projects',
  volunteer: 'volunteer',
};
const ZOOMS = [2, 5, null];

function renderBar(bar, timeline, lang, onPage) {
  const { record } = bar;
  const period = `${formatDate(record.startDate, lang)} – ${formatDate(record.endDate, lang)}`;
  const label = [bar.name, bar.title, period].filter(Boolean).join(' — ');
  const style = `left:${pct(bar.start - timeline.from, timeline.months)};width:${pct(bar.end + 1 - bar.start, timeline.months)};--row:${bar.row}`;
  const data = `data-name="${escapeHtml(bar.name)}" data-title="${escapeHtml(bar.title)}" data-period="${escapeHtml(period)}"`;
  const common = `class="tl-bar" style="${style}" aria-label="${escapeHtml(label)}" ${data}`;
  const text = `<span>${escapeHtml(bar.name || bar.title)}</span>`;
  return onPage.has(bar.anchor)
    ? `<a ${common} href="#${bar.anchor}">${text}</a>`
    : `<span ${common} tabindex="0">${text}</span>`;
}

function generateTimeline(resume, lang, today, onPage) {
  const t = I18N[lang];
  const timeline = timelineOf(resume, today);
  const zoom = ZOOMS.map(
    (y) =>
      `<button type="button" data-years="${y ?? 'all'}">${escapeHtml(y === null ? t.wholeCareer : t.lastYears(y))}</button>`,
  );
  const years = timeline.years.map(
    (y) => `<span style="left:${pct(y.month - timeline.from, timeline.months)}">${y.year}</span>`,
  );
  const lanes = timeline.lanes.map((lane) =>
    [
      `<div class="tl-lane" data-kind="${lane.kind}">`,
      `  <span class="tl-lane-label">${escapeHtml(t[LANE_LABEL[lane.kind]])}</span>`,
      `  <div class="tl-track" style="--rows:${lane.rows}">`,
      ...lane.bars.map((bar) => `    ${renderBar(bar, timeline, lang, onPage)}`),
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
    '</section>',
  ].join('\n');
}

module.exports = { generateTimeline };

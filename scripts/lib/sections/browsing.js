// What the classic page offers to browse the CV by: its timeline, with the
// skill filter under it, and its search. The three read the same entries
// (cv-index.js): the filter counts those the page shows — in a section or as
// a bar — and the search lists those a reader can be led to, the ones on the
// page.
const I18N = require('../i18n');
const { entriesOf } = require('../cv-index');
const { withPrintRows } = require('../timeline-print');
const { standsFor } = require('../timeline-details');
const { generateTimeline } = require('./timeline');
const { renderSkillFilter } = require('./skill-filter');
const { renderSearch, searchOpener } = require('./search');

function generateBrowsing(resume, lang, today, onPage) {
  const t = I18N[lang];
  const drawn = new Set(
    withPrintRows(resume, today).lanes.flatMap((lane) => lane.bars.map(standsFor)),
  );
  const entries = entriesOf(resume);
  const shown = entries.filter((e) => onPage.has(e.id) || drawn.has(e.id));
  const there = entries.filter((e) => onPage.has(e.id));
  return {
    timeline: generateTimeline(resume, lang, today, onPage, {
      head: [searchOpener(t)],
      under: renderSkillFilter(shown, t),
    }),
    search: renderSearch(there, shown, t),
  };
}

module.exports = { generateBrowsing };

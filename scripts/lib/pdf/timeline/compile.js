// Compiles one language's landscape timeline PDF. It must come out on a single
// page; layOut already refuses a picture taller than the sheet, and this is the
// check on what TeX actually produced.
const I18N = require('../i18n');
const { compileOnce } = require('../compile');
const { buildXmpData } = require('../metadata');
const { buildTimelineDocument } = require('./document');

// Ports: the document, TeX and where a warning goes — replaced in tests.
const PORTS = { document: buildTimelineDocument, compile: compileOnce, warn: console.warn };

function compileTimeline(resume, lang, outPath, today = new Date(), years = null, ports = {}) {
  const { document, compile, warn } = { ...PORTS, ...ports };
  const t = I18N[lang];
  // Titled "<name> — <timeline>" in a reader's tab, not "— Curriculum vitæ";
  // the 2- and 5-year PDFs add their span.
  const title = years === null ? t.timeline : `${t.timeline} (${t.timelineSpan(years)})`;
  const xmp = buildXmpData(resume, { ...t, curriculumVitae: title }, lang);
  const { tex, labels, units } = document(resume, lang, today, years);
  // Degraded, not failed: the page is whole, its labels are shorter. Said aloud.
  if (labels === 'names') {
    warn(`  ${lang}: ${title} — too crowded for "name · role": drawn with names only.`);
  }
  if (units === 'dropped') {
    warn(`  ${lang}: ${title} — a year is too narrow to read: drawn without the course units.`);
  }
  const { ok, pages } = compile(tex, xmp, outPath, lang);
  if (!ok) return { ok: false };
  if (pages !== 1) {
    console.error(
      `  ${lang}: the timeline PDF came out on ${pages} pages; it must fit one landscape page.`,
    );
    return { ok: false };
  }
  return { ok: true, pages };
}

module.exports = { compileTimeline };

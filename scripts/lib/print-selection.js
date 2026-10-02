// Which entries the printable view shows, decided by the same code the LaTeX
// CV uses so the two cannot drift.
//
// The PDF keeps the most recent `work` entries of its fit plan and, when the
// plan sets education_in_body: false, drops the Education section from the body
// entirely — the sidebar's two-line degrees summary carries the qualifications
// instead. The site generator marks everything the PDF leaves out, rather than
// the stylesheet guessing by position: the page renders work in resume.json
// order while the PDF sorts by recency, and those agree only by chance.

const PDF_I18N = require('./pdf/i18n');
const { FIT_PLANS, PRINT_PLAN_INDEX } = require('./pdf/config');
const { topN } = require('./pdf/data');
const { truncate } = require('./pdf/tex');

const PRINT_PLAN = FIT_PLANS[PRINT_PLAN_INDEX];

/**
 * The work entries the LaTeX CV prints, as the very objects from resume.work so
 * callers can test membership by identity.
 */
function printedWork(resume) {
  return new Set(topN(resume.work, PRINT_PLAN.work));
}

/**
 * The heading the PDF gives a section, when it differs from the page's own.
 * scripts/lib/pdf/i18n.js overrides a few deliberately — "Experience" against
 * the site's "Work Experience" — and the printed sheet has to follow the PDF,
 * not the page. Returns null when the two already agree, so the generator only
 * carries an attribute where there is really something to swap.
 */
function printHeading(key, t, lang) {
  const pdf = PDF_I18N[lang]?.[key];
  return pdf && pdf !== t[key] ? pdf : null;
}

/**
 * The text the PDF would print for `value` under `budget` characters, or null
 * when the PDF prints it unchanged. Uses the LaTeX build's own truncate so the
 * two cannot word-break differently.
 */
function printText(value, budget) {
  if (!value) return null;
  const cut = truncate(value, budget);
  return cut === String(value).replace(/\s+/g, ' ').trim() ? null : cut;
}

module.exports = { PRINT_PLAN, printedWork, printText, printHeading };

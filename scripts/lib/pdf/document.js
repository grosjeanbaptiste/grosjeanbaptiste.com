const I18N = require('./i18n');
const { BABEL } = require('./config');
const { buildPreamble } = require('./preamble');
const { buildHeader } = require('./sections/header');
const {
  buildSkillsBlock,
  buildLanguagesBlock,
  buildDayBlock,
  buildDegreesSummary,
} = require('./sections/sidebar');
const { buildAbout } = require('./sections/about');
const { buildWork } = require('./sections/work');
const { buildEducation } = require('./sections/education');
const { buildReferences } = require('./sections/extras');
const { buildTimeline } = require('./sections/timeline');

// The verso, a landscape page: the timeline at the top, the references under it in
// columns. Volunteering used to fill a sidebar here; a role now shows inside
// the entry that hosts it — in the timeline, and beside the projects of an
// entry the recto prints (sections/_trailer.js).
function buildVerso(resume, t, today) {
  const parts = [buildTimeline(resume, t, today), buildReferences(resume, t)].filter(Boolean);
  if (!parts.length) return '';
  // The headings sit closer here than on the recto (\\cvsectiontight), in a
  // group so that nothing after it inherits the change.
  return [
    '\\clearpage',
    // A landscape page: the timeline needs the width.
    '\\begin{landscape}',
    '\\begingroup\\let\\cvsection\\cvsectiontight',
    ...parts,
    '\\endgroup',
    '\\end{landscape}',
  ].join('\n');
}

function generateLatex(resume, lang, limits, today = new Date()) {
  const t = I18N[lang];
  const verso = buildVerso(resume, t, today);
  return [
    buildPreamble(lang),
    '\\begin{document}',
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t, lang),
    '\\columnratio{0.30}',
    '\\begin{paracol}{2}',
    buildDegreesSummary(resume, t, lang),
    buildLanguagesBlock(resume, t),
    buildSkillsBlock(resume, t),
    buildDayBlock(resume, t),
    '\\switchcolumn',
    buildAbout(resume, t),
    buildWork(resume, t, lang, limits),
    limits.education_in_body ? buildEducation(resume, t, lang, limits) : '',
    '\\end{paracol}',
    verso,
    '\\end{document}',
    '',
  ].join('\n');
}

module.exports = { generateLatex };

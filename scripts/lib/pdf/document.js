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

function generateLatex(resume, lang, limits) {
  const t = I18N[lang];
  const verso = resume.references?.length
    ? `\\clearpage\n\\begin{paracol}{2}\n\\switchcolumn\n${buildReferences(resume, t)}\n\\end{paracol}`
    : '';
  return [
    buildPreamble(lang),
    '\\begin{document}',
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t),
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

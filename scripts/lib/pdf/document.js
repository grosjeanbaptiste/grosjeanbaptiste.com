const I18N = require('./i18n');
const { BABEL } = require('./config');
const { buildPreamble } = require('./preamble');
const { buildHeader } = require('./sections/header');
const { buildSkillsBlock, buildLanguagesBlock, buildDayBlock } = require('./sections/sidebar');
const { buildAbout } = require('./sections/about');
const { buildWork } = require('./sections/work');
const { buildEducation } = require('./sections/education');
const { buildReferences } = require('./sections/extras');

function generateLatex(resume, lang, limits) {
  const t = I18N[lang];
  const verso = resume.references?.length ? `\\clearpage\n${buildReferences(resume, t)}` : '';
  return [
    buildPreamble(lang),
    '\\begin{document}',
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t),
    '\\columnratio{0.30}',
    '\\begin{paracol}{2}',
    buildEducation(resume, t, lang, limits),
    buildSkillsBlock(resume, t),
    buildLanguagesBlock(resume, t),
    buildDayBlock(resume, t),
    '\\newpage',
    '\\switchcolumn',
    buildAbout(resume, t, limits),
    buildWork(resume, t, lang, limits),
    '\\end{paracol}',
    verso,
    '\\end{document}',
    '',
  ].join('\n');
}

module.exports = { generateLatex };

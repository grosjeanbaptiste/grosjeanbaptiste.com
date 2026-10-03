// The landscape timeline PDF: the vertical CV's preamble (class, fonts,
// palette, PDF/A), turned to landscape, a one-line header, then the picture.
const I18N = require('../i18n');
const { BABEL } = require('../config');
const { buildPreamble } = require('../preamble');
const { tex } = require('../tex');
const { formatLongDate } = require('../today');
const { timelineBars } = require('./bars');
const { layOut } = require('./page');
const { buildPicture } = require('./picture');

function buildHeader(resume, t, lang, today) {
  const b = resume.basics || {};
  return [
    `\\noindent{\\color{name}\\namefont ${tex(b.name)}}\\hfill{\\color{heading}\\LARGE\\rmfamily\\bfseries\\MakeUppercase{${tex(t.timeline)}}}\\par`,
    `\\noindent{\\color{tagline}\\large\\bfseries ${tex(b.label)}}\\hfill{\\color{body}\\small ${tex(t.updated)} ${tex(formatLongDate(today, lang))}}\\par`,
    '\\vspace{1mm}{\\color{headingrule}\\rule{\\linewidth}{1.5pt}}\\par\\vspace{4mm}',
  ].join('\n');
}

function generateTimelineLatex(resume, lang, today) {
  const t = I18N[lang];
  const sheet = layOut(timelineBars(resume, today));
  return [
    buildPreamble(lang),
    '\\geometry{landscape,left=10mm,right=10mm,top=10mm,bottom=8mm}',
    '\\pagestyle{empty}',
    '\\begin{document}',
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t, lang, today),
    buildPicture(sheet, t),
    '\\end{document}',
    '',
  ].join('\n');
}

module.exports = { generateTimelineLatex };

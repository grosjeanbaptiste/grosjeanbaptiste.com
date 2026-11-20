// The landscape timeline PDF: the vertical CV's preamble (class, fonts,
// palette, PDF/A), turned to landscape, a one-line header, then the picture.
const I18N = require('../i18n');
const { BABEL } = require('../config');
const { buildPreamble } = require('../preamble');
const { tex } = require('../tex');
const { formatLongDate } = require('../today');
const { timelineBars } = require('./bars');
const { layOut, TimelineOverflow } = require('./page');
const { contactItems } = require('../sections/header');
const { highestObtainedDegree, formatDegreeLine } = require('../../degrees');
const { gatherNewest } = require('./gather');
const { buildPicture } = require('./picture');

// The busy years of the career get the width the quiet ones can spare.
const DENSITY = 0.6;

// Photo, then the name, the contacts and the highest degree, with the title
// and the date flush right. ~22 mm: HEIGHT in ./page.js is what is left under it.
function buildHeader(resume, t, lang, today, years) {
  const b = resume.basics || {};
  // The 2- and 5-year PDFs say so beside the date; the whole career needs no note.
  const span = years === null ? '' : `${tex(t.timelineSpan(years))} · `;
  const { main, profiles } = contactItems(b);
  const degree = formatDegreeLine(highestObtainedDegree(resume.education), lang);
  const contacts = [...main, ...profiles].join('\\quad ');
  return [
    // The photo as the portrait CV sets it: round, in the theme's rule colour.
    '\\noindent\\makeatletter\\@makeaphoto{17mm}{profil}\\makeatother\\hspace{4mm}%',
    '\\begin{minipage}[c]{\\dimexpr\\linewidth-21mm\\relax}',
    `{\\color{name}\\namefont ${tex(b.name)}}\\hfill{\\color{heading}\\LARGE\\rmfamily\\bfseries\\MakeUppercase{${tex(t.timeline)}}}\\par`,
    `{\\color{tagline}\\large\\bfseries ${tex(b.label)}}${degree ? `\\quad{\\color{body}\\footnotesize\\faGraduationCap\\ ${tex(degree)}}` : ''}\\hfill{\\color{body}\\small ${span}${tex(t.updated)} ${tex(formatLongDate(today, lang))}}\\par`,
    `{\\footnotesize ${contacts}}\\par`,
    '\\end{minipage}\\par',
    '\\vspace{1mm}{\\color{headingrule}\\rule{\\linewidth}{1.5pt}}\\par\\vspace{3mm}',
  ].join('\n');
}

// The sheet of the timeline, gathering the newest projects still running two
// by two (./gather.js) while the page cannot hold them; loud once nothing is
// left to gather.
function fitted(timeline) {
  for (let bars = timeline; ; ) {
    try {
      return layOut(bars, { density: DENSITY });
    } catch (err) {
      const fewer = err instanceof TimelineOverflow ? gatherNewest(bars) : null;
      if (!fewer) throw err;
      bars = fewer;
    }
  }
}

// `years`: null for the whole career, or the span of the 2- and 5-year PDFs.
// Gives the source, which labels the sheet could carry ('full' or 'names') and
// whether it had room for the course units ('drawn', 'dropped' or 'none').
function buildTimelineDocument(resume, lang, today, years = null) {
  const t = I18N[lang];
  const sheet = fitted(timelineBars(resume, today, years));
  const tex = [
    buildPreamble(lang),
    '\\geometry{landscape,left=10mm,right=10mm,top=10mm,bottom=8mm}',
    '\\pagestyle{empty}',
    '\\begin{document}',
    `\\selectlanguage{${BABEL[lang]}}`,
    buildHeader(resume, t, lang, today, years),
    buildPicture(sheet, t),
    '\\end{document}',
    '',
  ].join('\n');
  return { tex, labels: sheet.labels, units: sheet.units };
}

const generateTimelineLatex = (resume, lang, today, years = null) =>
  buildTimelineDocument(resume, lang, today, years).tex;

module.exports = { buildTimelineDocument, generateTimelineLatex };

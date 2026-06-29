// Education block — rendered in the narrow left sidebar (~25% column),
// so we drop the altacv \cvevent layout (too wide) and use a compact
// vertical stack instead. Embedded skill tags and project lists from
// resume.json are intentionally omitted here; they live in resume.json
// for the HTML site / data consumers but would overflow the sidebar.
const { tex, nohyphen, formatDate } = require('../tex');
const { topN } = require('../data');

function renderEducationEntry(e, lang, t) {
  const start = formatDate(e.startDate, lang);
  const end = formatDate(e.endDate, lang);
  const title = e.area ? `${tex(e.studyType)} ${tex(t.degreeIn)} ${tex(e.area)}` : tex(e.studyType);
  const parts = [
    `\\noindent\\raggedright{\\textcolor{emphasis}{\\bfseries ${title}}}\\par`,
    `\\noindent\\raggedright{\\footnotesize\\textit{${tex(e.institution)}}}\\par`,
    `\\noindent\\raggedright{\\footnotesize\\textcolor{accent}{${tex(start)} -- ${tex(end)}}}\\par`,
  ];
  // gpa stays (short, useful); summary/skills/projects are intentionally
  // omitted — too verbose for the narrow column and they'd push the fit
  // loop past 2 pages. They remain in resume.json for the HTML site /
  // data consumers / verso if anyone wants to re-render them elsewhere.
  if (e.gpa) {
    parts.push(`\\noindent\\raggedright{\\footnotesize ${tex(t.gpa)}: ${tex(e.gpa)}}\\par`);
  }
  return parts;
}

function buildEducation(resume, t, lang, limits) {
  const selected = topN(resume.education, limits.education);
  if (!selected.length) return '';
  const parts = [`\\cvsectionsidebar{${nohyphen(t.education)}}`];
  selected.forEach((e, i, arr) => {
    parts.push(...renderEducationEntry(e, lang, t));
    if (i < arr.length - 1) parts.push('\\smallskip\\divider\\par');
  });
  return parts.join('\n');
}

module.exports = { buildEducation };

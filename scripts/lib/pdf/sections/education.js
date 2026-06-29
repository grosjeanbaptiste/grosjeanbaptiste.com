// Education block — rendered in the left sidebar (~30% column). The altacv
// \cvevent layout is too wide for this column, so each entry is a compact
// vertical stack: bold title, italic institution, accent-coloured date
// range, optional gpa, optional summary. Skill tags and embedded projects
// from resume.json are intentionally skipped — they would overflow the
// narrow column. They remain available in resume.json for the HTML site /
// data consumers.
const { tex, nohyphen, formatDate, truncate } = require('../tex');
const { topN } = require('../data');

function renderSummary(text, max) {
  if (!text) return null;
  const clean = truncate(text, max);
  if (!clean) return null;
  return `\\noindent\\raggedright{\\footnotesize ${tex(clean)}}\\par`;
}

function renderEducationEntry(e, lang, t, limits) {
  const start = formatDate(e.startDate, lang);
  const end = formatDate(e.endDate, lang);
  const title = e.area ? `${tex(e.studyType)} ${tex(t.degreeIn)} ${tex(e.area)}` : tex(e.studyType);
  const parts = [
    `\\noindent\\raggedright{\\textcolor{emphasis}{\\bfseries ${title}}}\\par`,
    `\\noindent\\raggedright{\\footnotesize\\textit{${tex(e.institution)}}}\\par`,
    `\\noindent\\raggedright{\\footnotesize\\textcolor{accent}{${tex(start)} -- ${tex(end)}}}\\par`,
  ];
  if (e.gpa) {
    parts.push(`\\noindent\\raggedright{\\footnotesize ${tex(t.gpa)}: ${tex(e.gpa)}}\\par`);
  }
  const summary = renderSummary(e.summary, limits.summary);
  if (summary) parts.push(summary);
  return parts;
}

function buildEducation(resume, t, lang, limits) {
  const selected = topN(resume.education, limits.education);
  if (!selected.length) return '';
  const parts = [`\\cvsectionsidebar{${nohyphen(t.education)}}`];
  selected.forEach((e, i, arr) => {
    parts.push(...renderEducationEntry(e, lang, t, limits));
    if (i < arr.length - 1) parts.push('\\smallskip\\divider\\par');
  });
  return parts.join('\n');
}

module.exports = { buildEducation };

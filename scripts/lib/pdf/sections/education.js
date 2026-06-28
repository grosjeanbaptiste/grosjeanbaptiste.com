const { tex, truncate, formatDate } = require('../tex');
const { topN } = require('../data');
const { appendItemTrailer } = require('./_trailer');

function renderEducationEntry(e, lang, resume, t, limits) {
  const start = formatDate(e.startDate, lang);
  const end = formatDate(e.endDate, lang);
  const title = e.area ? `${tex(e.studyType)} ${tex(t.degreeIn)} ${tex(e.area)}` : tex(e.studyType);
  const parts = [
    '\\par\\needspace{5\\baselineskip}',
    `\\cvevent{${title}}{| ${tex(e.institution)}}{${tex(start)} -- ${tex(end)}}{}`,
  ];
  const bullets = [];
  if (e.gpa) bullets.push(`${tex(t.gpa)}: ${tex(e.gpa)}`);
  if (e.summary) bullets.push(tex(truncate(e.summary, limits.summary)));
  if (bullets.length) {
    parts.push('\\begin{itemize}');
    for (const b of bullets) parts.push(`    \\item ${b}`);
    parts.push('\\end{itemize}');
  }
  appendItemTrailer(parts, e, resume, t, limits);
  return parts;
}

function buildEducation(resume, t, lang, limits) {
  const selected = topN(resume.education, limits.education);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.education)}}`];
  selected.forEach((e, i, arr) => {
    parts.push(...renderEducationEntry(e, lang, resume, t, limits));
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

module.exports = { buildEducation };

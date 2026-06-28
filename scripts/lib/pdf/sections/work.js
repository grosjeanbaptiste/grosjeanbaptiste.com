const { tex, truncate, formatDate } = require('../tex');
const { topN } = require('../data');
const { appendItemTrailer } = require('./_trailer');

function renderWorkEntry(w, lang, resume, t, limits) {
  const start = formatDate(w.startDate, lang);
  const end = formatDate(w.endDate, lang);
  // Reserve vertical space so the header is never orphaned at a column edge.
  const parts = [
    '\\par\\needspace{5\\baselineskip}',
    `\\cvevent{${tex(w.position)}}{| ${tex(w.company)}}{${tex(start)} -- ${tex(end)}}{${tex(w.location || '')}}`,
  ];
  if (w.summary) {
    parts.push(`\\begin{itemize}\\item ${tex(truncate(w.summary, limits.summary))}\\end{itemize}`);
  }
  appendItemTrailer(parts, w, resume, t, limits);
  return parts;
}

function buildWork(resume, t, lang, limits) {
  const selected = topN(resume.work, limits.work);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.experience)}}`];
  selected.forEach((w, i, arr) => {
    parts.push(...renderWorkEntry(w, lang, resume, t, limits));
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

module.exports = { buildWork };

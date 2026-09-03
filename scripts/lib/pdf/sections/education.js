// Education block — rendered in the wide main column (right of the paracol
// split), right below Work. Each entry uses the altacv \cvevent layout:
// title (studyType in area) / institution / date range / gpa. Optional
// summary paragraph follows underneath. Skill tags and embedded projects
// from resume.json are intentionally skipped to stay inside the 2-page
// budget; they remain available in resume.json for the HTML site.
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
  // Fixed-width \parbox columns so long titles wrap on their own side instead
  // of eating \hfill and colliding with the institution. Top-aligned so both
  // columns share a baseline.
  const parts = [
    '\\par\\needspace{4\\baselineskip}',
    `\\noindent\\parbox[t]{0.62\\linewidth}{\\raggedright\\large\\color{emphasis}${title}}\\hfill\\parbox[t]{0.35\\linewidth}{\\raggedleft\\large\\color{accent}${tex(e.institution)}}\\par`,
    `\\smallskip\\noindent{\\small\\color{accent}\\faCalendar\\color{emphasis}~${tex(start)} -- ${tex(end)}}\\hfill${
      e.gpa ? `{\\small\\color{accent}\\faStar\\color{emphasis}~${tex(e.gpa)}}` : ''
    }\\par\\medskip`,
  ];
  const summary = renderSummary(e.summary, limits.summary);
  if (summary) parts.push(summary);
  return parts;
}

function buildEducation(resume, t, lang, limits) {
  const selected = topN(resume.education, limits.education);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${nohyphen(t.education)}}`];
  selected.forEach((e, i, arr) => {
    parts.push(...renderEducationEntry(e, lang, t, limits));
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

module.exports = { buildEducation };

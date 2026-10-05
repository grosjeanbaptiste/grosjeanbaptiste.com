// Education block — on the verso under the timeline (or in the main column
// below Work, for a fit plan with education_in_body). Each entry: title
// (studyType in area) / institution / date range / gpa, an optional summary,
// then what the degree carried: its projects and, in a column to their right,
// the volunteering done at the school (./_trailer.js). Skill tags and course
// units are left to the site.
const { tex, nohyphen, formatDate, truncate } = require('../tex');
const { topN, findProject } = require('../data');
const { appendItemTrailer } = require('./_trailer');

function renderSummary(text, max) {
  if (!text) return null;
  const clean = truncate(text, max);
  if (!clean) return null;
  return `\\noindent\\raggedright{\\footnotesize ${tex(clean)}}\\par`;
}

// The projects a degree carried. Its course units are named in the same list
// of the CV's data — told apart as the site tells them — and the PDF leaves
// them to the site.
const isUnit = (project) => project?.type === 'Course unit';
const carriedProjects = (e, resume) =>
  (e.projects || []).filter((name) => !isUnit(findProject(resume, name)));

function renderEducationEntry(e, lang, t, limits, resume) {
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
  appendItemTrailer(
    parts,
    e,
    resume,
    t,
    { ...limits, show_skills: false },
    {
      lang,
      projects: carriedProjects(e, resume),
    },
  );
  return parts;
}

function buildEducation(resume, t, lang, limits) {
  const selected = topN(resume.education, limits.education);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${nohyphen(t.education)}}`];
  selected.forEach((e, i, arr) => {
    parts.push(...renderEducationEntry(e, lang, t, limits, resume));
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

module.exports = { buildEducation };

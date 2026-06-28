// Shared trailer for experience + education entries: optional skill tags
// followed by an optional bulleted list of related projects. Extracted to
// keep buildWork/buildEducation under the cognitive-complexity budget.
const { tex, truncate } = require('../tex');
const { findProject } = require('../data');

function renderSkillTags(skills, limits) {
  if (!limits.show_skills || !skills?.length) return null;
  const tags = skills.map((s) => `\\cvtag{${tex(s)}}`).join(' ');
  return `\\par\\nobreak\\noindent{\\footnotesize ${tags}}\\par\\nobreak\\smallskip`;
}

function renderProjectList(projectNames, resume, t, limits) {
  const projs = (projectNames || []).map((n) => findProject(resume, n)).filter(Boolean);
  if (!projs.length) return null;
  const items = projs.map((p) => {
    const desc = p.summary || p.description || '';
    const descText = desc ? ` — ${tex(truncate(desc, limits.proj_desc))}` : '';
    return `    \\item \\textbf{${tex(p.name)}}${descText}`;
  });
  return [
    `\\par\\nobreak\\noindent{\\footnotesize\\textbf{${tex(t.projects)}:}`,
    '\\begin{itemize}\\itemsep=0pt',
    ...items,
    '\\end{itemize}}',
  ].join('\n');
}

function appendItemTrailer(parts, item, resume, t, limits) {
  const skills = renderSkillTags(item.skills, limits);
  if (skills) parts.push(skills);
  const projects = renderProjectList(item.projects, resume, t, limits);
  if (projects) parts.push(projects);
}

module.exports = { appendItemTrailer };

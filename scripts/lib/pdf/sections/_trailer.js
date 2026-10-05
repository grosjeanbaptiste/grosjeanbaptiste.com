// Shared trailer for experience + education entries: optional skill tags, then
// what the entry carried — a bulleted list of its projects and, in a column to
// their right, the volunteering done there. Extracted to
// keep buildWork/buildEducation under the cognitive-complexity budget.
const { tex, tagText, truncate } = require('../tex');
const { findProject, sortByRecency } = require('../data');
const { rolesHostedBy } = require('../../hosting');
const { roleItem } = require('./volunteer');

function renderSkillTags(skills, limits) {
  if (!limits.show_skills || !skills?.length) return null;
  const tags = skills.map((s) => `\\cvtag{${tagText(s)}}`).join(' ');
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

function renderRoleList(roles, t, lang) {
  if (!roles.length) return null;
  return [
    `\\par\\nobreak\\noindent{\\footnotesize\\textbf{${tex(t.volunteer)}:}`,
    '\\begin{itemize}\\itemsep=0pt',
    ...roles.map((role) => roleItem(role, lang, { organisation: false })),
    '\\end{itemize}}',
  ].join('\n');
}

// Two lists side by side, top-aligned: the projects, and to their right the
// volunteering done at the same place.
const sideBySide = (left, right) =>
  [
    '\\par\\nobreak\\noindent\\begin{minipage}[t]{0.58\\linewidth}',
    left,
    '\\end{minipage}\\hfill\\begin{minipage}[t]{0.39\\linewidth}',
    right,
    '\\end{minipage}\\par',
  ].join('\n');

// `projects`: the names to list, the entry's own by default (a degree leaves
// its course units out).
function appendItemTrailer(
  parts,
  item,
  resume,
  t,
  limits,
  { lang, projects = item.projects } = {},
) {
  const skills = renderSkillTags(item.skills, limits);
  if (skills) parts.push(skills);
  const projectList = renderProjectList(projects, resume, t, limits);
  const roleList = renderRoleList(sortByRecency(rolesHostedBy(resume, item)), t, lang);
  if (projectList && roleList) parts.push(sideBySide(projectList, roleList));
  else if (projectList || roleList) parts.push(projectList || roleList);
}

module.exports = { appendItemTrailer };

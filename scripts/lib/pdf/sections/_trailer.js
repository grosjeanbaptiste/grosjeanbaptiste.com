// Shared trailer for experience + education entries: optional skill tags, then
// what the entry carried — a bulleted list of its projects and, in a column to
// their right, the volunteering done there. Extracted to
// keep buildWork/buildEducation under the cognitive-complexity budget.
const { tex, tagText, truncate } = require('../tex');
const { findProject, sortByRecency } = require('../data');
const { rolesHostedBy } = require('../../hosting');
const { roleItem } = require('./volunteer');
const { PROJECT_COLUMNS_FROM: COLUMNS_FROM } = require('../config');

function renderSkillTags(skills, limits) {
  if (!limits.show_skills || !skills?.length) return null;
  const tags = skills.map((s) => `\\cvtag{${tagText(s)}}`).join(' ');
  return `\\par\\nobreak\\noindent{\\footnotesize ${tags}}\\par\\nobreak\\smallskip`;
}

// From COLUMNS_FROM projects on, the list goes into three columns and each
// project reads with its kind only: its description stays on the site.

const described = (p, limits) => {
  const desc = p.summary || p.description || '';
  const descText = desc ? ` — ${tex(truncate(desc, limits.proj_desc))}` : '';
  return `    \\item \\textbf{${tex(p.name)}}${descText}`;
};
// The dot as a command: under xeCJK (zh) the character went to the CJK font.
const kinded = (p) =>
  `    \\item \\textbf{${tex(p.name)}}${p.type ? ` \\textperiodcentered{} ${tex(p.type)}` : ''}`;

const itemize = (items) => ['\\begin{itemize}\\itemsep=0pt', ...items, '\\end{itemize}'];
// Three top-aligned minipages, filled column by column (the recto is set with
// paracol, where multicols has no place).
function thirds(items) {
  const per = Math.ceil(items.length / 3);
  const columns = [0, 1, 2].map((i) => items.slice(i * per, (i + 1) * per));
  return [
    '\\par\\nobreak\\noindent',
    ...columns.flatMap((column, i) => [
      ...(i ? ['\\hfill'] : []),
      '\\begin{minipage}[t]{0.32\\linewidth}',
      ...(column.length ? itemize(column) : []),
      '\\end{minipage}',
    ]),
    '\\par',
  ];
}

// `columns`: false where the list shares the line with another (a minipage,
// where multicols cannot go).
function renderProjectList(projectNames, resume, t, limits, { columns = true } = {}) {
  const projs = (projectNames || []).map((n) => findProject(resume, n)).filter(Boolean);
  if (!projs.length) return null;
  const inColumns = columns && projs.length >= COLUMNS_FROM;
  return [
    `\\par\\nobreak\\noindent{\\footnotesize\\textbf{${tex(t.projects)}:}`,
    ...(inColumns ? thirds(projs.map(kinded)) : itemize(projs.map((p) => described(p, limits)))),
    '}',
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

// `projects`: the names to list, the entry's own by default. A degree's course
// units are not among them: they are left to the site.
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
  const roleList = renderRoleList(sortByRecency(rolesHostedBy(resume, item)), t, lang);
  const projectList = renderProjectList(projects, resume, t, limits, { columns: !roleList });
  if (projectList && roleList) parts.push(sideBySide(projectList, roleList));
  else if (projectList || roleList) parts.push(projectList || roleList);
}

module.exports = { appendItemTrailer };

const { tex, truncate, formatDate } = require('../tex');
const { topN } = require('../data');

function buildVolunteer(resume, t, lang, limits) {
  const selected = topN(resume.volunteer, limits.volunteer);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.volunteer)}}`];
  selected.forEach((v, i, arr) => {
    const start = formatDate(v.startDate, lang);
    const end = formatDate(v.endDate, lang);
    parts.push(
      `\\cvevent{${tex(v.position)}}{| ${tex(v.organization)}}{${tex(start)} -- ${tex(end)}}{}`,
    );
    if (v.summary) parts.push(`\\begin{itemize}\n    \\item ${tex(v.summary)}\n\\end{itemize}`);
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

function buildProjects(resume, t, lang, limits) {
  const selected = topN(resume.projects, limits.projects);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.projects)}}`];
  selected.forEach((p, i, arr) => {
    const start = formatDate(p.startDate, lang);
    const end = formatDate(p.endDate, lang);
    parts.push(`\\cvevent{${tex(p.name)}}{}{${tex(start)} -- ${tex(end)}}{${tex(p.type || '')}}`);
    const bullets = [];
    const desc = p.summary || p.description;
    if (desc) bullets.push(tex(truncate(desc, limits.summary)));
    if (limits.kw_per_proj > 0 && p.keywords?.length) {
      bullets.push(
        `${tex(t.keywords)}: ${tex(p.keywords.slice(0, limits.kw_per_proj).join(', '))}`,
      );
    }
    if (bullets.length) {
      parts.push('\\begin{itemize}');
      for (const b of bullets) parts.push(`    \\item ${b}`);
      parts.push('\\end{itemize}');
    }
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

function buildAwards(resume, t, lang, limits) {
  const selected = topN(resume.awards, limits.awards);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.awards)}}`];
  selected.forEach((a, i, arr) => {
    const date = formatDate(a.date, lang);
    const detail = [a.awarder, a.summary].filter(Boolean).map(tex).join(' — ');
    parts.push(`\\cvevent{${tex(a.title)}}{}{${tex(date)}}{}`);
    if (detail) parts.push(`\\begin{itemize}\n    \\item ${detail}\n\\end{itemize}`);
    if (i < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

function buildInterests(resume, t, limits) {
  const selected = (resume.interests || []).slice(0, limits.interests);
  if (!selected.length) return '';
  const parts = [`\\cvsection{${tex(t.interests)}}`];
  selected.forEach((i, idx, arr) => {
    parts.push(`\\textbf{${tex(i.name)}}`);
    if (i.keywords?.length) parts.push(`: ${tex(i.keywords.join(', '))}`);
    parts.push('\\\\');
    if (idx < arr.length - 1) parts.push('\\divider');
  });
  return parts.join('\n');
}

function buildReferences(resume, t) {
  if (!resume.references?.length) return '';
  const parts = [`\\cvsection{${tex(t.references)}}`];
  resume.references.forEach((r, i, arr) => {
    parts.push(`\\textbf{${tex(r.name)}}\\\\`);
    if (r.reference) {
      const snippet =
        r.reference.length > 220 ? `${r.reference.slice(0, 217).trimEnd()}…` : r.reference;
      parts.push(`\\begin{quote}\\small\\itshape ${tex(snippet)}\\end{quote}`);
    }
    if (i < arr.length - 1) parts.push('\\medskip');
  });
  return parts.join('\n');
}

module.exports = { buildVolunteer, buildProjects, buildAwards, buildInterests, buildReferences };

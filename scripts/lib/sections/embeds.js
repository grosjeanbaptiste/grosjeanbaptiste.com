// Helpers that embed related entities (skills, projects, volunteering,
// reference back-links) inside a work or education article on the HTML site.
// Kept separate from main.js so the section renderers there stay short.
const { escapeHtml } = require('../format');
const { indentLines } = require('../markers');

const renderEmbeddedSkills = (skills) => {
  if (!skills?.length) return '';
  const tags = skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join(' ');
  return `<div class="skill-tags inline-skills">${tags}</div>`;
};

function renderEmbeddedProjects(projectNames, projects, t) {
  if (!projectNames?.length) return '';
  const projs = projectNames.map((n) => projects.find((p) => p.name === n)).filter(Boolean);
  if (!projs.length) return '';
  const items = projs
    .map((p) => {
      const desc = p.summary || p.description || '';
      const link = p.url
        ? ` <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">↗</a>`
        : '';
      return `<li><strong>${escapeHtml(p.name)}</strong>${link}${desc ? ` — ${escapeHtml(desc)}` : ''}</li>`;
    })
    .join('\n        ');
  return [
    '<div class="embedded-projects">',
    `  <p class="embedded-label">${escapeHtml(t.projects)}:</p>`,
    '  <ul>',
    `        ${items}`,
    '  </ul>',
    '</div>',
  ].join('\n');
}

// Match volunteer entries to a work/education host by the first word of the
// volunteer's organization: "UMons" matches UMons, "EPHEC …" matches
// "Ecole … (EPHEC-EPS)". Same heuristic as the XSLT views.
function renderEmbeddedVolunteer(volunteer, hostName, t) {
  if (!hostName || !volunteer?.length) return '';
  const matched = volunteer.filter((v) => {
    if (!v.organization) return false;
    const firstWord = v.organization.split(/\s+/)[0];
    return firstWord && hostName.includes(firstWord);
  });
  if (!matched.length) return '';
  const items = matched
    .map((v) => {
      const dates = `${v.startDate || ''} – ${v.endDate || 'Present'}`;
      return `<li><strong>${escapeHtml(v.position)}</strong> — ${escapeHtml(dates)}</li>`;
    })
    .join('\n        ');
  return [
    '<div class="embedded-projects">',
    `  <p class="embedded-label">${escapeHtml(t.volunteer)}:</p>`,
    '  <ul>',
    `        ${items}`,
    '  </ul>',
    '</div>',
  ].join('\n');
}

// Reference names look like "Name Lastname, role at Company". We surface a
// "See references: Name1, Name2" line under the host whose company name is
// a 4-char substring match — same as the XSLT views. The links anchor to
// the standalone References section id="ref-<index>".
function renderEmbeddedReferenceLinks(references, hostName, t) {
  if (!hostName || !references?.length || hostName.length < 4) return '';
  const stem = hostName.slice(0, 4);
  const matched = references
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => r.name?.includes(stem));
  if (!matched.length) return '';
  const links = matched
    .map(({ r, idx }) => `<a href="#ref-${idx}">${escapeHtml(r.name)}</a>`)
    .join(', ');
  return `<p class="ref-links">${escapeHtml(t.references)}: ${links}</p>`;
}

// Append the shared trailer to a work OR education article, in a fixed order:
// skill tags, embedded projects, matched volunteering, reference back-links.
// `hostName` is the company (work) or institution (education) used to match
// volunteer entries and references.
function appendEmbeds(parts, entry, hostName, ctx, t) {
  const skillsHtml = renderEmbeddedSkills(entry.skills);
  if (skillsHtml) parts.push(`  ${skillsHtml}`);
  const projsHtml = renderEmbeddedProjects(entry.projects, ctx.projects, t);
  if (projsHtml) parts.push(indentLines(projsHtml, 2));
  const volsHtml = renderEmbeddedVolunteer(ctx.volunteer, hostName, t);
  if (volsHtml) parts.push(indentLines(volsHtml, 2));
  const refsHtml = renderEmbeddedReferenceLinks(ctx.references, hostName, t);
  if (refsHtml) parts.push(`  ${refsHtml}`);
}

module.exports = { appendEmbeds };

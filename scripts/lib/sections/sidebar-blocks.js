// Sidebar content blocks (skills, languages, projects). Kept apart from
// sidebar.js so the latter stays focused on the contact header and the
// meta.sidebarOrder orchestration.
const { escapeHtml } = require('../format');

function renderSkillsBlocks(resume, t) {
  // "Currently Learning" stays in resume.json (JSON Resume schema compliance +
  // LLM ingestion) but is intentionally hidden from the visible CV.
  const categories = [
    { name: 'HardSkills', title: t.technicalSkills },
    { name: 'SoftSkills', title: t.softSkills },
  ];
  return categories
    .map(({ name, title }) => {
      const cat = (resume.skills || []).find((s) => s.name === name);
      if (!cat || !cat.keywords?.length) return null;
      const tags = cat.keywords
        .map((k) => `      <span class="skill-tag">${escapeHtml(k)}</span>`)
        .join('\n');
      return [
        '<div class="skills">',
        `  <h2>${escapeHtml(title)}</h2>`,
        '  <div class="skill-category">',
        '    <div class="skill-tags">',
        tags,
        '    </div>',
        '  </div>',
        '</div>',
      ].join('\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

function renderLanguagesBlock(resume, t) {
  const items = (resume.languages || [])
    .map((l) => `  <p>${escapeHtml(l.language)}: ${escapeHtml(l.fluency)}</p>`)
    .join('\n');
  return ['<div class="languages">', `  <h2>${escapeHtml(t.languages)}</h2>`, items, '</div>'].join(
    '\n',
  );
}

// Sidebar projects list — parity with the XSLT `sidebar-projects` template:
// project name (linked when a url is present) plus its short description.
function renderProjectsBlock(resume, t) {
  const items = (resume.projects || [])
    .map((p) => {
      const name = `<strong>${escapeHtml(p.name)}</strong>`;
      const label = p.url
        ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${name}</a>`
        : name;
      const desc = p.summary || p.description || '';
      return `  <p>${label}${desc ? ` — ${escapeHtml(desc)}` : ''}</p>`;
    })
    .join('\n');
  if (!items) return null;
  return ['<div class="projects">', `  <h2>${escapeHtml(t.projects)}</h2>`, items, '</div>'].join(
    '\n',
  );
}

module.exports = { renderSkillsBlocks, renderLanguagesBlock, renderProjectsBlock };

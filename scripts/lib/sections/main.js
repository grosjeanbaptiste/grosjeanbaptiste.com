const I18N = require('../i18n');
const { escapeHtml, dateRangeHtml } = require('../format');
const { profileIcon } = require('../profiles');
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

function renderAbout(resume, t) {
  const paras = (resume.basics?.summary || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `  <p>${escapeHtml(p)}</p>`)
    .join('\n');
  return ['<section id="about">', `  <h2>${escapeHtml(t.about)}</h2>`, paras, '</section>'].join(
    '\n',
  );
}

function renderExperienceItem(w, lang, projects, t) {
  const companyHtml = w.company
    ? w.url
      ? `<a href="${escapeHtml(w.url)}" target="_blank" rel="noopener">${escapeHtml(w.company)}</a>`
      : escapeHtml(w.company)
    : '';
  const parts = [
    '<article class="experience-item">',
    `  <h3>${escapeHtml(w.position)}${w.company ? ` | ${companyHtml}` : ''}</h3>`,
    `  <p class="date">${dateRangeHtml(w.startDate, w.endDate, lang)}</p>`,
  ];
  if (w.location) parts.push(`  <p class="location">${escapeHtml(w.location)}</p>`);
  if (w.summary) parts.push(`  <p>${escapeHtml(w.summary).replace(/\n/g, '<br>')}</p>`);
  for (const h of w.highlights || []) parts.push(`  <p>• ${escapeHtml(h)}</p>`);
  const skillsHtml = renderEmbeddedSkills(w.skills);
  if (skillsHtml) parts.push(`  ${skillsHtml}`);
  const projsHtml = renderEmbeddedProjects(w.projects, projects, t);
  if (projsHtml) parts.push(indentLines(projsHtml, 2));
  parts.push('</article>');
  return parts.join('\n');
}

function renderEducationItem(e, lang, projects, t) {
  const parts = [
    '<article class="education-item">',
    `  <h3>${escapeHtml(e.studyType)}${e.area ? `${lang === 'en' ? ' in ' : ' — '}${escapeHtml(e.area)}` : ''}</h3>`,
    `  <p class="institution">${escapeHtml(e.institution)}</p>`,
    `  <p class="date">${dateRangeHtml(e.startDate, e.endDate, lang)}</p>`,
  ];
  if (e.gpa) parts.push(`  <p>${escapeHtml(e.gpa)}</p>`);
  if (e.summary) parts.push(`  <p>${escapeHtml(e.summary).replace(/\n/g, '<br>')}</p>`);
  const skillsHtml = renderEmbeddedSkills(e.skills);
  if (skillsHtml) parts.push(`  ${skillsHtml}`);
  const projsHtml = renderEmbeddedProjects(e.projects, projects, t);
  if (projsHtml) parts.push(indentLines(projsHtml, 2));
  parts.push('</article>');
  return parts.join('\n');
}

function renderContact(b, t, lang) {
  const phoneDigits = (b.phone || '').replace(/[^+\d]/g, '');
  const lines = [
    `  <p><i class="fas fa-envelope"></i> <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>`,
  ];
  if (phoneDigits) {
    lines.push(
      `  <p><i class="fas fa-phone"></i> <a href="tel:${escapeHtml(phoneDigits)}">${escapeHtml(b.phone)}</a></p>`,
    );
  }
  for (const p of b.profiles || []) {
    lines.push(
      `  <p><i class="${profileIcon(p.network)}"></i> <a href="${escapeHtml(p.url)}" rel="me">${escapeHtml(p.network)}</a></p>`,
    );
  }
  lines.push(
    `  <p><i class="fas fa-code"></i> <a href="/assets/data/resume-${lang}.xml">${escapeHtml(t.xmlResume)}</a> <span class="muted-inline">(${escapeHtml(t.firefoxNote)})</span></p>`,
  );
  return [
    '<section id="contact">',
    `  <h2>${escapeHtml(t.contact)}</h2>`,
    `  <p>${escapeHtml(t.contactCTA)}</p>`,
    lines.join('\n'),
    '</section>',
  ].join('\n');
}

function generateMain(resume, lang) {
  const t = I18N[lang];
  const projects = resume.projects || [];
  const sections = [renderAbout(resume, t)];

  if (resume.work?.length) {
    const items = resume.work
      .map((w) => indentLines(renderExperienceItem(w, lang, projects, t), 2))
      .join('\n');
    sections.push(
      [
        '<section id="experience">',
        `  <h2>${escapeHtml(t.experience)}</h2>`,
        items,
        '</section>',
      ].join('\n'),
    );
  }

  if (resume.education?.length) {
    const items = resume.education
      .map((e) => indentLines(renderEducationItem(e, lang, projects, t), 2))
      .join('\n');
    sections.push(
      [
        '<section id="education">',
        `  <h2>${escapeHtml(t.education)}</h2>`,
        items,
        '</section>',
      ].join('\n'),
    );
  }

  if (resume.references?.length) {
    const items = resume.references
      .map((r) =>
        indentLines(
          [
            '<article class="reference-item">',
            `  <p><strong>${escapeHtml(r.name)}</strong></p>`,
            `  <blockquote>${escapeHtml(r.reference).replace(/\n/g, '<br>')}</blockquote>`,
            '</article>',
          ].join('\n'),
          2,
        ),
      )
      .join('\n');
    sections.push(
      [
        '<section id="references">',
        `  <h2>${escapeHtml(t.references)}</h2>`,
        items,
        '</section>',
      ].join('\n'),
    );
  }

  sections.push(renderContact(resume.basics, t, lang));
  return sections.join('\n\n');
}

module.exports = { generateMain };

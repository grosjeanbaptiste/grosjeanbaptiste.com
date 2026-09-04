const I18N = require('../i18n');
const { escapeHtml, dateRangeHtml } = require('../format');
const { indentLines } = require('../markers');
const { appendEmbeds } = require('./embeds');

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

function renderExperienceItem(w, lang, ctx, t) {
  // Wrap the company in a .company span so it can carry its own colour (accent
  // orange) distinct from the position, which is the h3 primary colour — in
  // dark mode the link accent and the primary are both amber and blur together.
  const companyInner = w.url
    ? `<a href="${escapeHtml(w.url)}" target="_blank" rel="noopener">${escapeHtml(w.company)}</a>`
    : escapeHtml(w.company);
  const companyHtml = w.company ? `<span class="company">${companyInner}</span>` : '';
  // "Position · Client" when the role is a consulting mission (e.g. Xtrada
  // → VhAuctions) so the reader still sees the end-client alongside the
  // employer (Xtrada) in the pipe-separated header.
  const positionLabel = w.client
    ? `${escapeHtml(w.position)} · ${escapeHtml(w.client)}`
    : escapeHtml(w.position);
  const parts = [
    '<article class="experience-item">',
    `  <h3>${positionLabel}${w.company ? ` | ${companyHtml}` : ''}</h3>`,
    `  <p class="date">${dateRangeHtml(w.startDate, w.endDate, lang)}</p>`,
  ];
  if (w.location) parts.push(`  <p class="location">${escapeHtml(w.location)}</p>`);
  if (w.summary) parts.push(`  <p>${escapeHtml(w.summary).replace(/\n/g, '<br>')}</p>`);
  for (const h of w.highlights || []) parts.push(`  <p>• ${escapeHtml(h)}</p>`);
  appendEmbeds(parts, w, w.company, ctx, t);
  parts.push('</article>');
  return parts.join('\n');
}

function renderEducationItem(e, lang, ctx, t) {
  const parts = [
    '<article class="education-item">',
    `  <h3>${escapeHtml(e.studyType)}${e.area ? `${lang === 'en' ? ' in ' : ' — '}${escapeHtml(e.area)}` : ''}</h3>`,
    `  <p class="institution">${escapeHtml(e.institution)}</p>`,
    `  <p class="date">${dateRangeHtml(e.startDate, e.endDate, lang)}</p>`,
  ];
  if (e.gpa) parts.push(`  <p>${escapeHtml(e.gpa)}</p>`);
  if (e.summary) parts.push(`  <p>${escapeHtml(e.summary).replace(/\n/g, '<br>')}</p>`);
  appendEmbeds(parts, e, e.institution, ctx, t);
  parts.push('</article>');
  return parts.join('\n');
}

function renderReferenceArticle(r, idx) {
  return [
    `<article class="reference-item" id="ref-${idx}">`,
    `  <p><strong>${escapeHtml(r.name)}</strong></p>`,
    `  <blockquote>${escapeHtml(r.reference).replace(/\n/g, '<br>')}</blockquote>`,
    '</article>',
  ].join('\n');
}

// The projects/volunteer/references pools an item renderer needs to embed
// related entries. Bundled once per section so the item renderers stay short.
function ctxOf(resume) {
  return {
    projects: resume.projects || [],
    volunteer: resume.volunteer || [],
    references: resume.references || [],
  };
}

// Wrap a list of entries in a <section id>; each item is rendered then indented
// two spaces to match the hand-written HTML nesting. Returns null (skipped
// downstream) when the section is empty.
function renderItemSection(id, heading, entries, renderItem) {
  if (!entries?.length) return null;
  const items = entries.map((e, i) => indentLines(renderItem(e, i), 2)).join('\n');
  return [`<section id="${id}">`, `  <h2>${escapeHtml(heading)}</h2>`, items, '</section>'].join(
    '\n',
  );
}

function renderWorkSection(resume, lang, t) {
  const ctx = ctxOf(resume);
  return renderItemSection('experience', t.experience, resume.work, (w) =>
    renderExperienceItem(w, lang, ctx, t),
  );
}

function renderEducationSection(resume, lang, t) {
  const ctx = ctxOf(resume);
  return renderItemSection('education', t.education, resume.education, (e) =>
    renderEducationItem(e, lang, ctx, t),
  );
}

function renderReferencesSection(resume, t) {
  return renderItemSection('references', t.references, resume.references, (r, idx) =>
    renderReferenceArticle(r, idx),
  );
}

// Maps a section name from meta.sectionOrder to a renderer for the HTML main
// column. Sections not listed here (skills/languages/dailyLife → sidebar,
// awards/interests → not part of the HTML site) are silently skipped when they
// appear in the order.
const MAIN_RENDERERS = {
  about: (resume, _lang, t) => renderAbout(resume, t),
  work: renderWorkSection,
  education: renderEducationSection,
  references: (resume, _lang, t) => renderReferencesSection(resume, t),
};

function generateMain(resume, lang) {
  const t = I18N[lang];
  const order = resume.meta?.sectionOrder ?? ['about', 'work', 'education', 'references'];
  const sections = order.map((name) => MAIN_RENDERERS[name]?.(resume, lang, t)).filter(Boolean);
  return sections.join('\n\n');
}

module.exports = { generateMain };

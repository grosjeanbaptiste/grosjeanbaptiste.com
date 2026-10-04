const I18N = require('../i18n');
const { printedWork, printText, printHeading, PRINT_PLAN } = require('../print-selection');
const { escapeHtml, dateRangeHtml, wrapPictographs } = require('../format');
const { icon } = require('../icons');
const { indentLines } = require('../markers');
const { anchorOf } = require('../anchors');
const { appendEmbeds } = require('./embeds');
const { generateTimeline } = require('./timeline');

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

function renderExperienceItem(w, lang, ctx, t, opts = { printed: true }) {
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
    `<article class="experience-item${opts.printed ? '' : ' print-hidden'}" id="${anchorOf('work', w)}">`,
    // Position and employer each in their own span, with the pipe in a third:
    // the PDF sets the position left and the employer hard right on the same
    // line, so the print sheet has to be able to address the three separately.
    `  <h3><span class="position">${positionLabel}</span>${w.company ? `<span class="h3-sep"> | </span>${companyHtml}` : ''}</h3>`,
    // \cvevent sets \faCalendar before the dates and \faMapMarker before the
    // location, both in accent. .print-icon keeps them off the screen, where
    // the page has never shown them.
    `  <p class="date"><span class="print-icon">${icon('calendar')}</span>${dateRangeHtml(w.startDate, w.endDate, lang)}</p>`,
  ];
  if (w.location)
    parts.push(
      `  <p class="location"><span class="print-icon">${icon('map-marker-alt')}</span>${escapeHtml(w.location)}</p>`,
    );
  if (w.summary) {
    // The PDF clips summaries to its fit plan's budget. Carry that shorter text
    // on the element so js/print-layout.js can swap it in for the print only —
    // the screen keeps the full text, and the DOM carries no duplicate copy.
    const clipped = printText(w.summary, PRINT_PLAN.summary);
    const attr = clipped ? ` data-print-text="${escapeHtml(clipped)}"` : '';
    parts.push(`  <p${attr}>${escapeHtml(w.summary).replace(/\n/g, '<br>')}</p>`);
  }
  // .entry-highlight: sections/work.js never renders `highlights`, so these
  // lines exist on the page only. Classed so the print sheet can drop them
  // instead of printing a technology list the PDF has nowhere.
  for (const h of w.highlights || [])
    parts.push(`  <p class="entry-highlight">• ${escapeHtml(h)}</p>`);
  // Skills hang off the projects now. The entry-level cluster survives only
  // for an experience that references no project at all — otherwise there is
  // nowhere else for its `uses` to show.
  //
  // Education still aggregates: its `uses` carries things no project covers
  // (LaTeX for the MSc, the whole EPHEC stack), and their proper home is the
  // course units, which do not exist yet. Dropping it here would lose them.
  const entry = w.projects?.length ? { ...w, skills: [] } : w;
  appendEmbeds(parts, entry, w.company, ctx, t, lang);
  parts.push('</article>');
  return parts.join('\n');
}

function renderEducationItem(e, lang, ctx, t) {
  const parts = [
    `<article class="education-item" id="${anchorOf('education', e)}">`,
    `  <h3>${escapeHtml(e.studyType)}${e.area ? `${t.degreeConnector}${escapeHtml(e.area)}` : ''}</h3>`,
    `  <p class="institution">${escapeHtml(e.institution)}</p>`,
    `  <p class="date">${dateRangeHtml(e.startDate, e.endDate, lang)}</p>`,
  ];
  if (e.gpa) parts.push(`  <p>${escapeHtml(e.gpa)}</p>`);
  if (e.summary) parts.push(`  <p>${escapeHtml(e.summary).replace(/\n/g, '<br>')}</p>`);
  appendEmbeds(parts, e, e.institution, ctx, t, lang);
  parts.push('</article>');
  return parts.join('\n');
}

function renderReferenceArticle(r, idx) {
  return [
    `<article class="reference-item" id="ref-${idx}">`,
    `  <p><strong>${escapeHtml(r.name)}</strong></p>`,
    `  <blockquote>${wrapPictographs(escapeHtml(r.reference).replace(/\n/g, '<br>'))}</blockquote>`,
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
function renderItemSection(id, heading, entries, renderItem, printHeadingText = null) {
  if (!entries?.length) return null;
  const items = entries.map((e, i) => indentLines(renderItem(e, i), 2)).join('\n');
  // The PDF gives a few sections a shorter title than the site does
  // ("Experience" against "Work Experience"); data-print-text lets the sheet
  // use the PDF's while the page keeps its own.
  const attr = printHeadingText ? ` data-print-text="${escapeHtml(printHeadingText)}"` : '';
  return [
    `<section id="${id}">`,
    `  <h2${attr}>${escapeHtml(heading)}</h2>`,
    items,
    '</section>',
  ].join('\n');
}

function renderWorkSection(resume, lang, t) {
  const ctx = ctxOf(resume);
  // Entries the LaTeX CV's fit plan leaves out are marked rather than removed:
  // the page keeps the full history on screen, css/print-type.css hides the
  // marked ones so the printed sheet carries exactly the PDF's selection.
  const printed = printedWork(resume);
  return renderItemSection(
    'experience',
    t.experience,
    resume.work,
    (w) => renderExperienceItem(w, lang, ctx, t, { printed: printed.has(w) }),
    printHeading('experience', t, lang),
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

// The timeline goes right after About: it is the way into everything below.
// It is rendered last, from the ids the other sections put on the page, so a
// bar links only to an entry that is actually there.
function generateMain(resume, lang, today = new Date()) {
  const t = I18N[lang];
  const order = resume.meta?.sectionOrder ?? ['about', 'work', 'education', 'references'];
  // A project shown under both its job and its degree would carry its id twice:
  // only its first appearance keeps it, and that is where its bar leads.
  const seen = new Set();
  const firstOnly = (html) =>
    html.replace(/\sid="([^"]+)"/g, (attr, id) => {
      if (seen.has(id)) return '';
      seen.add(id);
      return attr;
    });
  const sections = order
    .map((name) => [name, MAIN_RENDERERS[name]?.(resume, lang, t)])
    .filter(([, html]) => html)
    .map(([name, html]) => [name, firstOnly(html)]);
  const onPage = new Set(
    sections.flatMap(([, html]) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])),
  );
  const timeline = generateTimeline(resume, lang, today, onPage);
  const at = sections.findIndex(([name]) => name === 'about') + 1;
  sections.splice(at, 0, ['timeline', timeline]);
  return sections.map(([, html]) => html).join('\n\n');
}

module.exports = { generateMain };

// Helpers that embed related entities (skills, projects, volunteering,
// reference back-links) inside a work or education article on the HTML site.
// Kept separate from main.js so the section renderers there stay short.
const { escapeHtml, dateRangeHtml } = require('../format');
const { anchorOf } = require('../anchors');

// What the timeline's bar for an embedded row links to: an empty span at the
// end of the row, so the <li> markup — which a dozen tests and the print
// script read as is — stays untouched. css/timeline.css pins it to the row's top.
const anchorHtml = (kind, record) =>
  `<span class="tl-anchor" id="${anchorOf(kind, record)}"></span>`;
const { indentLines } = require('../markers');
const { printText, PRINT_PLAN } = require('../print-selection');

// Tags for an entry that references no project at all. With a project, the
// skills hang off the project that earned them — see renderProjectTags.
const renderEmbeddedSkills = (skills) => {
  if (!skills?.length) return '';
  const tags = skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join(' ');
  return `<div class="skill-tags inline-skills">${tags}</div>`;
};

// Skills belong to the project that used them. Rendered inside the row so a
// reader can tell which of two projects under one job brought which stack —
// the aggregated cluster this replaces could not say.
//
// .project-skills, not .inline-skills: this sits inside .embedded-projects,
// which DOES print, and the LaTeX fit plan sets show_skills: false. The class
// exists so print-type.css can hide it without hiding the row.
const renderProjectTags = (keywords) => {
  if (!keywords?.length) return '';
  const tags = keywords.map((k) => `<span class="skill-tag">${escapeHtml(k)}</span>`).join(' ');
  return ` <span class="skill-tags project-skills">${tags}</span>`;
};

// One referenced project or course unit as a list row.
function rowHtml(p) {
  // A course unit's name is its official French designation and its summary
  // the localized title, so on the French page the two are the same string
  // and the row would read "Algorithmique — Algorithmique". Say it once.
  const blurb = p.summary || p.description || '';
  const desc = blurb.trim() === (p.name || '').trim() ? '' : blurb;
  const name = `<strong>${escapeHtml(p.name)}</strong>`;
  const label = p.url
    ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${name}</a>`
    : name;
  // Project blurbs are clipped harder than summaries in the PDF; the span
  // gives print-layout.js something to swap without touching the link.
  const clipped = desc ? printText(desc, PRINT_PLAN.proj_desc) : null;
  const descAttr = clipped ? ` data-print-text="${escapeHtml(clipped)}"` : '';
  const descHtml = desc ? ` — <span${descAttr}>${escapeHtml(desc)}</span>` : '';
  return `<li>${label}${descHtml}${renderProjectTags(p.keywords)}${anchorHtml('project', p)}</li>`;
}
const listHtml = (projs) => [
  '  <ul>',
  `        ${projs.map(rowHtml).join('\n        ')}`,
  '  </ul>',
];

// `blocks`: a degree's academic years. Its course units are then listed year by
// year, each block headed by its year and the programme's name for it; a unit
// on no block follows them.
function renderEmbeddedProjects(projectNames, projects, label, blocks = []) {
  if (!projectNames?.length) return '';
  const projs = projectNames.map((n) => projects.find((p) => p.name === n)).filter(Boolean);
  if (!projs.length) return '';
  const groups = blocks
    .map((block) => ({ block, projs: projs.filter((p) => block.units.includes(p.name)) }))
    .filter((group) => group.projs.length);
  const filed = new Set(groups.flatMap((group) => group.projs));
  const others = projs.filter((p) => !filed.has(p));
  return [
    '<div class="embedded-projects">',
    `  <p class="embedded-label">${escapeHtml(label)}:</p>`,
    ...groups.flatMap(({ block, projs: taken }) => [
      `  <p class="embedded-block">${escapeHtml([block.year, block.label].filter(Boolean).join(' · '))}</p>`,
      ...listHtml(taken),
    ]),
    ...(others.length ? listHtml(others) : []),
    '</div>',
  ].join('\n');
}

// Match volunteer entries to a work/education host by the first word of the
// volunteer's organization: "UMons" matches UMons, "EPHEC …" matches
// "Ecole … (EPHEC-EPS)". Same heuristic as the XSLT views.
function renderEmbeddedVolunteer(volunteer, hostName, t, lang) {
  if (!hostName || !volunteer?.length) return '';
  const matched = volunteer.filter((v) => {
    if (!v.organization) return false;
    const firstWord = v.organization.split(/\s+/)[0];
    return firstWord && hostName.includes(firstWord);
  });
  if (!matched.length) return '';
  const items = matched
    .map((v) => {
      // dateRangeHtml, not a hand-built string: it localizes the months and
      // the open-ended label, and emits <time datetime> so the row is
      // machine-readable like every other date on the page.
      const dates = dateRangeHtml(v.startDate, v.endDate, lang);
      // The organization is implied on the page — these rows sit under their
      // host entry. On the verso they stand alone, as they do in the PDF's
      // own Volunteer section, so it is carried print-only.
      const org = v.organization
        ? `<span class="print-org">${escapeHtml(v.organization)}, </span>`
        : '';
      return `<li><strong>${escapeHtml(v.position)}</strong> — ${org}${dates}${anchorHtml('volunteer', v)}</li>`;
    })
    .join('\n        ');
  return [
    // The extra class is the hook js/print-layout.js uses to gather these rows
    // onto the verso: print hides the education entries they live in, so
    // without it the printed sheet loses the volunteering the PDF prints.
    '<div class="embedded-projects embedded-volunteer">',
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
function appendEmbeds(parts, entry, hostName, ctx, t, lang) {
  const skillsHtml = renderEmbeddedSkills(entry.skills);
  if (skillsHtml) parts.push(`  ${skillsHtml}`);
  // A degree's teaching units are not projects. They are referenced the same
  // way, so without this split the embedded list files Algorithmique and
  // Anglais I under "Projects" beside Acteble — telling the reader the
  // opposite of what they are.
  const named = (entry.projects || []).map((n) => ctx.projects.find((p) => p.name === n));
  const isUnit = (p) => p?.type === 'Course unit';
  const projsHtml = renderEmbeddedProjects(
    named.filter((p) => p && !isUnit(p)).map((p) => p.name),
    ctx.projects,
    t.projects,
  );
  if (projsHtml) parts.push(indentLines(projsHtml, 2));
  const unitsHtml = renderEmbeddedProjects(
    named.filter(isUnit).map((p) => p.name),
    ctx.projects,
    t.courseUnits,
    entry.blocks,
  );
  if (unitsHtml) parts.push(indentLines(unitsHtml, 2));
  const volsHtml = renderEmbeddedVolunteer(ctx.volunteer, hostName, t, lang);
  if (volsHtml) parts.push(indentLines(volsHtml, 2));
  const refsHtml = renderEmbeddedReferenceLinks(ctx.references, hostName, t);
  if (refsHtml) parts.push(`  ${refsHtml}`);
}

module.exports = { appendEmbeds };

const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { profileIcon } = require('../profiles');
const { icon } = require('../icons');
const { highestObtainedDegree, highestInProgressDegree, formatDegreeLine } = require('../degrees');
const {
  renderSkillsBlocks,
  renderLanguagesBlock,
  renderProjectsBlock,
} = require('./sidebar-blocks');

function renderContactInfo(b, t, degreeLines, profileLines) {
  const phoneDigits = (b.phone || '').replace(/[^+\d]/g, '');
  // The PDF writes the country out in the page's language; the screen keeps the
  // ISO code. data-print-text is this repo's existing way of letting the sheet
  // say what the PDF says — carried on a span, not on the <p>, so the swap
  // cannot take the icon with it.
  const placeShort = [b.location?.city, b.location?.countryCode].filter(Boolean).join(', ');
  const placeLong = [b.location?.city, b.location?.region].filter(Boolean).join(', ');
  return [
    '<div class="contact-info">',
    `  <h1>${escapeHtml(b.name)}</h1>`,
    `  <h2>${escapeHtml(b.label)}</h2>`,
    ...degreeLines,
    // Grouped the way \personalinfo groups them: the PDF banner runs
    // email/phone/location on one line and the profiles plus the licence on the
    // next. Real wrappers rather than a positional selector, so the split
    // survives a new profile being added. On screen they stay stacked blocks.
    '  <div class="contact-primary">',
    `    <p>${icon('envelope')} <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>`,
    `    <p>${icon('phone')} <a href="tel:${escapeHtml(phoneDigits)}">${escapeHtml(b.phone)}</a></p>`,
    `    <p>${icon('map-marker-alt')} <span class="contact-place" data-print-text="${escapeHtml(placeLong)}">${escapeHtml(placeShort)}</span></p>`,
    '  </div>',
    '  <div class="contact-profiles">',
    ...profileLines.map((line) => `  ${line}`),
    `    <p>${icon('car')} ${escapeHtml(t.driverLicense)}</p>`,
    '  </div>',
    // The JSON Resume registry: an external rendering of the canonical JSON.
    // The site's own displays (XSLT included) are in the views bar.
    // These used to live in the redundant standalone Contact section at
    // the bottom of the page; folded into the sidebar so the CV has a
    // single point of contact information.
    //
    // .contact-machine: the PDF's \personalinfo has no equivalent, so the print
    // stylesheet drops the pair rather than the sheet carrying links the CV it
    // is meant to mirror does not have.
    `  <p class="contact-machine">${icon('code-branch')} <a href="https://registry.jsonresume.org/grosjeanbaptiste" rel="external noopener" target="_blank">${escapeHtml(t.jsonRegistry)}</a></p>`,
    // The PDF closes its header on a centred "Updated <date>" line. Printed
    // only, and the date is filled in by js/print-layout.js at print time: a
    // build-time date here would put all six pages into every regeneration
    // commit, and would go stale against the PDF anyway.
    `  <p class="print-updated">${icon('redo')} ${escapeHtml(t.updated)} <time></time></p>`,
    '</div>',
  ].join('\n');
}

// Maps a sidebar section name from meta.sidebarOrder to its renderer. dailyLife
// is intentionally absent — it is a static <canvas> in index.html, not
// generated here — so it is silently skipped, like unknown names.
const SIDEBAR_RENDERERS = {
  languages: renderLanguagesBlock,
  skills: renderSkillsBlocks,
  projects: renderProjectsBlock,
};

function generateSidebar(resume, lang) {
  const t = I18N[lang];
  const b = resume.basics;
  const profileLines = (b.profiles || []).map((p) => {
    const label = p.network || p.url;
    return `  <p>${icon(profileIcon(p.network))} <a href="${escapeHtml(p.url)}">${escapeHtml(label)}</a></p>`;
  });

  const inProgressLine = formatDegreeLine(highestInProgressDegree(resume.education), lang);
  const obtainedLine = formatDegreeLine(highestObtainedDegree(resume.education), lang);
  const degreeLines = [];
  if (inProgressLine) {
    degreeLines.push(
      `  <p class="degree degree-in-progress">${icon('book-open')} ${escapeHtml(inProgressLine)} <span class="degree-status">(${escapeHtml(t.inProgress)})</span></p>`,
    );
  }
  if (obtainedLine) {
    degreeLines.push(
      `  <p class="degree degree-obtained">${icon('graduation-cap')} ${escapeHtml(obtainedLine)}</p>`,
    );
  }

  const order = resume.meta?.sidebarOrder ?? ['languages', 'skills'];
  const blocks = order.map((name) => SIDEBAR_RENDERERS[name]?.(resume, t)).filter(Boolean);
  return [renderContactInfo(b, t, degreeLines, profileLines), ...blocks].join('\n\n');
}

module.exports = { generateSidebar };

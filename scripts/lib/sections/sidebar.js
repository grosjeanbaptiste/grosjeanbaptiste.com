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

function renderContactInfo(b, t, lang, degreeLines, profileLines) {
  const phoneDigits = (b.phone || '').replace(/[^+\d]/g, '');
  return [
    '<div class="contact-info">',
    `  <h1>${escapeHtml(b.name)}</h1>`,
    `  <h2>${escapeHtml(b.label)}</h2>`,
    ...degreeLines,
    `  <p>${icon('envelope')} <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>`,
    `  <p>${icon('phone')} <a href="tel:${escapeHtml(phoneDigits)}">${escapeHtml(b.phone)}</a></p>`,
    `  <p>${icon('map-marker-alt')} ${escapeHtml(b.location?.city)}, ${escapeHtml(b.location?.countryCode)}</p>`,
    ...profileLines,
    `  <p>${icon('car')} ${escapeHtml(t.driverLicense)}</p>`,
    // Machine-readable views — XML for Firefox / registry for JSON Resume.
    // These used to live in the redundant standalone Contact section at
    // the bottom of the page; folded into the sidebar so the CV has a
    // single point of contact information.
    `  <p>${icon('code')} <a href="/assets/data/resume-${lang}.xml">${escapeHtml(t.xmlResume)}</a></p>`,
    `  <p>${icon('code-branch')} <a href="https://registry.jsonresume.org/grosjeanbaptiste" rel="external noopener" target="_blank">${escapeHtml(t.jsonRegistry)}</a></p>`,
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
  return [renderContactInfo(b, t, lang, degreeLines, profileLines), ...blocks].join('\n\n');
}

module.exports = { generateSidebar };

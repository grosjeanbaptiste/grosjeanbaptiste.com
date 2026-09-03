const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { profileIcon } = require('../profiles');
const { icon } = require('../icons');
const { highestObtainedDegree, highestInProgressDegree, formatDegreeLine } = require('../degrees');

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

  return [
    renderContactInfo(b, t, lang, degreeLines, profileLines),
    '',
    renderLanguagesBlock(resume, t),
    '',
    renderSkillsBlocks(resume, t),
  ].join('\n');
}

module.exports = { generateSidebar };

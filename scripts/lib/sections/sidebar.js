const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { profileIcon } = require('../profiles');
const { highestObtainedDegree, highestInProgressDegree, formatDegreeLine } = require('../degrees');

function renderContactInfo(b, t, degreeLines, profileLines) {
  return [
    '<div class="contact-info">',
    `  <h1>${escapeHtml(b.name)}</h1>`,
    `  <h2>${escapeHtml(b.label)}</h2>`,
    ...degreeLines,
    `  <p><i class="fas fa-envelope"></i> <a href="mailto:${escapeHtml(b.email)}">${escapeHtml(b.email)}</a></p>`,
    `  <p><i class="fas fa-phone"></i> ${escapeHtml(b.phone)}</p>`,
    `  <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(b.location?.city)}, ${escapeHtml(b.location?.countryCode)}</p>`,
    ...profileLines,
    `  <p><i class="fas fa-car"></i> ${escapeHtml(t.driverLicense)}</p>`,
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
    return `  <p><i class="${profileIcon(p.network)}"></i> <a href="${escapeHtml(p.url)}">${escapeHtml(label)}</a></p>`;
  });

  const inProgressLine = formatDegreeLine(highestInProgressDegree(resume.education), lang);
  const obtainedLine = formatDegreeLine(highestObtainedDegree(resume.education), lang);
  const degreeLines = [];
  if (inProgressLine) {
    degreeLines.push(
      `  <p class="degree degree-in-progress"><i class="fas fa-book-open" aria-hidden="true"></i> ${escapeHtml(inProgressLine)} <span class="degree-status">(${escapeHtml(t.inProgress)})</span></p>`,
    );
  }
  if (obtainedLine) {
    degreeLines.push(
      `  <p class="degree degree-obtained"><i class="fas fa-graduation-cap" aria-hidden="true"></i> ${escapeHtml(obtainedLine)}</p>`,
    );
  }

  return [
    renderContactInfo(b, t, degreeLines, profileLines),
    '',
    renderSkillsBlocks(resume, t),
    '',
    renderLanguagesBlock(resume, t),
  ].join('\n');
}

module.exports = { generateSidebar };

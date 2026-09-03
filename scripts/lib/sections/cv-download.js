const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { icon } = require('../icons');

function generateCvDownload(lang) {
  const t = I18N[lang];
  return [
    `<a href="/assets/cv/cv_grosjean_baptiste_${lang}.pdf" class="cv-download-button" download>`,
    `  ${icon('download')}${escapeHtml(t.downloadCV)}`,
    '</a>',
  ].join('\n');
}

module.exports = { generateCvDownload };

const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { icon } = require('../icons');

// Two CV actions, rendered as one floating cluster:
//
//   - Download: the pre-built LaTeX PDF. Typeset by TeX, the reference version.
//   - Print:    the browser's own print/PDF of this page, styled by
//               css/print.css to follow the LaTeX layout. Always in sync with
//               the page, no build step.
//
// The download link came first and stays — print is an addition beside it.
function generateCvDownload(lang) {
  const t = I18N[lang];
  return [
    '<div class="cv-actions">',
    `  <a href="/assets/cv/cv_grosjean_baptiste_${lang}.pdf" class="cv-download-button" download>`,
    `    ${icon('download')}${escapeHtml(t.downloadCV)}`,
    '  </a>',
    `  <button type="button" class="cv-print-button" onclick="window.print()">`,
    `    ${icon('print')}${escapeHtml(t.printPdf)}`,
    '  </button>',
    '</div>',
  ].join('\n');
}

module.exports = { generateCvDownload };

const I18N = require('../i18n');
const { escapeHtml } = require('../format');
const { icon } = require('../icons');

// Two CV actions, rendered as one floating cluster:
//
//   - Download: the pre-built LaTeX PDF. Typeset by TeX, the reference version.
//   - Print:    the browser's own print/PDF of this page, styled by
//               css/print.css to follow the LaTeX layout. Always in sync with
//               the page, no build step.
//   - Timeline: the second LaTeX PDF, the timeline alone on a landscape page.
//
// The download link came first and stays — print is an addition beside it.
// The timeline alone, over the whole career or over its last `years`.
const timelinePdf = (lang, years) =>
  `/assets/cv/cv_grosjean_baptiste_timeline${years ? `_${years}y` : ''}_${lang}.pdf`;

function generateCvDownload(lang) {
  const t = I18N[lang];
  return [
    '<div class="cv-actions">',
    `  <a href="/assets/cv/cv_grosjean_baptiste_${lang}.pdf" class="cv-download-button" download>`,
    `    ${icon('download')}${escapeHtml(t.downloadCV)}`,
    '  </a>',
    // The timeline's PDF of each zoom: js/timeline.js hands out the one on screen.
    `  <a href="${timelinePdf(lang)}" class="cv-download-button" data-timeline-pdf data-pdf-2="${timelinePdf(lang, 2)}" data-pdf-5="${timelinePdf(lang, 5)}" data-pdf-all="${timelinePdf(lang)}" download>`,
    `    ${icon('download')}${escapeHtml(t.views.timeline)}`,
    '  </a>',
    `  <button type="button" class="cv-print-button" onclick="window.print()">`,
    `    ${icon('print')}${escapeHtml(t.printPdf)}`,
    '  </button>',
    '</div>',
  ].join('\n');
}

module.exports = { generateCvDownload };

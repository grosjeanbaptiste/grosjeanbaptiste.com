// The three timeline PDFs of each language: the whole career, the last five
// years and the last two — the interactive view's zoom options, on paper.
const SPANS = [
  { years: null, suffix: '' },
  { years: 5, suffix: '_5y' },
  { years: 2, suffix: '_2y' },
];

const timelineFile = (lang, span) => `cv_grosjean_baptiste_timeline${span.suffix}_${lang}.pdf`;

module.exports = { SPANS, timelineFile };

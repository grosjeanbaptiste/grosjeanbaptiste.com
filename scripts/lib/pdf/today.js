// The header's "Updated <date>" date, localized here rather than by LaTeX.
//
// \today takes its wording from \selectlanguage, and config.js deliberately
// selects babel's `english` for zh (babel's CJK support is poor; xeCJK does the
// typesetting). The Chinese CV therefore printed an English date under a
// Chinese label. These tables are the same kind of data as tex.js's MONTHS —
// one row per language, every row the same shape.

const LONG_MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
       'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
       'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  zh: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
};

// How each language orders day, month and year — babel's own conventions for
// the five it covers, and the standard CJK order for zh.
const PATTERNS = {
  en: (d, month, y) => `${month} ${d}, ${y}`,
  fr: (d, month, y) => `${d} ${month} ${y}`,
  nl: (d, month, y) => `${d} ${month} ${y}`,
  es: (d, month, y) => `${d} de ${month} de ${y}`,
  de: (d, month, y) => `${d}. ${month} ${y}`,
  zh: (d, month, y) => `${y}年${month}月${d}日`,
};

/**
 * `date` written out in `lang`, in the form that language's CV already used.
 * Falls back to English rather than to a half-formatted string, so a new
 * language added to LANGS without a row here still produces a readable date.
 */
function formatLongDate(date, lang) {
  const months = LONG_MONTHS[lang] || LONG_MONTHS.en;
  const pattern = PATTERNS[lang] || PATTERNS.en;
  return pattern(date.getDate(), months[date.getMonth()], date.getFullYear());
}

module.exports = { formatLongDate, LONG_MONTHS };

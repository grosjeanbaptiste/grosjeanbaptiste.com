const I18N = require('./i18n');

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ],
  nl: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  de: [
    'Jan.',
    'Feb.',
    'März',
    'Apr.',
    'Mai',
    'Juni',
    'Juli',
    'Aug.',
    'Sep.',
    'Okt.',
    'Nov.',
    'Dez.',
  ],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

// Drop pictographs and dingbat-range codepoints (emoji, ✊, etc.) that
// pdflatex can't render — those come through mostly from references and
// summary paragraphs written casually. Keep everything else (accented
// letters, CJK, standard punctuation) intact. Variation selectors are matched
// via the Unicode property (not a character class) so the pattern never mixes
// a base glyph with a combining mark (biome noMisleadingCharacterClass).
const EMOJI_RANGES = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2900}-\u{29FF}]/gu;
const VARIATION_SELECTORS = /\p{Variation_Selector}/gu;

function tex(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(EMOJI_RANGES, '')
    .replace(VARIATION_SELECTORS, '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Wrap each word in \mbox{} so narrow-column titles can't be hyphenated.
// Without this, FR/NL/ES "COMPÉTENCES TECHNIQUES" breaks as "TECH-/NIQUES".
function nohyphen(value) {
  if (!value) return '';
  return String(value)
    .split(/(\s+)/)
    .map((part) => (part.trim() === '' ? part : `\\mbox{${tex(part)}}`))
    .join('');
}

function truncate(s, n) {
  if (!s) return '';
  const str = String(s).replace(/\s+/g, ' ').trim();
  if (str.length <= n) return str;
  return `${str.slice(0, n - 1).trimEnd()}…`;
}

function formatDate(iso, lang) {
  if (!iso || iso === 'Present') return I18N[lang].present;
  const m = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/.exec(String(iso));
  if (!m) return tex(iso);
  if (!m[2]) return m[1];
  return `${MONTHS[lang][Number.parseInt(m[2], 10) - 1]} ${m[1]}`;
}

module.exports = { tex, nohyphen, truncate, formatDate };

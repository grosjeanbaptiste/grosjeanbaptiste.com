const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const MONTHS_LOCALIZED = {
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

const PRESENT_LABEL = {
  en: 'Present',
  fr: 'Aujourd’hui',
  nl: 'Heden',
  es: 'Actualidad',
  de: 'Heute',
  zh: '至今',
};

const ISO_DATE_RE = /^\d{4}(-\d{2}){0,2}$/;

function formatDate(iso, lang = 'en') {
  if (!iso || iso === 'Present') return PRESENT_LABEL[lang];
  const [y, m] = iso.split('-');
  if (m) return `${MONTHS_LOCALIZED[lang][Number.parseInt(m, 10) - 1]} ${y}`;
  return y;
}

function timeHtml(iso, lang) {
  if (!iso || iso === 'Present') return `<time>${escapeHtml(formatDate(iso, lang))}</time>`;
  if (ISO_DATE_RE.test(iso))
    return `<time datetime="${iso}">${escapeHtml(formatDate(iso, lang))}</time>`;
  return `<time>${escapeHtml(iso)}</time>`;
}

const dateRangeHtml = (start, end, lang) => `${timeHtml(start, lang)} – ${timeHtml(end, lang)}`;

module.exports = { escapeHtml, formatDate, timeHtml, dateRangeHtml };

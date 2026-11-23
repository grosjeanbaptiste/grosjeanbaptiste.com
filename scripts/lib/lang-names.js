// The name of each language, written in each language the pages are in: the
// language switchers read it, so on the French page the buttons say "Anglais".
// A table, not Intl.DisplayNames: the generated pages are committed, and ICU
// data differs between machines.
const NAMES = {
  en: { en: 'English', fr: 'French', nl: 'Dutch', es: 'Spanish', de: 'German', zh: 'Chinese' },
  fr: {
    en: 'Anglais',
    fr: 'Français',
    nl: 'Néerlandais',
    es: 'Espagnol',
    de: 'Allemand',
    zh: 'Chinois',
  },
  nl: { en: 'Engels', fr: 'Frans', nl: 'Nederlands', es: 'Spaans', de: 'Duits', zh: 'Chinees' },
  es: { en: 'Inglés', fr: 'Francés', nl: 'Neerlandés', es: 'Español', de: 'Alemán', zh: 'Chino' },
  de: {
    en: 'Englisch',
    fr: 'Französisch',
    nl: 'Niederländisch',
    es: 'Spanisch',
    de: 'Deutsch',
    zh: 'Chinesisch',
  },
  zh: { en: '英语', fr: '法语', nl: '荷兰语', es: '西班牙语', de: '德语', zh: '中文' },
};

// The name of `code`, as written on a page in `ui`.
const langName = (ui, code) => NAMES[ui][code];

module.exports = { langName, LANG_NAMES: NAMES };

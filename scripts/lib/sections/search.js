// The classic page's search: a dialog, closed as the page opens, and the data
// it searches — the entries that are on the page, the skills with the number
// of entries using each, and the name of each kind of entry. js/search.js
// opens it (a button in the nav, ⌘K / Ctrl+K), ranks with js/search-rank.js,
// and leads to the entry or applies the skill filter.
const { escapeHtml } = require('../format');
const { skillUsage } = require('../cv-index');
const { LANGS, langPath } = require('../config');

// Each language under its own name, whatever the page's language.
const LANG_NAMES = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
};

// What can be done from the search besides reaching an entry: read the CV in
// another language, toggle the theme (the page's own button is pressed), take
// one of the two PDFs.
const actionsOf = (lang, t) => [
  ...LANGS.filter((other) => other !== lang).map((other) => ({
    label: LANG_NAMES[other],
    hint: t.langMenuLabel,
    href: langPath(other),
  })),
  { label: t.themeLabel, press: '#theme-toggle' },
  { label: t.downloadCV, hint: 'PDF', href: `/assets/cv/cv_grosjean_baptiste_${lang}.pdf` },
  {
    label: t.downloadTimeline,
    hint: 'PDF',
    href: `/assets/cv/cv_grosjean_baptiste_timeline_${lang}.pdf`,
  },
];

// The section each kind of entry is listed under, in the page's language.
const KIND_LABEL = {
  work: 'experience',
  education: 'education',
  project: 'projects',
  course: 'courseUnits',
  volunteer: 'volunteer',
  competition: 'competitions',
};

// JSON inside a <script>: "<" is written as its escape, so no text of the CV
// can close the element early.
const inert = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function renderSearch(onPage, shown, lang, t) {
  const kinds = Object.fromEntries(Object.entries(KIND_LABEL).map(([kind, key]) => [kind, t[key]]));
  const groups = { skills: t.searchSkills, entries: t.searchEntries };
  const actions = actionsOf(lang, t);
  const index = { entries: onPage, skills: skillUsage(shown), kinds, groups, actions };
  return [
    `<dialog id="cv-search" aria-label="${escapeHtml(t.search)}">`,
    `  <input type="search" class="cv-search-input" aria-label="${escapeHtml(t.search)}" placeholder="${escapeHtml(t.searchPlaceholder)}" autocomplete="off" aria-controls="cv-search-results">`,
    '  <ul id="cv-search-results" class="cv-search-results" role="listbox"></ul>',
    `  <p class="cv-search-empty" hidden>${escapeHtml(t.noResults)}</p>`,
    `  <script type="application/json" id="cv-index">${inert(index)}</script>`,
    '</dialog>',
  ].join('\n');
}

// The button that opens it, set in the timeline's head. Hidden until
// js/search.js runs: without it the button would open nothing.
const searchOpener = (t) =>
  `    <button type="button" class="tl-search-open" aria-haspopup="dialog" aria-controls="cv-search" hidden>${escapeHtml(t.search)}</button>`;

module.exports = { renderSearch, searchOpener };

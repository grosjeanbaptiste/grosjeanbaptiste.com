// The search as the XML mirrors carry it (meta/search), for the rich XSLT
// theme to write the classic page's dialog (sections/search.js) that
// js/search.js runs. The same index, but its skills lead to the theme's own
// filter (#skill-…, xml-skill-filter.js) — pure CSS, never a script — and its
// actions to the other XSLT displays, the theme button and the PDFs.
const { LANGS } = require('./config');
const { searchIndexOf, inert, LANG_NAMES } = require('./sections/search');
const { timelinePdf } = require('./sections/cv-download');

const actionsOf = (lang, t) => [
  ...LANGS.filter((other) => other !== lang).map((other) => ({
    label: LANG_NAMES[other],
    hint: t.langMenuLabel,
    href: `/assets/data/resume-${other}.xml`,
  })),
  { label: t.themeLabel, press: '#theme-toggle' },
  { label: t.downloadCV, hint: 'PDF', href: `/assets/cv/cv_grosjean_baptiste_${lang}.pdf` },
  { label: t.downloadTimeline, hint: 'PDF', href: timelinePdf(lang) },
];

// `there`: the entries on the page; `shown`: those the filter counts;
// `filter`: the theme's skill filter, whose tokens name the targets.
function searchForXml(there, shown, filter, lang, t) {
  const tokens = new Map(
    [...(filter?.shortlist || []), ...(filter?.rest || [])].map((s) => [s.name, s.token]),
  );
  const index = searchIndexOf(there, shown, t, actionsOf(lang, t));
  const skills = index.skills.map((s) => ({ ...s, href: `#skill-${tokens.get(s.skill)}` }));
  return {
    label: t.search,
    placeholder: t.searchPlaceholder,
    empty: t.noResults,
    index: inert({ ...index, skills }),
  };
}

module.exports = { searchForXml };

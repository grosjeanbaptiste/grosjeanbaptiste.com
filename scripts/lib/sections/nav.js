const I18N = require('../i18n');
const { LANGS, langPath } = require('../config');
const { escapeHtml } = require('../format');
const { icon } = require('../icons');

function generateNav(lang) {
  const t = I18N[lang];
  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'experience', label: t.nav.experience },
    { id: 'education', label: t.nav.education },
    { id: 'references', label: t.nav.references },
  ];
  const navLinks = navItems
    .map((i) => `    <li><a href="#${i.id}" class="nav-link">${escapeHtml(i.label)}</a></li>`)
    .join('\n');
  const langLinks = LANGS.map((l) => {
    const cls = l === lang ? ' class="active"' : '';
    const aria = l === lang ? ' aria-current="page"' : '';
    return `    <a href="${langPath(l)}" hreflang="${l}"${cls}${aria}>${l.toUpperCase()}</a>`;
  }).join('\n');
  return [
    '<nav>',
    `  <button class="menu-toggle" aria-label="${escapeHtml(t.menuLabel)}" id="menu-toggle">`,
    `    ${icon('bars')}`,
    '  </button>',
    '  <ul id="nav-menu">',
    navLinks,
    '  </ul>',
    `  <div class="lang-switcher" aria-label="${escapeHtml(t.langMenuLabel)}">`,
    langLinks,
    '  </div>',
    `  <button id="theme-toggle" aria-label="${escapeHtml(t.themeLabel)}" data-label-dark="${escapeHtml(t.darkMode)}" data-label-light="${escapeHtml(t.lightMode)}">`,
    `    ${icon('moon')}`,
    `    <span>${escapeHtml(t.darkMode)}</span>`,
    '  </button>',
    '</nav>',
  ].join('\n');
}

module.exports = { generateNav };

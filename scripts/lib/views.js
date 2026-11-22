// The displays of the CV. Classic HTML, interactive (React), the two XSLT
// themes, the PDF and the landscape timeline PDF are all just ways of showing the same CV, so every HTML
// display carries one identical bar listing them (css/views-bar.css).
//
// This registry is the single list. Three renderers read it:
//   - the static generator, through renderViewsBar() below;
//   - the XSLT themes, through <meta><views> in the XML mirrors (xml.js);
//   - the React view, through the `views` its data export carries.

const { langPath } = require('./config');
const { escapeHtml } = require('./format');
const I18N = require('./i18n');

const VIEWS = [
  { id: 'classic', href: (lang) => langPath(lang) },
  { id: 'interactive', href: (lang) => `/app/${lang}/` },
  { id: 'xsltRich', href: (lang) => `/assets/data/resume-${lang}.html` },
  {
    id: 'xsltMinimal',
    href: (lang) => `/assets/data/resume-${lang}-minimal.html`,
  },
  // The reader page (react/), which shows the LaTeX PDF inside the site.
  { id: 'pdf', href: (lang) => `/app/${lang}/pdf/` },
  // The same reader, on the landscape PDF that carries the timeline alone.
  { id: 'timeline', href: (lang) => `/app/${lang}/pdf/timeline/` },
];

// The displays as one language shows them: { id, href, label }.
function viewsOf(lang) {
  const t = I18N[lang];
  return VIEWS.map((view) => ({ id: view.id, href: view.href(lang), label: t.views[view.id] }));
}

// The bar as HTML, `current` being the display it is rendered into.
function renderViewsBar(lang, current) {
  const title = escapeHtml(I18N[lang].views.title);
  const items = viewsOf(lang).map((view) => {
    const aria = view.id === current ? ' aria-current="page"' : '';
    return `      <li><a class="views-bar-link" href="${view.href}"${aria}>${escapeHtml(view.label)}</a></li>`;
  });
  return [
    `  <nav class="views-bar" aria-label="${title}">`,
    `    <span class="views-bar-title">${title}</span>`,
    '    <ul>',
    ...items,
    '    </ul>',
    '  </nav>',
  ].join('\n');
}

module.exports = { VIEWS, viewsOf, renderViewsBar };

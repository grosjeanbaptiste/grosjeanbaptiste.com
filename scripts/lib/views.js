// The displays of the CV. Classic HTML, interactive (React), the two XSLT
// themes and the PDF are all just ways of showing the same CV, so every HTML
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
  { id: 'xsltRich', href: (lang) => `/assets/data/resume-${lang}.xml`, firefoxOnly: true },
  {
    id: 'xsltMinimal',
    href: (lang) => `/assets/data/resume-${lang}-minimal.xml`,
    firefoxOnly: true,
  },
  { id: 'pdf', href: (lang) => `/assets/cv/cv_grosjean_baptiste_${lang}.pdf` },
];

// The displays as one language shows them: { id, href, label, note? }.
function viewsOf(lang) {
  const t = I18N[lang];
  return VIEWS.map((view) => {
    const out = { id: view.id, href: view.href(lang), label: t.views[view.id] };
    // Chrome and Safari no longer apply client-side XSLT; say so on hover.
    if (view.firefoxOnly) out.note = t.firefoxNote;
    return out;
  });
}

// The bar as HTML, `current` being the display it is rendered into.
function renderViewsBar(lang, current) {
  const title = escapeHtml(I18N[lang].views.title);
  const items = viewsOf(lang).map((view) => {
    const aria = view.id === current ? ' aria-current="page"' : '';
    const note = view.note ? ` title="${escapeHtml(view.note)}"` : '';
    return `      <li><a class="views-bar-link" href="${view.href}"${aria}${note}>${escapeHtml(view.label)}</a></li>`;
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

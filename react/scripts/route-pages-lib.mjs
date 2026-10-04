// Pure part of the post-build step: one HTML page per route, so GitHub Pages
// (which cannot rewrite URLs) serves /app/fr/project/baba directly, with a
// title and description that already name the entry before any JS runs.

const SECTIONS = [
  ['work', (e) => ({ title: `${e.position} — ${e.company}`, text: e.summary })],
  [
    'education',
    (e) => ({ title: `${e.studyType ?? e.institution} — ${e.institution}`, text: e.area }),
  ],
  ['projects', (e) => ({ title: e.name, text: e.description ?? e.summary })],
  ['volunteer', (e) => ({ title: `${e.position} — ${e.organization}`, text: e.summary })],
];

const kindOf = (section, entry) =>
  section === 'projects' ? (entry.courseUnit ? 'course' : 'project') : section;

const escapeHtml = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const HEAD = /<!-- ROUTE-HEAD -->[\s\S]*?<!-- \/ROUTE-HEAD -->/;

// `picture`: a reader page's first-page picture, fetched with the page itself
// instead of once the app has booted and read its data.
function render(template, lang, title, description, picture) {
  const head = [
    '<!-- ROUTE-HEAD -->',
    `<title>${escapeHtml(title)}</title>`,
    ...(picture
      ? [`<link rel="preload" as="image" href="${escapeHtml(picture)}" fetchpriority="high" />`]
      : []),
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    '<!-- /ROUTE-HEAD -->',
  ].join('\n    ');
  return template.replace(HEAD, head).replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
}

export function routePages(template, documents) {
  if (!HEAD.test(template)) throw new Error('index.html has lost its ROUTE-HEAD markers');
  return documents.flatMap(({ lang, resume, views, pictures }) => {
    const firstPicture = (pdf) => {
      const src = pictures?.[`/assets/cv/${pdf}`]?.[0]?.src;
      if (!src) throw new Error(`The ${lang} export has no page picture of ${pdf}`);
      return src;
    };
    const { name, label } = resume.basics;
    const home = {
      path: `${lang}/index.html`,
      html: render(template, lang, `${name} — ${label}`, label),
    };
    const entries = SECTIONS.flatMap(([section, describe]) =>
      (resume[section] ?? []).map((entry) => {
        const { title, text } = describe(entry);
        return {
          path: `${lang}/${kindOf(section, entry)}/${entry.id}/index.html`,
          html: render(template, lang, `${title} · ${name}`, text ?? title),
        };
      }),
    );
    const reader = {
      path: `${lang}/pdf/index.html`,
      html: render(
        template,
        lang,
        `CV (PDF) · ${name}`,
        `${name} — ${label} (PDF)`,
        firstPicture(`cv_grosjean_baptiste_${lang}.pdf`),
      ),
    };
    const timeline = (views ?? []).find((view) => view.id === 'timeline');
    if (!timeline) throw new Error(`The ${lang} export lists no timeline display`);
    const timelineReader = {
      path: `${lang}/pdf/timeline/index.html`,
      html: render(
        template,
        lang,
        `${timeline.label} · ${name}`,
        `${name} — ${timeline.label}`,
        firstPicture(`cv_grosjean_baptiste_timeline_${lang}.pdf`),
      ),
    };
    return [home, reader, timelineReader, ...entries];
  });
}

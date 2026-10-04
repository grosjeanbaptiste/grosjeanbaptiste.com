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

// `ahead`: what the page starts fetching with its own HTML, instead of once
// the app has booted — <link> tags, already written.
function render(template, lang, title, description, ahead = []) {
  const head = [
    '<!-- ROUTE-HEAD -->',
    `<title>${escapeHtml(title)}</title>`,
    ...ahead,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    '<!-- /ROUTE-HEAD -->',
  ].join('\n    ');
  return template.replace(HEAD, head).replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
}

// A fetch() the app will make, started early. crossorigin="anonymous" is what
// makes the browser hand this very response to that fetch().
const fetchAhead = (href) =>
  `<link rel="preload" as="fetch" href="${escapeHtml(href)}" crossorigin="anonymous" />`;

// What another display may warm ahead for this page: a JSON list the browser
// ignores and js/views-ahead.js reads. Not <link rel="preload"> nor "prefetch":
// both were measured to take the bandwidth the first page's picture needed
// (it showed at 3.5 s instead of 1.9 s on a slow connection).
const listAhead = (urls) =>
  `<script type="application/json" class="views-ahead">${JSON.stringify(urls).replaceAll('<', '\\u003c')}</script>`;

// The PDF engine — dynamic imports the reader makes once booted — named by the
// build (Vite's manifest).
const engineFiles = ({ modules, styles, worker }) => [...modules, ...styles, worker];

export function routePages(template, documents, engine) {
  if (!HEAD.test(template)) throw new Error('index.html has lost its ROUTE-HEAD markers');
  return documents.flatMap(({ lang, resume, views, pictures }) => {
    const data = fetchAhead(`/app/data/${lang}.json`);
    // A reader page: its first page's picture and the data, fetched with it; the
    // PDF and the engine, listed for the other displays to warm.
    const readerAhead = (pdf) => {
      const src = pictures?.[`/assets/cv/${pdf}`]?.[0]?.src;
      if (!src) throw new Error(`The ${lang} export has no page picture of ${pdf}`);
      return [
        `<link rel="preload" as="image" href="${escapeHtml(src)}" fetchpriority="high" />`,
        data,
        listAhead([`/assets/cv/${pdf}`, ...engineFiles(engine)]),
      ];
    };
    const { name, label } = resume.basics;
    const home = {
      path: `${lang}/index.html`,
      html: render(template, lang, `${name} — ${label}`, label, [data]),
    };
    const entries = SECTIONS.flatMap(([section, describe]) =>
      (resume[section] ?? []).map((entry) => {
        const { title, text } = describe(entry);
        return {
          path: `${lang}/${kindOf(section, entry)}/${entry.id}/index.html`,
          html: render(template, lang, `${title} · ${name}`, text ?? title, [data]),
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
        readerAhead(`cv_grosjean_baptiste_${lang}.pdf`),
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
        readerAhead(`cv_grosjean_baptiste_timeline_${lang}.pdf`),
      ),
    };
    return [home, reader, timelineReader, ...entries];
  });
}

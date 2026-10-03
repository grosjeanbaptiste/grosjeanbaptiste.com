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

function render(template, lang, title, description) {
  const head = [
    '<!-- ROUTE-HEAD -->',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    '<!-- /ROUTE-HEAD -->',
  ].join('\n    ');
  return template.replace(HEAD, head).replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
}

export function routePages(template, documents) {
  if (!HEAD.test(template)) throw new Error('index.html has lost its ROUTE-HEAD markers');
  return documents.flatMap(({ lang, resume }) => {
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
      html: render(template, lang, `CV (PDF) · ${name}`, `${name} — ${label} (PDF)`),
    };
    return [home, reader, ...entries];
  });
}

import { describe, expect, it } from 'vitest';
import { routePages } from './route-pages-lib.mjs';

const template = `<html lang="en"><head>
<!-- ROUTE-HEAD -->
<title>default</title>
<!-- /ROUTE-HEAD -->
</head></html>`;

const doc = (lang, position) => ({
  lang,
  views: [{ id: 'timeline', href: `/app/${lang}/pdf/timeline/`, label: 'Timeline (PDF)' }],
  pictures: {
    [`/assets/cv/cv_grosjean_baptiste_${lang}.pdf`]: [
      { src: `/p/cv_${lang}-1.webp`, width: 1000, height: 1414 },
    ],
    [`/assets/cv/cv_grosjean_baptiste_timeline_${lang}.pdf`]: [
      { src: `/p/tl_${lang}-1.webp`, width: 1000, height: 707 },
    ],
  },
  resume: {
    basics: { name: 'Baptiste Grosjean', label: 'Computer Scientist' },
    work: [{ id: 'acteble-founder', company: 'Acteble', position, summary: 'Rust & <Flutter>' }],
    education: [],
    projects: [{ id: 'algo', name: 'Algo', courseUnit: true }],
    volunteer: [],
  },
});

const pages = routePages(template, [doc('en', 'Founder'), doc('fr', 'Fondateur')]);
const page = (path) => pages.find((p) => p.path === path);

describe('routePages', () => {
  it('writes a page for each language home', () => {
    expect(page('fr/index.html').html).toContain(
      '<title>Baptiste Grosjean — Computer Scientist</title>',
    );
  });

  it('writes a page for each entry, under its kind', () => {
    expect(page('fr/work/acteble-founder/index.html').html).toContain(
      '<title>Fondateur — Acteble · Baptiste Grosjean</title>',
    );
  });

  it('writes the PDF reader page of each language', () => {
    expect(page('fr/pdf/index.html').html).toContain('<title>CV (PDF) · Baptiste Grosjean</title>');
  });

  it('writes the timeline reader page of each language', () => {
    expect(page('fr/pdf/timeline/index.html').html).toContain(
      '<title>Timeline (PDF) · Baptiste Grosjean</title>',
    );
  });

  it('fails when the export has lost the timeline display', () => {
    expect(() => routePages(template, [{ ...doc('en', 'Founder'), views: [] }])).toThrow(
      /timeline/,
    );
  });

  it("starts fetching the picture of the CV's first page with the reader page", () => {
    expect(page('fr/pdf/index.html').html).toContain(
      '<link rel="preload" as="image" href="/p/cv_fr-1.webp" fetchpriority="high" />',
    );
  });

  it('starts fetching the picture of the timeline with its reader page', () => {
    expect(page('fr/pdf/timeline/index.html').html).toContain(
      '<link rel="preload" as="image" href="/p/tl_fr-1.webp" fetchpriority="high" />',
    );
  });

  it('fetches no picture ahead on the interactive pages', () => {
    expect(page('fr/index.html').html).not.toContain('rel="preload"');
  });

  it('fails when the export has no picture of a reader’s PDF', () => {
    expect(() => routePages(template, [{ ...doc('en', 'Founder'), pictures: {} }])).toThrow(
      /no page picture of cv_grosjean_baptiste_en\.pdf/,
    );
  });

  it('files course units under the course kind', () => {
    expect(page('en/course/algo/index.html')).toBeDefined();
  });

  it('escapes text before putting it in the HTML', () => {
    expect(page('en/work/acteble-founder/index.html').html).toContain(
      'content="Rust &amp; &lt;Flutter&gt;"',
    );
  });

  it('marks the page with its language', () => {
    expect(page('fr/index.html').html).toContain('<html lang="fr"');
  });

  it('fails when the template has lost its head markers', () => {
    expect(() => routePages('<head></head>', [doc('en', 'Founder')])).toThrow(/ROUTE-HEAD/);
  });
});

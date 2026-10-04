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

// What the build says the PDF engine is made of (from Vite's manifest).
const engine = {
  modules: ['/app/assets/pdf-abc.js', '/app/assets/pdf_viewer-def.js'],
  styles: ['/app/assets/pdf_viewer-ghi.css'],
  worker: '/app/assets/pdf.worker.min-jkl.mjs',
};
const pages = routePages(template, [doc('en', 'Founder'), doc('fr', 'Fondateur')], engine);
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
    expect(() => routePages(template, [{ ...doc('en', 'Founder'), views: [] }], engine)).toThrow(
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
    expect(page('fr/index.html').html).not.toContain('as="image"');
  });

  it('fails when the export has no picture of a reader’s PDF', () => {
    expect(() => routePages(template, [{ ...doc('en', 'Founder'), pictures: {} }], engine)).toThrow(
      /no page picture of cv_grosjean_baptiste_en\.pdf/,
    );
  });

  it('starts fetching the language’s data with every page, for the app to find it there', () => {
    for (const path of [
      'fr/index.html',
      'fr/work/acteble-founder/index.html',
      'fr/pdf/index.html',
    ]) {
      expect(page(path).html).toContain(
        '<link rel="preload" as="fetch" href="/app/data/fr.json" crossorigin="anonymous" />',
      );
    }
  });

  // What another display may warm ahead for a reader page: a list the browser
  // ignores and js/views-ahead.js reads.
  const listed = (path) => {
    const block = page(path).html.match(
      /<script type="application\/json" class="views-ahead">(.*?)<\/script>/,
    );
    return block ? JSON.parse(block[1]) : null;
  };

  it('lists the PDF engine and the PDF on a reader page, for another display to warm', () => {
    expect(listed('fr/pdf/index.html')).toEqual([
      '/assets/cv/cv_grosjean_baptiste_fr.pdf',
      '/app/assets/pdf-abc.js',
      '/app/assets/pdf_viewer-def.js',
      '/app/assets/pdf_viewer-ghi.css',
      '/app/assets/pdf.worker.min-jkl.mjs',
    ]);
  });

  it('lists the timeline PDF on its reader page', () => {
    expect(listed('fr/pdf/timeline/index.html')[0]).toBe(
      '/assets/cv/cv_grosjean_baptiste_timeline_fr.pdf',
    );
  });

  // Measured twice: preloaded, then prefetched, the engine and the PDF took the
  // bandwidth the first page's picture needed — it showed at 3.5 s, not 1.9 s.
  it('has the reader page itself fetch nothing ahead but its picture and its data', () => {
    const links = page('fr/pdf/index.html').html.match(
      /<link rel="(?:preload|prefetch|modulepreload)"[^>]*>/g,
    );
    expect(links).toEqual([
      '<link rel="preload" as="image" href="/p/cv_fr-1.webp" fetchpriority="high" />',
      '<link rel="preload" as="fetch" href="/app/data/fr.json" crossorigin="anonymous" />',
    ]);
  });

  it('lists nothing on the interactive pages', () => {
    expect(listed('fr/index.html')).toBeNull();
  });

  it('leaves the PDF engine out of the interactive pages', () => {
    expect(page('fr/index.html').html).not.toContain('pdf-abc.js');
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
    expect(() => routePages('<head></head>', [doc('en', 'Founder')], engine)).toThrow(/ROUTE-HEAD/);
  });
});

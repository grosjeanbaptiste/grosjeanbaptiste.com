import { describe, expect, it } from 'vitest';
import { routePages } from './route-pages-lib.mjs';

const template = `<html lang="en"><head>
<!-- ROUTE-HEAD -->
<title>default</title>
<!-- /ROUTE-HEAD -->
</head></html>`;

const doc = (lang, position) => ({
  lang,
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

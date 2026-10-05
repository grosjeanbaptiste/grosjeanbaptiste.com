// A competition has a page of its own, like every entry a bar can open.
import { describe, expect, it } from 'vitest';
import { routePages } from './route-pages-lib.mjs';

const template = `<html lang="en"><head>
<!-- ROUTE-HEAD -->
<title>default</title>
<!-- /ROUTE-HEAD -->
</head><body><div id="root"></div></body></html>`;
const engine = { modules: [], styles: [], worker: '/app/assets/w.js' };
const document = {
  lang: 'fr',
  views: [{ id: 'timeline', href: '/app/fr/pdf/timeline/', label: 'Timeline (PDF)' }],
  // Every language has its two reader pages, each with a first page to show.
  pictures: {
    '/assets/cv/cv_grosjean_baptiste_fr.pdf': [{ src: '/p/cv-1.webp', width: 1000, height: 1414 }],
    '/assets/cv/cv_grosjean_baptiste_timeline_fr.pdf': [
      { src: '/p/tl-1.webp', width: 1000, height: 707 },
    ],
  },
  resume: {
    basics: { name: 'Baptiste Grosjean', label: 'Informaticien' },
    work: [],
    education: [],
    projects: [],
    volunteer: [],
    competitions: [{ id: 'hackathon-2024', title: 'Hackathon 2024', summary: 'EduCraft' }],
  },
};

describe('routePages, on competitions', () => {
  it('writes a page for each competition, under its kind', () => {
    const pages = routePages(template, [document], engine, () => '<main></main>');
    const page = pages.find((p) => p.path === 'fr/competition/hackathon-2024/index.html');
    expect(page?.html).toContain('<title>Hackathon 2024 · Baptiste Grosjean</title>');
  });
});

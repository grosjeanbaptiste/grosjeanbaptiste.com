// A course unit is a course, never a project: each has a page under its own
// kind, as an experience and a degree have.
import { describe, expect, it } from 'vitest';
import { routePages } from './route-pages-lib.mjs';

const template = `<html lang="en"><head>
<!-- ROUTE-HEAD -->
<title>default</title>
<!-- /ROUTE-HEAD -->
</head><body><div id="root"></div></body></html>`;
const engine = { modules: [], styles: [], worker: '/app/assets/w.js' };
const document = {
  lang: 'en',
  views: [{ id: 'timeline', href: '/app/en/pdf/timeline/', label: 'Timeline (PDF)' }],
  pictures: {
    '/assets/cv/cv_grosjean_baptiste_en.pdf': [{ src: '/p/cv-1.webp', width: 1000, height: 1414 }],
    '/assets/cv/cv_grosjean_baptiste_timeline_en.pdf': [
      { src: '/p/tl-1.webp', width: 1000, height: 707 },
    ],
  },
  resume: {
    basics: { name: 'Baptiste Grosjean', label: 'Computer Scientist' },
    work: [],
    education: [],
    projects: [{ id: 'baba', name: 'Baba', description: 'A shell' }],
    courses: [{ id: 'algo', name: 'Algo', summary: 'Algorithmics' }],
    volunteer: [],
  },
};
const pages = routePages(template, [document], engine, () => '<main></main>');
const page = (path) => pages.find((p) => p.path === path);

describe('routePages, on courses and projects', () => {
  it('files a course under the course kind', () => {
    expect(page('en/course/algo/index.html')).toBeDefined();
  });

  it('never files a course under the project kind', () => {
    expect(page('en/project/algo/index.html')).toBeUndefined();
  });

  it('describes the page of a course by its translated title', () => {
    expect(page('en/course/algo/index.html').html).toContain(
      '<meta name="description" content="Algorithmics" />',
    );
  });

  it('files a project under the project kind', () => {
    expect(page('en/project/baba/index.html')).toBeDefined();
  });
});

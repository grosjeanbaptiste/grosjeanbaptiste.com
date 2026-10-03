// The landscape timeline PDF is announced where the vertical CV is: in the
// sitemap, and among each page's machine-readable alternates.
const test = require('node:test');
const assert = require('node:assert/strict');
const { SITE_URL, LANGS } = require('../config');
const { generateSitemap } = require('./sitemap');
const { generateHead } = require('./head');
const { loadResume } = require('../data');

test('the sitemap lists the timeline PDF of every language', () => {
  const sitemap = generateSitemap();
  for (const lang of LANGS) {
    assert.ok(
      sitemap.includes(
        `<loc>${SITE_URL}/assets/cv/cv_grosjean_baptiste_timeline_${lang}.pdf</loc>`,
      ),
      `${lang}: the timeline PDF is not in the sitemap`,
    );
  }
});

test('each page names its timeline PDF among its alternates', () => {
  for (const lang of LANGS) {
    assert.match(
      generateHead(loadResume(lang), lang),
      new RegExp(
        `<link rel="alternate" type="application/pdf" [^>]*href="/assets/cv/cv_grosjean_baptiste_timeline_${lang}\\.pdf">`,
      ),
      `${lang}: no alternate link to the timeline PDF`,
    );
  }
});

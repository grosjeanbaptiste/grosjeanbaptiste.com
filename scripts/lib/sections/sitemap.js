const { SITE_URL, LANGS, langPath } = require('../config');

function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const alternates = [
    ...LANGS.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${langPath(l)}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`,
  ].join('\n');

  const langBlocks = LANGS.map((lang) =>
    [
      '  <url>',
      `    <loc>${SITE_URL}${langPath(lang)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      `    <priority>${lang === 'en' ? '1.0' : '0.9'}</priority>`,
      alternates,
      '  </url>',
    ].join('\n'),
  );

  const dataUrls = [
    { loc: '/llms.txt', priority: '0.8' },
    { loc: '/llms-full.txt', priority: '0.8' },
    { loc: '/assets/data/resume.json', priority: '0.9' },
    { loc: '/assets/data/resume.xml', priority: '0.7' },
    ...LANGS.map((l) => ({
      loc: `/assets/cv/cv_grosjean_baptiste_${l}.pdf`,
      priority: '0.7',
    })),
  ].map((u) =>
    [
      '  <url>',
      `    <loc>${SITE_URL}${u.loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>monthly</changefreq>',
      `    <priority>${u.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...langBlocks,
    ...dataUrls,
    '</urlset>',
    '',
  ].join('\n');
}

module.exports = { generateSitemap };

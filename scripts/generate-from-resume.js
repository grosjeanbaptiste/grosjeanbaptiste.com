#!/usr/bin/env node
/**
 * Regenerates the six language variants of index.html, the XML mirrors of
 * resume.json, and the sitemap from the canonical resume.json + i18n overlays.
 *
 * Module layout (each file ≤ 200 lines, see scripts/check-line-count.js):
 *   scripts/lib/config.js           — paths, SITE_URL, LANGS, langPath
 *   scripts/lib/markers.js          — MARKERS table + replaceBetween
 *   scripts/lib/format.js           — escape, date/time formatters
 *   scripts/lib/profiles.js         — profile-network icons
 *   scripts/lib/degrees.js          — degree ranking + display
 *   scripts/lib/data.js             — deepMerge + loadResume
 *   scripts/lib/i18n/{lang}.js      — per-language strings
 *   scripts/lib/xml.js              — JSON → XML emitter
 *   scripts/lib/sections/*.js       — one file per marker
 *
 * Usage (from repo root): node scripts/generate-from-resume.js
 */
const fs = require('node:fs');
const path = require('node:path');

const { ROOT, TEMPLATE_PATH, LANGS, langOutFile } = require('./lib/config');
const { MARKERS, replaceBetween } = require('./lib/markers');
const { loadResume } = require('./lib/data');
const { applyHtmlOverrides } = require('./lib/site-overrides');
const { generateHead } = require('./lib/sections/head');
const { generateNav } = require('./lib/sections/nav');
const { generateSidebar } = require('./lib/sections/sidebar');
const { generateMain } = require('./lib/sections/main');
const { generateCvDownload } = require('./lib/sections/cv-download');
const { generateDailyLife } = require('./lib/sections/daily-life');
const { generateSitemap } = require('./lib/sections/sitemap');
const { generateXml } = require('./lib/xml');

function writeIfChanged(filePath, content) {
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (previous === content) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

// Always read the template from the canonical EN file on disk; markers match
// regardless of which language was generated into it last.
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
let wrote = 0;

for (const lang of LANGS) {
  // HTML consumers see the resume with site-overrides applied (hidden entries
  // removed, display fields patched). XML/JSON stay canonical below.
  const resume = applyHtmlOverrides(loadResume(lang));
  let html = template.replace(/<html\s+lang="[^"]*">/, `<html lang="${lang}">`);
  html = replaceBetween(html, MARKERS['LLM-HEAD'], generateHead(resume, lang));
  html = replaceBetween(html, MARKERS.NAV, generateNav(lang));
  html = replaceBetween(html, MARKERS['BODY-SIDEBAR'], generateSidebar(resume, lang));
  html = replaceBetween(html, MARKERS['BODY-MAIN'], generateMain(resume, lang));
  html = replaceBetween(html, MARKERS['CV-DOWNLOAD'], generateCvDownload(lang));
  html = replaceBetween(html, MARKERS['DAILY-LIFE'], generateDailyLife(resume, lang));

  const outPath = langOutFile(lang);
  if (writeIfChanged(outPath, html)) wrote += 1;
  console.log(`${lang}: ${path.relative(ROOT, outPath)}`);
}

// XML mirrors: one per language × 2 themes, plus EN defaults
// (resume.xml / resume-minimal.xml) for backwards-compatible links.
// Firefox caches XSLT stylesheets very aggressively — bypass the
// disk cache by suffixing the href with a short content hash so the
// URL changes whenever the XSLT does.
const crypto = require('node:crypto');
const xsltHash = (rel) =>
  crypto
    .createHash('sha1')
    .update(fs.readFileSync(path.join(ROOT, 'assets/xslt', path.basename(rel))))
    .digest('hex')
    .slice(0, 8);
const RICH = `../xslt/resume-transform.xsl?h=${xsltHash('resume-transform.xsl')}`;
const MINIMAL = `../xslt/resume-transform-minimal.xsl?h=${xsltHash('resume-transform-minimal.xsl')}`;
const xmlOutputs = [
  { file: 'resume.xml', theme: RICH, lang: 'en' },
  { file: 'resume-minimal.xml', theme: MINIMAL, lang: 'en' },
];
for (const lang of LANGS) {
  xmlOutputs.push({ file: `resume-${lang}.xml`, theme: RICH, lang });
  xmlOutputs.push({ file: `resume-${lang}-minimal.xml`, theme: MINIMAL, lang });
}
for (const v of xmlOutputs) {
  const xmlPath = path.join(ROOT, 'assets/data', v.file);
  // The XSLT-rendered XML view is a "web" view of the CV — apply the
  // same HTML overrides (hide entries + display patches) that the
  // static HTML consumers see so both stay in sync.
  const xmlResume = applyHtmlOverrides(loadResume(v.lang));
  if (writeIfChanged(xmlPath, generateXml(xmlResume, v.theme, v.lang))) wrote += 1;
}
console.log(`xml: assets/data/resume{,-minimal,-<lang>{,-minimal}}.xml × ${xmlOutputs.length}`);

if (writeIfChanged(path.join(ROOT, 'sitemap.xml'), generateSitemap())) wrote += 1;
console.log('sitemap: sitemap.xml');

// Brand tokens live in the DSL — sync the static files that hard-code them:
// the SVG favicon (bordeaux rounded square), the PWA manifest (theme_color), and
// css/variables.css (whole CSS var block, both themes).
const brand = loadResume('en').meta?.brand;
if (brand?.primary) {
  const svgPath = path.join(ROOT, 'assets/icons/favicon.svg');
  const svg = fs
    .readFileSync(svgPath, 'utf8')
    .replace(/(<rect[^>]*fill=")#[0-9A-Fa-f]{3,8}(")/, `$1${brand.primary}$2`);
  if (writeIfChanged(svgPath, svg)) wrote += 1;

  const manifestPath = path.join(ROOT, 'manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.theme_color !== brand.primary) {
    manifest.theme_color = brand.primary;
    if (writeIfChanged(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)) wrote += 1;
  }

  const hexToRgb = (h) => {
    const m = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(h);
    if (!m) return null;
    return `${Number.parseInt(m[1], 16)}, ${Number.parseInt(m[2], 16)}, ${Number.parseInt(m[3], 16)}`;
  };
  const b = brand;
  const varsCss = [
    '/* Auto-generated from dsl/resume.grosjean meta.brand. Do not hand-edit. */',
    '/* Default light theme */',
    ':root {',
    '  /* Colors */',
    `  --primary-color: ${b.primary}; /* Bordeaux */`,
    `  --secondary-color: ${b.siteSecondary}; /* Rouge */`,
    `  --third-color: ${b.accent.toLowerCase()}; /* Orange foncé */`,
    `  --body-color: ${b.siteBody}; /* Gris foncé */`,
    `  --emphasis-color: ${b.siteEmphasis}; /* Gris très foncé */`,
    `  --background-color: ${b.siteBg}; /* Gris clair */`,
    `  --card-background: ${b.siteCard}; /* White for cards */`,
    `  --text-color: ${b.siteEmphasis}; /* Dark text */`,
    `  --border-color: ${b.siteBorder}; /* Light border */`,
    `  --primary-color-rgb: ${hexToRgb(b.primary)}; /* RGB for primary color in light mode */`,
    `  --card-background-rgb: ${hexToRgb(b.siteCard)}; /* RGB for card background in light mode */`,
    '}',
    '',
    '/* Dark theme */',
    '[data-theme="dark"] {',
    `  --primary-color: ${b.sitePrimaryDark}; /* Lighter red for better visibility */`,
    `  --secondary-color: ${b.siteSecondaryDark}; /* Softer red */`,
    `  --third-color: ${b.siteAccentDark}; /* Lighter orange */`,
    `  --body-color: ${b.siteBodyDark}; /* Lighter gray for better readability */`,
    `  --emphasis-color: ${b.siteEmphasisDark}; /* Light gray for emphasis */`,
    `  --background-color: ${b.darkBg}; /* Dark background */`,
    `  --card-background: ${b.siteCardDark}; /* Slightly lighter than background */`,
    `  --text-color: ${b.siteEmphasisDark}; /* Light text */`,
    `  --border-color: ${b.siteBorderDark}; /* Dark border */`,
    `  --primary-color-rgb: ${hexToRgb(b.sitePrimaryDark)}; /* RGB for primary color in dark mode */`,
    `  --card-background-rgb: ${hexToRgb(b.siteCardDark)}; /* RGB for card background in dark mode */`,
    '}',
    '',
    '/* System preference for dark mode */',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    `    --primary-color: ${b.sitePrimaryDark};`,
    `    --secondary-color: ${b.siteSecondaryDark};`,
    `    --third-color: ${b.siteAccentDark};`,
    `    --body-color: ${b.siteBodyDark};`,
    `    --emphasis-color: ${b.siteEmphasisDark};`,
    `    --background-color: ${b.darkBg};`,
    `    --card-background: ${b.siteCardDark};`,
    `    --text-color: ${b.siteEmphasisDark};`,
    `    --border-color: ${b.siteBorderDark};`,
    '  }',
    '}',
    '',
  ].join('\n');
  const varsPath = path.join(ROOT, 'css/variables.css');
  if (writeIfChanged(varsPath, varsCss)) wrote += 1;
}

console.log(`generate-from-resume: ${wrote} file(s) updated`);

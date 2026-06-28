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
  const resume = loadResume(lang);
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
const RICH = '../xslt/resume-transform.xsl';
const MINIMAL = '../xslt/resume-transform-minimal.xsl';
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
  if (writeIfChanged(xmlPath, generateXml(loadResume(v.lang), v.theme, v.lang))) wrote += 1;
}
console.log(`xml: assets/data/resume{,-minimal,-<lang>{,-minimal}}.xml × ${xmlOutputs.length}`);

if (writeIfChanged(path.join(ROOT, 'sitemap.xml'), generateSitemap())) wrote += 1;
console.log('sitemap: sitemap.xml');

console.log(`generate-from-resume: ${wrote} file(s) updated`);

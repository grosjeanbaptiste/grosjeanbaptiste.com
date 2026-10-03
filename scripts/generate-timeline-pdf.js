#!/usr/bin/env node
/**
 * Render and compile assets/cv/cv_grosjean_baptiste_timeline_<lang>.pdf for
 * every language: the CV's timeline alone, on one A4 landscape page, next to
 * the vertical CV that scripts/generate-pdf.js builds. Same data, same class,
 * same palette (scripts/lib/pdf/timeline/).
 *
 * Run from the repo root: node scripts/generate-timeline-pdf.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, OUTPUT_DIR, LANGS } = require('./lib/pdf/config');
const { loadResume } = require('./lib/pdf/data');
const { applyPdfOverrides } = require('./lib/site-overrides');
const { compileTimeline } = require('./lib/pdf/timeline/compile');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const failed = [];
for (const lang of LANGS) {
  const outPath = path.join(OUTPUT_DIR, `cv_grosjean_baptiste_timeline_${lang}.pdf`);
  const result = compileTimeline(applyPdfOverrides(loadResume(lang)), lang, outPath);
  if (result.ok) console.log(`${lang}: ${path.relative(ROOT, outPath)}`);
  else failed.push(lang);
}
console.log(
  `generate-timeline-pdf: ${LANGS.length - failed.length}/${LANGS.length} compiled successfully`,
);
if (failed.length) {
  console.error(`failed: ${failed.join(', ')}`);
  process.exit(1);
}

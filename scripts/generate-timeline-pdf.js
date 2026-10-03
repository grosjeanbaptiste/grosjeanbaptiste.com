#!/usr/bin/env node
/**
 * Render and compile, for every language, the CV's timeline alone on one A4
 * landscape page, next to the vertical CV that scripts/generate-pdf.js builds:
 *   assets/cv/cv_grosjean_baptiste_timeline_<lang>.pdf     — the whole career
 *   assets/cv/cv_grosjean_baptiste_timeline_5y_<lang>.pdf  — the last five years
 *   assets/cv/cv_grosjean_baptiste_timeline_2y_<lang>.pdf  — the last two years
 * Same data, same class, same palette (scripts/lib/pdf/timeline/).
 *
 * Run from the repo root: node scripts/generate-timeline-pdf.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, OUTPUT_DIR, LANGS } = require('./lib/pdf/config');
const { loadResume } = require('./lib/pdf/data');
const { applyPdfOverrides } = require('./lib/site-overrides');
const { compileTimeline } = require('./lib/pdf/timeline/compile');
const { SPANS, timelineFile } = require('./lib/pdf/timeline/spans');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const failed = [];
const today = new Date();
for (const lang of LANGS) {
  const resume = applyPdfOverrides(loadResume(lang));
  for (const span of SPANS) {
    const outPath = path.join(OUTPUT_DIR, timelineFile(lang, span));
    if (compileTimeline(resume, lang, outPath, today, span.years).ok) {
      console.log(`${lang}: ${path.relative(ROOT, outPath)}`);
    } else {
      failed.push(timelineFile(lang, span));
    }
  }
}
const total = LANGS.length * SPANS.length;
console.log(`generate-timeline-pdf: ${total - failed.length}/${total} compiled successfully`);
if (failed.length) {
  console.error(`failed: ${failed.join(', ')}`);
  process.exit(1);
}

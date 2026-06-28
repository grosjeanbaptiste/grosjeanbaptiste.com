#!/usr/bin/env node
/**
 * Render and compile assets/cv/cv_grosjean_baptiste_<lang>.pdf for every
 * language from assets/data/resume.json + i18n overlays, using the altacv
 * LaTeX class shipped in latex/altacv.cls.
 *
 * Pure stdlib Node (no external deps). pdflatex/xelatex on PATH required.
 *
 * Module layout (each file ≤ 200 lines):
 *   scripts/lib/pdf/config.js          — paths, LANGS, BABEL, FIT_PLANS
 *   scripts/lib/pdf/i18n.js            — per-language PDF strings
 *   scripts/lib/pdf/tex.js             — TeX escaping, dates, truncation
 *   scripts/lib/pdf/data.js            — loadResume + topN/findProject
 *   scripts/lib/pdf/preamble.js        — LaTeX preamble (fonts, colours)
 *   scripts/lib/pdf/sections/*.js      — one file per CV block
 *   scripts/lib/pdf/document.js        — assembles preamble + sections
 *   scripts/lib/pdf/compile.js         — pdflatex driver + fit loop
 *
 * Run from the repo root: node scripts/generate-pdf.js
 */
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, OUTPUT_DIR, LANGS } = require('./lib/pdf/config');
const { loadResume } = require('./lib/pdf/data');
const { compileWithFit } = require('./lib/pdf/compile');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let ok = 0;
const failed = [];
for (const lang of LANGS) {
  const resume = loadResume(lang);
  const outPath = path.join(OUTPUT_DIR, `cv_grosjean_baptiste_${lang}.pdf`);
  const result = compileWithFit(resume, lang, outPath);
  if (result.ok) {
    console.log(
      `${lang}: ${path.relative(ROOT, outPath)} (plan ${result.plan}, ${result.pages} pages)`,
    );
    ok += 1;
  } else {
    failed.push(lang);
  }
}
console.log(`generate-pdf: ${ok}/${LANGS.length} compiled successfully`);
if (failed.length) {
  console.error(`failed: ${failed.join(', ')}`);
  process.exit(1);
}

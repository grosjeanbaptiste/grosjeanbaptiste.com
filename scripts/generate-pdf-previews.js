#!/usr/bin/env node
/**
 * Pictures of every page of every shipped PDF (assets/cv/*.pdf) into
 * assets/cv/previews/, with manifest.json tying each to its PDF by SHA-256.
 * The PDF reader shows them at once and swaps in PDF.js's rendering when it is
 * drawn. Run after building the PDFs (`npm run pdf` does). Needs poppler
 * (pdftoppm, pdfinfo) and cwebp.
 */
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, OUTPUT_DIR } = require('./lib/pdf/config');
const { renderPreviews } = require('./lib/pdf/previews');

const outDir = path.join(OUTPUT_DIR, 'previews');
fs.mkdirSync(outDir, { recursive: true });

const files = {};
const pdfs = fs
  .readdirSync(OUTPUT_DIR)
  .filter((f) => /^cv_grosjean_baptiste_.*\.pdf$/.test(f))
  .sort();
for (const name of pdfs) {
  files[name] = renderPreviews(path.join(OUTPUT_DIR, name), outDir, ROOT);
  console.log(`${name}: ${files[name].pages.length} page(s)`);
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify({ files }, null, 2)}\n`);
console.log(`generate-pdf-previews: ${pdfs.length} PDF(s) → ${path.relative(ROOT, outDir)}`);

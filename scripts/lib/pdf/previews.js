// Pictures of a PDF's pages, for the reader to show while PDF.js loads and
// draws the real thing: poppler renders each page, cwebp compresses it. The
// manifest ties every picture to its PDF by SHA-256 (pdf-previews.test.js).
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { webpSize } = require('../webp-size');

const WIDTH = 1000; // px: a phone's width at 2.5x, half a desktop reader
const QUALITY = 60; // text stays crisp, a CV page weighs ~110 kB

const run = (tool, args) => {
  try {
    return execFileSync(tool, args, { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    throw new Error(
      `${tool} failed on ${args.at(-2) ?? args.at(-1)}: ${err.stderr || err.message}`,
    );
  }
};

const pageCount = (pdf) => Number(/^Pages:\s+(\d+)/m.exec(run('pdfinfo', [pdf]))[1]);

// Renders one PDF; returns its manifest entry. `root` is the site root, so
// each picture's src is the path the site serves it at.
function renderPreviews(pdf, outDir, root) {
  const base = path.basename(pdf, '.pdf');
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-'));
  try {
    run('pdftoppm', [
      '-r',
      '300',
      '-scale-to-x',
      String(WIDTH),
      '-scale-to-y',
      '-1',
      '-png',
      pdf,
      path.join(work, 'p'),
    ]);
    const pngs = fs
      .readdirSync(work)
      .filter((f) => f.endsWith('.png'))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    if (pngs.length !== pageCount(pdf))
      throw new Error(`${pdf}: rendered ${pngs.length} pages of ${pageCount(pdf)}`);
    const pages = pngs.map((png, i) => {
      const out = path.join(outDir, `${base}-${i + 1}.webp`);
      run('cwebp', ['-quiet', '-q', String(QUALITY), path.join(work, png), '-o', out]);
      return { src: path.relative(root, out), ...webpSize(fs.readFileSync(out)) };
    });
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');
    return { sha256, pages };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

module.exports = { renderPreviews };

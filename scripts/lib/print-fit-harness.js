// Shared plumbing for the two print-fit tests: a static server for the site and
// a page count, so the Chrome and Firefox checks measure the same thing.

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '../..');
const EXPECTED_PAGES = 2;

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
};

/**
 * Serve the site. A /__print/ prefix returns the same page with a script that
 * calls print() — Firefox exposes no --print-to-pdf, so the page must ask.
 */
function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    const autoprint = rel.startsWith('/__print');
    if (autoprint) rel = rel.slice('/__print'.length) || '/';
    let file = path.join(ROOT, rel);
    if (rel.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    if (autoprint) {
      const html = fs
        .readFileSync(file, 'utf8')
        .replace(
          '</body>',
          '<script>addEventListener("load",()=>setTimeout(()=>print(),2000));</script></body>',
        );
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/**
 * Page count of a PDF.
 *
 * Scanning for "/Type /Page" only works while the page objects sit in the file
 * as plain text. Firefox packs them into compressed object streams, where the
 * scan finds nothing and reports zero — which reads like a catastrophic layout
 * failure and is merely an unreadable file. So parse it properly with pdfinfo,
 * and fall back to the scan only when poppler is absent, refusing to return a
 * zero it cannot justify.
 */
function countPages(pdf) {
  try {
    const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8', stdio: 'pipe' });
    const m = /^Pages:\s*(\d+)/m.exec(info);
    if (m) return Number.parseInt(m[1], 10);
  } catch {
    // poppler not installed — fall through to the scan below.
  }
  const bytes = fs.readFileSync(pdf, 'latin1');
  const scanned = (bytes.match(/\/Type\s*\/Page\b/g) || []).length;
  if (scanned === 0) {
    throw new Error(
      `cannot count the pages of ${path.basename(pdf)}: pdfinfo is unavailable and the page objects are not in plain text (install poppler-utils)`,
    );
  }
  return scanned;
}

module.exports = { serve, countPages, EXPECTED_PAGES, ROOT };

// Shared plumbing for the two print-fit tests: a static server for the site and
// a page count, so the Chrome and Firefox checks measure the same thing.

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

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

// /Type /Page marks a page object; /Type /Pages is the tree root and the \b
// keeps it out. Cheaper than shelling out to pdfinfo, which is not always there.
function countPages(pdf) {
  const bytes = fs.readFileSync(pdf, 'latin1');
  return (bytes.match(/\/Type\s*\/Page\b/g) || []).length;
}

module.exports = { serve, countPages, EXPECTED_PAGES, ROOT };

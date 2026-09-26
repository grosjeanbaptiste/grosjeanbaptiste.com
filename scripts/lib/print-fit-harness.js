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
/**
 * The rich XSLT theme, rendered for one language. Served from the site root so
 * its stylesheets, fonts and images resolve exactly as they do online — over
 * file:// they would not, and the fonts would silently fall back to metrics
 * that are not the ones being measured.
 */
function renderXslt(lang) {
  const xsl = path.join(ROOT, 'assets/xslt/resume-transform.xsl');
  const xml = path.join(ROOT, `assets/data/resume-${lang}.xml`);
  return execFileSync('xsltproc', [xsl, xml], { encoding: 'utf8', maxBuffer: 1 << 24 });
}

// Ask the page to print itself once the webfonts have landed. Printing before
// they do measures the fallback's metrics, and the sheet count then varies run
// to run. Firefox exposes no --print-to-pdf, so the page must ask.
const autoprintScript = (delay) =>
  `<script>addEventListener("load",()=>(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(()=>print(),${delay})));</script>`;

// /__print/<page> prints itself; /__probe/<page> gets the caller's script in
// its <head>. Head, not body: a probe that reads document.body.innerHTML would
// otherwise find its own source there and diff the page against itself.
const MODES = { '/__print': 'print', '/__probe': 'probe' };

function route(rel) {
  for (const [prefix, mode] of Object.entries(MODES)) {
    if (rel.startsWith(prefix)) return { rel: rel.slice(prefix.length) || '/', mode };
  }
  return { rel, mode: 'static' };
}

function sendHtml(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

const injected = (file, anchor, script) =>
  fs.readFileSync(file, 'utf8').replace(anchor, `${script}${anchor}`);

/** Serve the site. `headScript` enables the /__probe/ prefix described above. */
function serve(headScript) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const xslt = /^\/__xslt\/([a-z-]+)$/.exec(url);
    if (xslt) {
      // Before </body>, as it was: a script after the document is tolerated
      // but is not what this path has been measuring.
      sendHtml(res, renderXslt(xslt[1]).replace('</body>', `${autoprintScript(800)}</body>`));
      return;
    }
    const { rel, mode } = route(url);
    let file = path.join(ROOT, rel);
    if (rel.endsWith('/')) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    if (mode === 'probe' && headScript) {
      sendHtml(res, injected(file, '</head>', headScript));
      return;
    }
    if (mode === 'print') {
      sendHtml(res, injected(file, '</body>', autoprintScript(750)));
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

/**
 * First line of text on each page, for a failure message worth reading: a page
 * count alone says the layout broke, not where it went.
 */
function pageHeads(pdf, pages) {
  const heads = [];
  for (let i = 1; i <= pages; i += 1) {
    try {
      const text = execFileSync('pdftotext', ['-f', `${i}`, '-l', `${i}`, pdf, '-'], {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      const first = text.split('\n').find((l) => l.trim()) || '(empty)';
      heads.push(`p${i}: ${first.trim().slice(0, 40)}`);
    } catch {
      heads.push(`p${i}: ?`);
    }
  }
  return heads.join(' | ');
}

module.exports = { serve, countPages, pageHeads, renderXslt, EXPECTED_PAGES, ROOT };

// What the XSLT themes' PDF reader draws with and how it behaves on screen,
// apart from its markup (xslt-pdf-reader.test.js): the vendored engines, the
// toolbar that stays in view, the wheel moving the pages sideways.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT } = require('./config');

const render = (lang) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, 'assets/xslt/resume-transform.xsl'),
      path.join(ROOT, `assets/data/resume-${lang}.xml`),
    ],
    { encoding: 'utf8' },
  );

test('the reader draws with the PDF.js files it ships, from the path the markup names', () => {
  const html = render('en');
  const dir = html.match(/<section id="pdf" data-pdfjs="([^"]+)"/)[1];
  assert.ok(
    fs.existsSync(path.join(ROOT, html.match(/data-pdflib="([^"]+)"/)[1])),
    'pdf-lib missing',
  );
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs', 'pdf_viewer.mjs', 'pdf_viewer.css'])
    assert.ok(fs.existsSync(path.join(ROOT, dir, file)), `${dir}${file} is missing`);
  assert.match(html, /<script type="module" src="\/js\/xslt-pdf-reader\.js"/);
  assert.match(html, /<link[^>]*href="\/css\/pdf-reader\.css"/);
});

// GitHub Pages runs the repository through Jekyll, which drops every path that
// starts with an underscore (assets/_vendor/ was a 404 online): .nojekyll turns
// that off, and the reader's engine is only served with it.
test('the vendored PDF.js is published: .nojekyll is there', () => {
  assert.ok(fs.existsSync(path.join(ROOT, '.nojekyll')));
});

test('the toolbar stays on screen while a zoomed page grows the frame', () => {
  const css = fs.readFileSync('css/pdf-reader.css', 'utf8');
  assert.match(css, /\.pdf-toolbar \{[^}]*position: sticky/);
});

test('the reader maps the vertical wheel to its sideways scroll, in both readers', () => {
  for (const file of ['js/xslt-pdf-parts.js', 'react/src/infrastructure/pdfjs-renderer.ts']) {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
    assert.match(src, /addEventListener\(\s*'wheel'/, `${file} has no wheel handler`);
    assert.match(src, /scrollLeft/, `${file} never moves the pages sideways`);
  }
});

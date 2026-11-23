// The XSLT themes' PDF reader is plain markup, written by the stylesheet from
// the XML: one <details class="pdf-reader"> that is told which PDF to show (the
// CV, or the timeline at three zooms, chosen with buttons), holding the CV in an
// <object> so the browser's own viewer zooms and downloads it. With
// js/xslt-pdf-reader.js it is drawn by PDF.js instead (assets/_vendor/pdfjs),
// with the interactive view's zoom, and the choice swaps the PDF; the sheet
// leaves it out of print.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');

const render = (lang) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, 'assets/xslt/resume-transform.xsl'),
      path.join(ROOT, `assets/data/resume-${lang}.xml`),
    ],
    { encoding: 'utf8' },
  );
const xml = (lang) => fs.readFileSync(path.join(ROOT, `assets/data/resume-${lang}.xml`), 'utf8');
const tag = (src, name) => (src.match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1];

// The reader's choices: { summary, file } each, in the order the buttons list them.
const choices = (html) =>
  [
    ...html.matchAll(
      /<button type="button" data-file="([^"]+)" data-download="[^"]*" aria-pressed="[a-z]+">\s*([^<]*?)\s*<\/button>/g,
    ),
  ].map((m) => ({ file: m[1], summary: m[2].trim() }));
// What the reader shows before any choice: the <object>'s file.
const shown = (html) => html.match(/<object[^>]*\sdata="([^"]+)"/)[1];

for (const lang of LANGS) {
  const html = render(lang);
  const src = xml(lang);
  const found = choices(html);
  const timeline = src.match(/<pdf>[\s\S]*?<\/pdf>/)[0];

  test(`${lang}: one reader, with the CV and the timeline at three zooms to choose from`, () => {
    assert.equal(html.match(/<details class="pdf-reader"/g).length, 1);
    assert.equal(html.match(/<object /g).length, 1);
    assert.deepEqual(
      found.map((p) => p.file),
      [
        `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`,
        tag(timeline, 'two'),
        tag(timeline, 'five'),
        tag(timeline, 'all'),
      ],
    );
    assert.equal(shown(html), found[0].file);
    assert.ok(html.includes(`<details class="pdf-reader" data-file="${found[0].file}"`));
  });

  test(`${lang}: each choice is a PDF that is shipped`, () => {
    for (const { file } of found)
      assert.ok(fs.existsSync(path.join(ROOT, file.replace(/^\//, ''))), `${file} is missing`);
  });

  test(`${lang}: the choices read as the page words them`, () => {
    const zooms = [
      ...src.matchAll(/<zoom>\s*<years>[^<]+<\/years>\s*<label>([^<]*)<\/label>/g),
    ].map((m) => m[1]);
    assert.equal(zooms.length, 3);
    const label = tag(timeline, 'label');
    assert.equal(found[1].summary, `${label} · ${zooms[0]}`);
    assert.equal(found[2].summary, `${label} · ${zooms[1]}`);
    assert.equal(found[3].summary, `${label} · ${zooms[2]}`);
    assert.ok(found[0].summary.length > 0);
    assert.equal(html.match(/aria-pressed="true"/g).length, 1, 'one choice is marked');
  });

  test(`${lang}: a reader with no script has the CV and a link to each other PDF`, () => {
    assert.ok(html.includes(`<a href="${found[0].file}"`), 'no link to the CV');
    for (const { file } of found.slice(1)) assert.ok(html.includes(`<li><a href="${file}"`), file);
  });

  test(`${lang}: it is a section the views bar can point at, and is left out of print`, () => {
    assert.match(html, /<section id="pdf"/);
    assert.match(html, /@media print\s*\{[^}]*#pdf[^}]*display:\s*none/);
  });

  test(`${lang}: the engine is the site's own`, () => {
    assert.doesNotMatch(html, /pdf-preview-reader|cv-reader-view|name="cv-reader"/);
    assert.match(html, /data-pdfjs="\/assets\/_vendor\/pdfjs\/"/);
  });
}

for (const lang of LANGS) {
  test(`${lang}: where a browser cannot show a PDF, its pages are pictures that exist`, () => {
    const html = render(lang);
    const pictures = [
      ...html.matchAll(/<a class="pdf-page" href="[^"]+"><img[^>]* src="([^"]+)"/g),
    ];
    // The CV's two sheets: the reader shows the CV until it is told otherwise.
    assert.equal(pictures.length, 2);
    for (const [, src] of pictures) assert.ok(fs.existsSync(path.join(ROOT, src)), `no ${src}`);
  });
}

// The minimal theme reads the PDFs the same way: the same panels, the same
// pictures, and none of it on paper.
for (const lang of LANGS) {
  test(`${lang}: the minimal theme has the same reader`, () => {
    const minimal = execFileSync(
      'xsltproc',
      [
        path.join(ROOT, 'assets/xslt/resume-transform-minimal.xsl'),
        path.join(ROOT, `assets/data/resume-${lang}-minimal.xml`),
      ],
      { encoding: 'utf8' },
    );
    assert.deepEqual(choices(minimal), choices(render(lang)));
    assert.equal(minimal.match(/class="pdf-page"/g).length, 2);
    assert.match(minimal, /@media print \{ #pdf \{ display: none; \} \}/);
  });
}

test('the reader draws with the PDF.js files it ships, from the path the markup names', () => {
  const html = render('en');
  const dir = html.match(/<section id="pdf" data-pdfjs="([^"]+)"/)[1];
  for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs', 'pdf_viewer.mjs', 'pdf_viewer.css'])
    assert.ok(fs.existsSync(path.join(ROOT, dir, file)), `${dir}${file} is missing`);
  assert.match(html, /<script src="\/js\/xslt-pdf-reader\.js"/);
  assert.match(html, /<link[^>]*href="\/css\/pdf-reader\.css"/);
});

for (const lang of LANGS) {
  test(`${lang}: the reader has a toolbar worded as the interactive view words it`, () => {
    const html = render(lang);
    const words = (name) => tag(xml(lang), name);
    assert.equal(html.match(/<div class="pdf-toolbar" hidden="hidden">/g).length, 1);
    for (const name of [
      'zoomIn',
      'zoomOut',
      'fitWidth',
      'openFile',
      'failed',
      'pageOne',
      'pageMany',
      'downloadCV',
      'downloadTimeline',
    ])
      assert.ok(words(name), `meta/pdfReader/${name} is empty`);
    assert.ok(html.includes(`aria-label="${words('zoomIn')}"`));
    assert.equal(html.match(/<a class="pdf-download" download="download"/g).length, 1);
    assert.ok(html.includes(`>${words('downloadCV')}</a>`));
    assert.equal(html.match(/class="pdf-pages"/g).length, 1);
    assert.ok(html.includes(`data-download="${words('downloadTimeline')}"`));
  });
}

// GitHub Pages runs the repository through Jekyll, which drops every path that
// starts with an underscore (assets/_vendor/ was a 404 online): .nojekyll turns
// that off, and the reader's engine is only served with it.
test('the vendored PDF.js is published: .nojekyll is there', () => {
  assert.ok(fs.existsSync(path.join(ROOT, '.nojekyll')));
});

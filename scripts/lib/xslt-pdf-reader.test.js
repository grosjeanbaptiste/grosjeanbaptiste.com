// The rich XSLT theme's PDF reader is plain markup, written by the stylesheet
// from the XML: one <details name="cv-reader"> per PDF — the browser keeps one
// of a named group open, which is all the tabs there are — each holding the PDF
// in an <object>, so the browser's own viewer zooms and downloads it. With
// js/xslt-pdf-reader.js a panel is drawn by PDF.js instead (assets/_vendor/pdfjs),
// with the interactive view's zoom; the sheet leaves it out of print.
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

// The reader's panels: { summary, data } each, in page order.
const panels = (html) =>
  [
    ...html.matchAll(
      /<details name="cv-reader"[^>]*>\s*<summary>([^<]*)<\/summary>[\s\S]*?<object[^>]*\sdata="([^"]+)"/g,
    ),
  ].map((m) => ({ summary: m[1].trim(), data: m[2] }));

for (const lang of LANGS) {
  const html = render(lang);
  const src = xml(lang);
  const found = panels(html);
  const timeline = src.match(/<pdf>[\s\S]*?<\/pdf>/)[0];

  test(`${lang}: the reader has four panels, the CV and the timeline at three zooms`, () => {
    assert.deepEqual(
      found.map((p) => p.data),
      [
        `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`,
        tag(timeline, 'two'),
        tag(timeline, 'five'),
        tag(timeline, 'all'),
      ],
    );
  });

  test(`${lang}: each panel shows a PDF that is shipped`, () => {
    for (const { data } of found)
      assert.ok(fs.existsSync(path.join(ROOT, data.replace(/^\//, ''))), `${data} is missing`);
  });

  test(`${lang}: the tabs read as the page words them`, () => {
    const zooms = [
      ...src.matchAll(/<zoom>\s*<years>[^<]+<\/years>\s*<label>([^<]*)<\/label>/g),
    ].map((m) => m[1]);
    assert.equal(zooms.length, 3);
    const label = tag(timeline, 'label');
    assert.equal(found[1].summary, `${label} · ${zooms[0]}`);
    assert.equal(found[2].summary, `${label} · ${zooms[1]}`);
    assert.equal(found[3].summary, `${label} · ${zooms[2]}`);
    assert.ok(found[0].summary.length > 0);
  });

  test(`${lang}: a reader that cannot show a PDF hands the file over`, () => {
    for (const { data } of found)
      assert.ok(html.includes(`<a href="${data}"`), `no link to ${data}`);
  });

  test(`${lang}: it is a section the views bar can point at, and is left out of print`, () => {
    assert.match(html, /<section id="pdf"/);
    assert.match(html, /@media print\s*\{[^}]*#pdf[^}]*display:\s*none/);
  });

  test(`${lang}: the panel is readable without the script, and the engine is the site's own`, () => {
    assert.equal(found.length, 4);
    assert.doesNotMatch(html, /pdf-preview-reader|cv-reader-view/);
    assert.match(html, /data-pdfjs="\/assets\/_vendor\/pdfjs\/"/);
  });
}

for (const lang of LANGS) {
  test(`${lang}: where a browser cannot show a PDF, its pages are pictures that exist`, () => {
    const html = render(lang);
    const pictures = [
      ...html.matchAll(/<a class="pdf-page" href="[^"]+"><img[^>]* src="([^"]+)"/g),
    ];
    // The CV (two sheets) and the timeline at three zooms (two each).
    assert.equal(pictures.length, 8);
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
    assert.deepEqual(panels(minimal), panels(render(lang)));
    assert.equal(minimal.match(/class="pdf-page"/g).length, 8);
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
  test(`${lang}: each panel has a toolbar worded as the interactive view words it`, () => {
    const html = render(lang);
    const words = (name) => tag(xml(lang), name);
    assert.equal(html.match(/<div class="pdf-toolbar" hidden="hidden">/g).length, 4);
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
    assert.equal(html.match(/<a class="pdf-download" download="download"/g).length, 4);
    assert.ok(html.includes(`>${words('downloadCV')}</a>`));
    assert.equal(html.match(/class="pdf-pages"/g).length, 4);
  });
}

// The XSLT themes' PDF reader is plain markup, written by the stylesheet from
// the XML: one <div class="pdf-reader"> that is told which PDF to show (the
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

// One side of the sheet: its buttons, { summary, file, page, pressed } each, in
// the order they are listed. Both sides offer the same pages.
const side = (html, name) => {
  const group = html.match(
    new RegExp(`<div class="pdf-choice" role="group" data-side="${name}"[\\s\\S]*?</div>`),
  )[0];
  return [
    ...group.matchAll(
      /<button type="button" data-file="([^"]+)" data-page="(\d)" data-download="[^"]*" aria-pressed="([a-z]+)">\s*([^<]*?)\s*<\/button>/g,
    ),
  ].map((m) => ({
    file: m[1],
    page: Number(m[2]),
    pressed: m[3] === 'true',
    summary: m[4].trim(),
  }));
};
const choices = (html) => side(html, 'recto');
// What the reader shows before any choice: the <object>'s file.
const shown = (html) => html.match(/<object[^>]*\sdata="([^"]+)"/)[1];

for (const lang of LANGS) {
  const html = render(lang);
  const src = xml(lang);
  const found = choices(html);
  const timeline = src.match(/<pdf>[\s\S]*?<\/pdf>/)[0];
  const files = [
    `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`,
    tag(timeline, 'two'),
    tag(timeline, 'five'),
    tag(timeline, 'all'),
  ];

  test(`${lang}: one reader, whose recto and verso each take any page of the CV or the timeline`, () => {
    assert.equal(html.match(/<div class="pdf-reader"/g).length, 1);
    assert.equal(html.match(/<object /g).length, 1);
    // Two pages of each of the four PDFs.
    assert.deepEqual(
      found.map((p) => [p.file, p.page]),
      files.flatMap((file) => [
        [file, 1],
        [file, 2],
      ]),
    );
    assert.deepEqual(
      side(html, 'verso'),
      found.map((p, i) => ({ ...p, pressed: i === 1 })),
    );
    // Opened on the CV as shipped: its recto, its verso.
    assert.deepEqual(
      found.map((p) => p.pressed),
      found.map((_, i) => i === 0),
    );
    assert.equal(shown(html), files[0]);
    assert.ok(html.includes(`<div class="pdf-reader" data-file="${files[0]}"`));
    assert.equal(html.match(/aria-pressed="true"/g).length, 2, 'one page is marked per side');
  });

  test(`${lang}: each choice is a PDF that is shipped`, () => {
    for (const file of files)
      assert.ok(fs.existsSync(path.join(ROOT, file.replace(/^\//, ''))), `${file} is missing`);
  });

  test(`${lang}: the choices read as the page words them`, () => {
    const zooms = [
      ...src.matchAll(/<zoom>\s*<years>[^<]+<\/years>\s*<label>([^<]*)<\/label>/g),
    ].map((m) => m[1]);
    assert.equal(zooms.length, 3);
    const label = tag(timeline, 'label');
    zooms.forEach((zoom, i) => {
      assert.equal(found[2 + 2 * i].summary, `${label} · ${zoom} · 1`);
      assert.equal(found[3 + 2 * i].summary, `${label} · ${zoom} · 2`);
    });
    assert.ok(found[0].summary.endsWith(' · 1') && found[1].summary.endsWith(' · 2'));
    assert.ok(html.includes(`<span class="pdf-side">${tag(src, 'recto')}</span>`));
    assert.ok(html.includes(`<span class="pdf-side">${tag(src, 'verso')}</span>`));
  });

  test(`${lang}: a reader with no script has the CV and a link to each other PDF`, () => {
    assert.ok(html.includes(`<a href="${files[0]}"`), 'no link to the CV');
    for (const file of files.slice(1)) assert.ok(html.includes(`<li><a href="${file}"`), file);
  });

  test(`${lang}: it is a section the views bar can point at, and is left out of print`, () => {
    assert.match(html, /<section id="pdf"/);
    assert.match(html, /@media print\s*\{[^}]*#pdf[^}]*display:\s*none/);
  });

  test(`${lang}: the engine is the site's own`, () => {
    assert.doesNotMatch(html, /pdf-preview-reader|cv-reader-view|name="cv-reader"/);
    assert.match(html, /data-pdfjs="\/assets\/_vendor\/pdfjs\/"/);
    assert.match(html, /data-pdflib="\/assets\/_vendor\/pdf-lib\/pdf-lib\.esm\.min\.js"/);
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
      'recto',
      'verso',
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

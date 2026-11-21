// The rich XSLT theme's PDF reader is plain markup, written by the stylesheet
// from the XML: one <details name="cv-reader"> per PDF — the browser keeps one
// of a named group open, which is all the tabs there are — each holding the PDF
// in an <object>, so the browser's own viewer zooms and downloads it. No script
// and no stylesheet of its own; the sheet leaves it out of print.
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
      /<details name="cv-reader"[^>]*>\s*<summary>([^<]*)<\/summary>\s*<object[^>]*\sdata="([^"]+)"/g,
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

  test(`${lang}: it needs no script and no sheet of its own`, () => {
    assert.doesNotMatch(html, /pdf-preview-reader|pdf-reader\.css|cv-reader-view/);
  });
}

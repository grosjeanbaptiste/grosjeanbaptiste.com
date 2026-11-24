// The minimal XSLT theme has what the rich one lets a reader do: the classic
// page's menu to sections that carry its ids, a zoom of radios, the timeline's
// PDFs (the one of the zoom chosen), the entry's panel with its way on to the
// interactive view, and skills that lead into the filter. Rendered from the
// committed XML mirrors with xsltproc, held to the rich theme's own output.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS } = require('./config');

const render = (lang, minimal) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/resume-transform${minimal ? '-minimal' : ''}.xsl`),
      path.join(ROOT, `assets/data/resume-${lang}${minimal ? '-minimal' : ''}.xml`),
    ],
    { encoding: 'utf8' },
  );
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const radios = (html) => all(html, /<input type="radio" name="tl-zoom"[^>]* id="(tl-z-[^"]+)"/g);
const scales = (html) => all(html, /(--stretch: [0-9.]+;)/g);
const pdfZooms = (html) =>
  all(html, /<a class="download" data-timeline-pdf="" download="" data-zoom="([^"]+)"/g);

for (const lang of LANGS) {
  const rich = render(lang, false);
  const minimal = render(lang, true);

  test(`${lang}: the menu leads to the four sections, the timeline and the PDF reader, which carry those ids`, () => {
    const links = all(minimal, /<a class="nav-link" href="#([^"]+)"/g);
    assert.deepEqual(links, all(rich, /<a class="nav-link" href="#([^"]+)"/g));
    assert.equal(links.length, 6);
    for (const id of links) assert.match(minimal, new RegExp(`\\sid="${id}"`), `no #${id}`);
  });

  test(`${lang}: one radio per zoom, the same scales as the rich theme`, () => {
    assert.deepEqual(radios(minimal), radios(rich));
    assert.equal(radios(minimal).length, 3);
    assert.deepEqual(scales(minimal), scales(rich));
    assert.match(minimal, /<link[^>]*href="\/css\/timeline-zoom\.css"/);
  });

  test(`${lang}: the timeline's three PDFs, the one of the zoom chosen on show`, () => {
    assert.deepEqual(pdfZooms(minimal).toSorted(), ['2', '5', 'all']);
    assert.deepEqual(pdfZooms(minimal), pdfZooms(rich));
  });

  test(`${lang}: each entry and each row has a panel with a way out, and none on to another view`, () => {
    const closes = all(minimal, /class="(entry-close)"/g);
    assert.ok(closes.length > 10, `${closes.length} panels`);
    assert.equal(all(minimal, /class="entry-open"/g).length, 0);
    assert.match(minimal, /<link[^>]*href="\/css\/entry-panel\.css"/);
  });

  test(`${lang}: the skills listed lead into the filter`, () => {
    const links = all(minimal, /<a class="skill-tag" href="#skill-([^"]+)"/g);
    assert.ok(links.length > 20, `${links.length} skill links`);
    for (const token of links) assert.match(minimal, new RegExp(`id="skill-${token}"`));
  });
}

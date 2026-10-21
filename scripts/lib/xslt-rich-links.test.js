// What the rich XSLT theme lets a reader do, held to the classic page: the
// same menu, the same links (phone, projects, the timeline's PDFs), the same
// ids on the same entries — so a bar leads where the classic page's bar leads —
// and skills that lead into the filter, counted as the classic page counts
// them. Pure XSLT + CSS: nothing here depends on a script of the theme's own.
// Both pages are rendered from the committed output (fr/index.html, the
// XML mirrors), as the other theme tests do.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, LANGS, langPath } = require('./config');

const render = (lang, minimal = false) =>
  execFileSync(
    'xsltproc',
    [
      path.join(ROOT, `assets/xslt/resume-transform${minimal ? '-minimal' : ''}.xsl`),
      path.join(ROOT, `assets/data/resume-${lang}${minimal ? '-minimal' : ''}.xml`),
    ],
    { encoding: 'utf8' },
  );
const classic = (lang) =>
  fs.readFileSync(path.join(ROOT, `${langPath(lang).replace(/^\//, '')}index.html`), 'utf8');

const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const ids = (html) => new Set(all(html, /\sid="([^"]+)"/g));
// An XSLT processor percent-encodes the letters of an id outside ASCII in an
// href (a role written in Chinese); js/timeline.js reads them decoded.
const barHrefs = (html) =>
  all(html, /<a class="tl-bar"[^>]*href="#([^"]+)"/g).map((id) => decodeURIComponent(id));
const entryIds = (html) =>
  [...ids(html)].filter((id) => /^(project|course|volunteer)-/.test(id)).sort();
// A skill and its count, as each page's filter gives them.
const classicCounts = (html) =>
  new Map(
    [...html.matchAll(/data-skill="([^"]+)"[^>]*>[^<]*<span class="tl-chip-count">(\d+)/g)].map(
      (m) => [m[1].replace(/&amp;/g, '&'), Number(m[2])],
    ),
  );
const themeCounts = (html) =>
  new Map(
    [
      ...html.matchAll(
        /class="tl-chip" href="#skill-[^"]+">([^<]*) <span class="tl-chip-count">(\d+)/g,
      ),
    ].map((m) => [m[1].replace(/&amp;/g, '&'), Number(m[2])]),
  );

for (const lang of LANGS) {
  const rich = render(lang);
  const page = classic(lang);

  test(`${lang}: the menu leads to the four sections, which carry those ids`, () => {
    const links = all(rich, /<a class="nav-link" href="#([^"]+)"/g);
    assert.deepEqual(links, ['about', 'experience', 'education', 'references']);
    for (const id of links) assert.ok(ids(rich).has(id), `no #${id}`);
  });

  test(`${lang}: the phone is a tel: link, as on the classic page`, () => {
    const [tel] = all(page, /href="(tel:[^"]+)"/g);
    assert.ok(tel);
    assert.ok(rich.includes(`href="${tel}"`), `no ${tel}`);
  });

  test(`${lang}: a project row links to its project, as on the classic page`, () => {
    const rows = (html) =>
      new Set(all(html, /<li>\s*<a href="(http[^"]+)" target="_blank" rel="noopener"><strong>/g));
    assert.ok(rows(page).size > 0);
    assert.deepEqual(rows(rich), rows(page));
  });

  test(`${lang}: projects, course units and roles carry the classic page's ids`, () => {
    assert.deepEqual(entryIds(rich), entryIds(page));
  });

  test(`${lang}: every bar leads where the classic page's bar leads`, () => {
    assert.deepEqual(barHrefs(rich), barHrefs(page));
    for (const id of barHrefs(rich)) assert.ok(ids(rich).has(id), `no #${id}`);
  });

  test(`${lang}: a skill on an entry is a link into the filter`, () => {
    const targets = new Set(all(rich, /class="tl-skill-target" id="([^"]+)"/g));
    const links = all(rich, /<a class="skill-tag" href="#([^"]+)"/g);
    assert.ok(links.length > 0);
    for (const id of links) assert.ok(targets.has(id), `#${id} is no filter target`);
    // A project's row names its skills, as on the classic page.
    const count = (html) => all(html, /class="(skill-tags project-skills)"/g).length;
    assert.equal(count(rich), count(page));
  });

  test(`${lang}: the timeline's PDF is offered for each zoom`, () => {
    const pdfs = (html) => all(html, /(data-pdf-(?:2|5|all)="[^"]+")/g).sort();
    assert.equal(pdfs(page).length, 3);
    assert.deepEqual(pdfs(rich), pdfs(page));
    assert.match(rich, /<a [^>]*data-timeline-pdf/);
  });

  test(`${lang}: the filter counts each skill as the classic page does`, () => {
    assert.deepEqual(themeCounts(rich), classicCounts(page));
  });

  test(`${lang}: in the minimal theme every bar still leads to an entry of its page`, () => {
    const minimal = render(lang, true);
    const hrefs = barHrefs(minimal);
    assert.ok(hrefs.length > 0);
    for (const id of hrefs) assert.ok(ids(minimal).has(id), `no #${id}`);
  });
}

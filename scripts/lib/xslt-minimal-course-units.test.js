// The minimal XSLT theme is the third renderer of the CV's data: a degree's
// course units go under their own heading there too, never under "Projects".
// Run with `node --test` (requires `xsltproc` on PATH).
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const XSL = path.join(ROOT, 'assets/xslt/resume-transform-minimal.xsl');

function render(lang) {
  const xml = path.join(ROOT, `assets/data/resume-${lang}-minimal.xml`);
  try {
    return execFileSync('xsltproc', [XSL, xml], { encoding: 'utf8' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        'xsltproc is not installed — it renders the XSLT theme these tests check (apt: xsltproc, brew: libxslt)',
      );
    }
    throw err;
  }
}

// Every list a heading introduces: from the heading to the end of its list.
const lists = (html, heading) =>
  html
    .split(`<div class="muted">${heading}:</div>`)
    .slice(1)
    .map((rest) => rest.slice(0, rest.indexOf('</ul>')));

test('no Projects list of the minimal theme holds a course unit', () => {
  const projects = lists(render('en'), 'Projects');
  assert.ok(projects.length > 0);
  for (const list of projects) assert.doesNotMatch(list, /<strong>Algorithmique<\/strong>/);
});

test('the minimal theme still lists the projects of a degree', () => {
  assert.ok(lists(render('en'), 'Projects').some((l) => l.includes('<strong>Remi</strong>')));
});

test('the minimal theme lists the course units under their own heading', () => {
  const units = lists(render('en'), 'Course units');
  assert.ok(units.some((l) => l.includes('<strong>Algorithmique</strong>')));
});

test('the heading of the course units is translated', () => {
  const units = lists(render('fr'), "Unités d'enseignement");
  assert.ok(units.some((l) => l.includes('<strong>Algorithmique</strong>')));
});

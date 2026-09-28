// Course units must never appear under a "Projects" heading — the rule the JS
// pages already follow. The XSLT theme is the second renderer of the same
// data: it draws its own sidebar and its own embedded lists from the same
// <projects> collection, and it had the defect in both.
// Run with `node --test` (requires `xsltproc` on PATH).

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const XSL = path.join(ROOT, 'assets/xslt/resume-transform.xsl');

function render(lang) {
  const xml = path.join(ROOT, `assets/data/resume-${lang}.xml`);
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

const sidebar = (html) => html.slice(html.indexOf('<aside'), html.indexOf('</aside>'));

// Every block a label heads: from one `<p class="label">` to the next. There
// is one per work and education entry, so scoping to the first would check a
// single job and pass while the degree below still listed its units.
const blocks = (html, label) =>
  [...html.matchAll(/<p class="label">([^<]*)<\/p>/g)]
    .filter((m) => m[1] === label)
    .map((m) => {
      const next = html.indexOf('<p class="label">', m.index + 1);
      return html.slice(m.index, next < 0 ? html.length : next);
    });

test('the XSLT sidebar lists no course unit', () => {
  const aside = sidebar(render('en'));
  assert.doesNotMatch(aside, /<strong>Algorithmique<\/strong>/);
  assert.doesNotMatch(aside, /<strong>Anglais I<\/strong>/);
});

test('the XSLT sidebar still lists the real projects', () => {
  const aside = sidebar(render('en'));
  assert.match(aside, /<strong>Acteble<\/strong>/);
  assert.match(aside, /<strong>Kwalitijd<\/strong>/);
});

test('no XSLT Projects block holds a course unit', () => {
  const html = render('en');
  for (const b of blocks(html, 'Projects')) {
    assert.doesNotMatch(b, /<strong>Algorithmique<\/strong>/);
  }
});

test('the XSLT gives course units their own localized heading', () => {
  for (const [lang, label] of Object.entries({ en: 'Course units', fr: "Unités d'enseignement" })) {
    const found = blocks(render(lang), label);
    assert.ok(found.length, `${lang}: no "${label}" block`);
    assert.match(found.join(''), /<strong>Algorithmique<\/strong>/, `${lang}: unit missing`);
  }
});

test('no XSLT row echoes its own name as its description', () => {
  const echoes = [...render('fr').matchAll(/<strong>([^<]*)<\/strong> — ([^<\n]*)/g)]
    .filter(([, name, desc]) => name.trim() === desc.trim())
    .map(([, name]) => name);
  assert.deepEqual(echoes, []);
});

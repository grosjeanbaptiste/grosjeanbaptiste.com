// The XSLT theme lists a degree's course units year by year, like the classic
// page: under each block — an academic year, with the programme's name for it
// — the units taken then. Run with `node --test` (requires `xsltproc`).
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const html = execFileSync(
  'xsltproc',
  [
    path.join(ROOT, 'assets/xslt/resume-transform.xsl'),
    path.join(ROOT, 'assets/data/resume-fr.xml'),
  ],
  { encoding: 'utf8', maxBuffer: 1 << 26 },
);
const headings = [...html.matchAll(/<p class="embedded-block">([^<]*)<\/p>/g)].map((m) => m[1]);
const under = (heading) => {
  const from = html.indexOf(`<p class="embedded-block">${heading}</p>`);
  const next = html.indexOf('<p class="embedded-block">', from + 1);
  return html.slice(from, next < 0 ? html.indexOf('</div>', from) : next);
};

test('each academic year of the master heads its own list', () => {
  for (const year of ['2022-2023', '2023-2024']) {
    assert.ok(headings.includes(`${year} · Bloc complémentaire`), `${year} is not a heading`);
  }
  assert.ok(headings.includes('2024-2025 · Master 1'));
  assert.ok(headings.includes('2025-2026 · Master 2'));
});

test('a year the programme does not name is headed by the year alone', () => {
  assert.ok(headings.includes('2018-2019'));
});

test('a unit is listed under the year it was taken in', () => {
  assert.match(under('2022-2023 · Bloc complémentaire'), /<strong>Algorithmique<\/strong>/);
  assert.doesNotMatch(under('2022-2023 · Bloc complémentaire'), /<strong>Réseaux<\/strong>/);
  assert.match(under('2023-2024 · Bloc complémentaire'), /<strong>Réseaux<\/strong>/);
});

test('every unit is listed once', () => {
  assert.equal(html.split('<strong>Algorithmique</strong>').length - 1, 1);
});

test('a unit on no block is still listed', () => {
  assert.match(
    html,
    /<strong>Langue en situation appliquée à l'enseignement supérieur UE1<\/strong>/,
  );
});

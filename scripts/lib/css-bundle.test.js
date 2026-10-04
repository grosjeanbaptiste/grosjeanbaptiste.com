// css/style.css lists the page's stylesheets as @imports: a browser fetched
// it, then discovered and fetched nineteen more, all render-blocking — seven
// of them only for print. Measured cold on a slow phone, the first paint
// waited 1.9 s on that chain. The generator now writes the list out as two
// files: css/bundle.css for the screen, css/bundle-print.css loaded with
// media="print", which does not hold the paint. The modules stay the source.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, LANGS, langOutFile } = require('./config');
const { bundlesOf } = require('./css-bundle');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('the screen bundle is the manifest’s screen sheets, in its order', () => {
  const { screen } = bundlesOf(path.join(ROOT, 'css'));
  const order = [
    'fonts.css',
    'variables.css',
    'base.css',
    'main.css',
    'timeline.css',
    'widgets.css',
  ];
  const at = order.map((file) => screen.indexOf(`/* ${file} */`));
  assert.ok(
    at.every((i) => i >= 0),
    `a sheet is missing: ${at}`,
  );
  assert.deepEqual(
    [...at].sort((a, b) => a - b),
    at,
  );
});

test('the print sheets go to the print bundle, not the screen one', () => {
  const { screen, print } = bundlesOf(path.join(ROOT, 'css'));
  assert.ok(print.includes('/* print.css */') && print.includes('/* print-verso.css */'));
  assert.ok(!screen.includes('/* print'));
});

test('no @import is left for the browser to chase', () => {
  const { screen, print } = bundlesOf(path.join(ROOT, 'css'));
  assert.doesNotMatch(screen + print, /@import\s+["u]/);
});

test('every sheet of the manifest lands in one bundle', () => {
  const imports = [...read('css/style.css').matchAll(/@import "([^"]+)";/g)].map((m) => m[1]);
  const { screen, print } = bundlesOf(path.join(ROOT, 'css'));
  for (const file of imports)
    assert.ok((screen + print).includes(`/* ${file} */`), `${file} is in no bundle`);
});

test('a manifest naming a sheet that does not exist fails loudly', () => {
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'css-'));
  fs.writeFileSync(path.join(dir, 'style.css'), '@import "missing.css";\n');
  assert.throws(() => bundlesOf(dir), /missing\.css/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('the committed bundles are the ones the sources give', () => {
  const { screen, print } = bundlesOf(path.join(ROOT, 'css'));
  assert.equal(
    read('css/bundle.css'),
    screen,
    'css/bundle.css is stale: run node scripts/generate-from-resume.js',
  );
  assert.equal(
    read('css/bundle-print.css'),
    print,
    'css/bundle-print.css is stale: run node scripts/generate-from-resume.js',
  );
});

for (const lang of LANGS) {
  test(`${lang}: the page loads one sheet for the screen and the print one without blocking`, () => {
    const page = fs.readFileSync(langOutFile(lang), 'utf8');
    assert.match(page, /<link rel="stylesheet" href="\/css\/bundle\.css">/);
    assert.match(page, /<link rel="stylesheet" href="\/css\/bundle-print\.css" media="print">/);
    assert.doesNotMatch(page, /href="\/css\/style\.css"/);
  });

  test(`${lang}: the page starts on its text font with the HTML`, () => {
    assert.match(
      fs.readFileSync(langOutFile(lang), 'utf8'),
      /<link rel="preload" as="font" type="font\/woff2" href="\/assets\/fonts\/roboto-latin\.woff2" crossorigin>/,
    );
  });
}

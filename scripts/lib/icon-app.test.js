// The home-screen / PWA icon (icon-app.svg, rasterized to favicon-180/192/512).
//
// Aligned with the tab icon: initials only. It is NOT the same file as
// favicon.svg and cannot be, because the two have opposite requirements:
//
//   - The tab icon draws its own rounded square; the OS never touches it.
//   - This one is full-bleed. iOS renders transparency as black and Android
//     crops maskable icons to its own shape, so the colour has to run to every
//     edge and the rounding is the OS's job, not ours.
//
// manifest.webmanifest declares these "any maskable", which means an OS may
// crop to a circle of 80% diameter. Anything outside that circle can be cut
// off, so the label has to fit inside it — a constraint the tab icon does not
// have, and the reason this file's type is sized independently.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
// Comments stripped before matching. The same oversight in
// print-parity.test.js let a colour named only in prose satisfy a check;
// here it is the mirror image — the comment explaining why
// dominant-baseline is avoided would make that assertion fail.
const svg = fs
  .readFileSync(path.join(ROOT, 'assets/icons/icon-app.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, ' ');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));

const VIEWBOX = 512;
// Helvetica Bold, from the font metrics: cap height, and the advance of "BG".
const CAP_HEIGHT_EM = 0.717;
const BG_WIDTH_EM = 0.722 + 0.778;
// Maskable safe zone: a centred circle of 80% of the icon's width.
const SAFE_RADIUS = (VIEWBOX * 0.8) / 2;

function label(markup) {
  const m = /<text\b([^>]*)>([\s\S]*?)<\/text>/.exec(markup);
  assert.ok(m, 'the app icon has no <text>');
  const attr = (name) => {
    const a = new RegExp(`\\b${name}="(-?[\\d.]+)"`).exec(m[1]);
    return a ? Number(a[1]) : null;
  };
  return { text: m[2].trim(), size: attr('font-size'), spacing: attr('letter-spacing') };
}

test('the app icon shows the initials, like the tab icon', () => {
  assert.equal(label(svg).text, 'BG', 'the app icon still carries more than the initials');
});

test('the app icon stays full-bleed', () => {
  // Non-regression: this is the whole reason it is a separate file from
  // favicon.svg. A rounded rect here shows black corners on iOS.
  const rect = /<rect\b([^>]*)\/>/.exec(svg);
  assert.ok(rect, 'the app icon lost its background');
  assert.doesNotMatch(rect[1], /\brx=/, 'the app icon rounds its own corners; the OS does that');
  assert.match(rect[1], /width="512"/, 'the background no longer covers the tile');
  assert.match(rect[1], /height="512"/, 'the background no longer covers the tile');
});

test('the label fits inside the maskable safe circle', () => {
  const { size, spacing } = label(svg);
  const w = BG_WIDTH_EM * size + (spacing || 0);
  const h = CAP_HEIGHT_EM * size;
  const halfDiagonal = Math.hypot(w / 2, h / 2);
  assert.ok(
    halfDiagonal <= SAFE_RADIUS,
    `the initials reach ${halfDiagonal.toFixed(0)}px from centre; a maskable crop keeps only ${SAFE_RADIUS}px`,
  );
});

test('the label uses the room the dropped qualification freed', () => {
  // Guards the other direction: "BG | MSc" was set at 96px and left the tile
  // mostly empty. Shrinking back to that would satisfy the safe-circle test.
  assert.ok(label(svg).size >= 200, 'the initials are far smaller than the tile allows');
});

test('the app icon centres without dominant-baseline', () => {
  // Unevenly supported, and these icons are rendered by OS launchers too.
  assert.doesNotMatch(svg, /dominant-baseline/, 'vertical centring depends on the renderer again');
});

test('the manifest icons carry the same cache-buster as the head links', () => {
  // The manifest icons had no ?v= at all, so a browser re-reading the manifest
  // kept serving the previous art from cache and the new icon never appeared.
  // head.js owns the version; the two have to agree or half the icons update.
  const head = fs.readFileSync(path.join(__dirname, 'sections/head.js'), 'utf8');
  const headVersions = new Set([...head.matchAll(/favicon[^"']*\?v=(\d+)/g)].map((m) => m[1]));
  assert.equal(headVersions.size, 1, 'the head links disagree about the cache-buster');
  const [version] = headVersions;
  for (const icon of manifest.icons) {
    assert.match(
      icon.src,
      new RegExp(`\\?v=${version}$`),
      `${icon.src} is not at the head's ?v=${version}, so it will serve stale art`,
    );
  }
});

test('the manifest still points at the maskable set', () => {
  const srcs = manifest.icons.map((i) => i.src);
  for (const expected of ['favicon-192.png', 'favicon-512.png', 'icon-app.svg']) {
    assert.ok(
      srcs.some((s) => s.includes(expected)),
      `manifest no longer ships ${expected}`,
    );
  }
  for (const icon of manifest.icons) {
    assert.match(icon.purpose, /maskable/, `${icon.src} is no longer declared maskable`);
  }
});

// The browser-tab icon.
//
// It used to stack "BG" over "MSc" in a 512-unit square, which at the 16px the
// tab actually renders left each line about 7px tall — unreadable, and the
// qualification is not what identifies a tab anyway. The tab icon carries the
// initials alone; the home-screen / PWA icons (icon-app.svg, favicon-180/192/
// 512.png) are a separate set and keep their own wording.
//
// Four files have to agree, because a browser picks whichever it prefers:
// favicon.svg, favicon-32.png, favicon-16.png and favicon.ico. Only the SVG is
// readable as text here; the rasters are regenerated from it, and the head test
// below guards the cache-buster that makes browsers pick the new art up at all.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const svg = fs.readFileSync(path.join(ROOT, 'assets/icons/favicon.svg'), 'utf8');
const head = fs.readFileSync(path.join(__dirname, 'sections/head.js'), 'utf8');

// Text content of every <text> element, in document order.
function labels(markup) {
  return [...markup.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1].trim());
}

test('the tab icon shows the initials and nothing else', () => {
  assert.deepEqual(labels(svg), ['BG'], 'the tab icon carries more than the initials');
});

test('the tab icon still says BG', () => {
  // Guards against "fix" it by emptying the icon rather than by trimming it.
  assert.match(svg, /<text\b[^>]*>\s*BG\s*<\/text>/, 'the initials are gone from the tab icon');
});

test('the icon is one centred line, not a stack', () => {
  // Two <text> elements at different y is exactly the layout being removed;
  // deepEqual above catches that, but a single element parked off-centre would
  // pass it. The tile is 512 wide, so the line has to sit on the middle axis.
  const x = /<text\b[^>]*\bx="(\d+)"/.exec(svg);
  assert.ok(x, 'the icon label has no x');
  assert.equal(Number(x[1]), 256, 'the label is not centred horizontally');
});

test('the favicon cache-buster is bumped past the stacked icon', () => {
  // Chrome caches favicons in a store that ordinary reloads do not touch, so
  // without a new ?v= the old art survives the deploy. v18 shipped the stacked
  // BG/MSc icon; anything at or below it would ship the change invisibly.
  const versions = [...head.matchAll(/favicon[^"']*\?v=(\d+)/g)].map((m) => Number(m[1]));
  assert.ok(versions.length >= 3, 'the favicon links lost their cache-buster');
  for (const v of versions) {
    assert.ok(v > 18, `favicon cache-buster is still ?v=${v}; v18 served the stacked icon`);
  }
  assert.equal(new Set(versions).size, 1, 'the favicon links disagree about the cache-buster');
});

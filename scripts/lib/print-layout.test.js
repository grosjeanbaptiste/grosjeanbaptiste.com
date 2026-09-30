// js/print-layout.js moves Education and the degrees summary into their LaTeX
// positions just before printing. Two ways that goes silently wrong: the script
// exists but no page loads it, or it moves nodes without restoring them, which
// would leave the on-screen page rearranged after the print dialog closes.
//
// It also builds the full-width header banner back. That banner was dropped
// once, because Firefox will not fragment the two-column block across sheets
// and a banner above it pushed the whole block onto its own page. It is back
// under an explicit instruction that the sheet must look like the PDF, and it
// pays for itself: the identity block leaving the narrow column frees more
// height there than the banner costs across the full width. The two-page
// guarantee is unchanged and still enforced by print-fit*.test.js in both
// engines — that is what keeps this from being a regression.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const PAGES = ['index.html', ...['fr', 'nl', 'es', 'de', 'zh'].map((l) => `${l}/index.html`)];
const script = fs.readFileSync(path.join(ROOT, 'js/print-layout.js'), 'utf8');

test('every localized page loads the print layout script', () => {
  const missing = PAGES.filter(
    (p) => !fs.readFileSync(path.join(ROOT, p), 'utf8').includes('/js/print-layout.js'),
  );
  assert.deepEqual(missing, [], `pages that would print unrearranged: ${missing.join(', ')}`);
});

test('the script restores the page after printing', () => {
  assert.match(script, /addEventListener\(['"]beforeprint['"]/, 'nothing prepares the layout');
  assert.match(script, /addEventListener\(['"]afterprint['"]/, 'nothing restores it');
});

test('it relocates exactly the nodes CSS cannot move', () => {
  for (const hook of ['contact-info', 'education', 'embedded-volunteer']) {
    assert.ok(script.includes(hook), `no handling for the ${hook} node`);
  }
});

test('the identity block is lifted into a full-width banner', () => {
  // The PDF puts photo, name, tagline and contact details in a banner above
  // both columns (\\makecvheader). CSS cannot move a node between containers,
  // so the banner only exists if this script builds it.
  assert.match(script, /print-banner/, 'nothing builds the full-width banner');
  assert.match(script, /profile-picture/, 'the photo stays in the narrow column');
});

test('Education leads the sidebar once the identity block has left it', () => {
  // With the banner carrying the name away, the narrow column starts on its
  // first real section — Education — exactly as the PDF does. While there was
  // no banner this had to sit *after* the identity block instead, or the sheet
  // opened on EDUCATION above the name.
  // Pinned as the actual insertion, not as a mention of sidebar.firstChild:
  // that name also appeared in the fallback arm of the ternary this replaces,
  // so the loose check passed while Education still went in after the name.
  assert.match(
    script,
    /move\(education, sidebar, \{ before: sidebar\.firstChild \}\)/,
    'Education is not inserted ahead of everything else in the sidebar',
  );
  assert.doesNotMatch(
    script,
    /contact\.nextSibling/,
    'Education is still positioned relative to the identity block, which has left the column',
  );
});

test('the degrees summary is filed under the Education heading', () => {
  // In the PDF the qualifications appear in the sidebar under Education, not
  // among the contact details where the page keeps them.
  assert.match(
    script,
    /\.contact-info \.degree/,
    'the degree lines would print among the contact details instead',
  );
});

test('the page colour is laid down by a fixed layer, not by body', () => {
  // A background on body paints body's box only. On the verso that box ends
  // with the columns, so the references — pushed there by break-before —
  // printed on bare white below it. A fixed element is painted on every sheet.
  const css = fs.readFileSync(path.resolve(__dirname, '../../css/print.css'), 'utf8');
  assert.match(
    css,
    /body::before[^}]*position:\s*fixed/,
    'nothing paints the page colour across every sheet',
  );
});

// The script now CREATES a node as well as moving existing ones, and undo only
// covers moves. A build without a matching teardown leaves an empty Volunteer
// block in the sidebar once the print dialog closes — invisible until someone
// prints, then permanent until reload.
//
// Retro-fit guard: the teardown was verified behaviourally first, by firing
// beforeprint/afterprint in headless Chrome and diffing the DOM. This is the
// cheap standing check, not that proof.
test('the verso block it builds is torn down again', () => {
  assert.match(script, /createElement\(['"]section['"]\)/, 'nothing builds the verso block');
  assert.match(script, /versoVolunteer\?\.remove\(\)/, 'the built block is never removed');
  assert.match(script, /verso\?\.remove\(\)/, 'the verso container is never removed');
  assert.match(script, /banner\?\.remove\(\)/, 'the banner is never removed');
});

test('the verso is a second two-column block, not a break inside the first', () => {
  // \clearpage\begin{paracol}{2} in document.js. Faking it with break-before on
  // nodes still inside the recto's grid cost Firefox — which will not fragment
  // a grid — a page for the volunteering and another for the references: four
  // sheets where the PDF has two. print-fit-firefox.test.js is what caught it,
  // and is what keeps it caught; this is the cheap standing check.
  assert.match(script, /print-verso/, 'nothing builds the verso container');
  const css = fs.readFileSync(path.resolve(__dirname, '../../css/print-verso.css'), 'utf8');
  assert.match(
    css,
    /#print-verso[^}]*grid-template-columns/,
    'the verso container is not laid out in two columns',
  );
  assert.doesNotMatch(
    css,
    /#references\s*\{[^}]*break-before/,
    'the references still carry their own page break, inside the recto grid',
  );
});

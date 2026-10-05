// The printed sheet has to LOOK like the LaTeX CV, not merely carry the same
// palette and geometry — that much print-parity.test.js already pins. What is
// checked here is the part a reader actually sees: the type scale, the banner,
// the photo, the shape of a work entry, and the fact that neither side carries
// content the other does not.
//
// Every expected value is derived from the LaTeX build itself, never typed in
// twice: the class option decides the body size, altacv decides the heading
// rules and the photo ring, work.js decides the entry's column split. Change
// the PDF and these fail rather than drift.
//
// What they still do NOT claim: identical output. TeX breaks lines and pages
// with algorithms a browser does not have, so line endings differ. See the
// header of css/print.css.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildPreamble } = require('./pdf/preamble');

const ROOT = path.resolve(__dirname, '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');

// The sheet is split across css/print*.css; every assertion is about the sheet
// as a whole, so read them as one corpus — same rule as print-parity.test.js.
const css = stripComments(
  fs
    .readdirSync(path.join(ROOT, 'css'))
    .filter((f) => /^print.*\.css$/.test(f))
    .map((f) => read(`css/${f}`))
    .join('\n'),
);
const preamble = buildPreamble('en');
const cls = read('latex/altacv.cls');
const workJs = read('scripts/lib/pdf/sections/work.js');

test('the sheet is sized by one base, close to the LaTeX class size', () => {
  // Everything on the sheet is a ratio of --print-base, so the proportions are
  // the PDF's whatever it is set to. What this pins is that the base exists,
  // that the sheet is driven by it, and that it stays within a tenth of
  // \documentclass[8pt] — a browser needs a little less than TeX to hold the
  // same content in two pages, but "a little" is the whole claim.
  const m = preamble.match(/\\documentclass\[(\d+)pt/);
  assert.ok(m, 'no point size in \\documentclass');
  const base = css.match(/--print-base:\s*([\d.]+)pt/);
  assert.ok(base, 'the sheet declares no --print-base');
  const drift = Math.abs(Number(base[1]) - Number(m[1])) / Number(m[1]);
  assert.ok(
    drift <= 0.1,
    `the sheet is set at ${base[1]}pt against the PDF's ${m[1]}pt — ${Math.round(drift * 100)}% off`,
  );
  assert.match(css, /font-size:\s*var\(--print-base\)/, 'nothing is driven by the base');
});

test('every size on the sheet keeps the PDF ratio it was measured from', () => {
  // altacv's magsteps, read out of a shipped PDF's content stream and divided
  // by \normalsize. A literal pt size creeping back in would be a size that
  // stops scaling with the base — the sheet would go out of proportion the
  // moment the base moved.
  for (const [ratio, step] of [
    ['2.161rem', '\\Huge'],
    ['1.501rem', '\\LARGE'],
    ['1.369rem', '\\Large'],
    ['1.250rem', '\\large'],
    ['0.874rem', '\\small'],
    ['0.750rem', '\\footnotesize'],
  ]) {
    assert.ok(css.includes(ratio), `nothing on the sheet is set at ${step} (${ratio})`);
  }
  const literals = [...css.matchAll(/font-size:\s*([\d.]+pt)/g)].map((m) => m[1]);
  assert.deepEqual(literals, [], `sizes that will not scale with the base: ${literals.join(', ')}`);
});

test('the photo is the diameter the PDF gives it', () => {
  // \photoL{4cm}{profil} in sections/header.js.
  const m = read('scripts/lib/pdf/sections/header.js').match(/\\\\photoL\{([\d.]+cm)\}/);
  assert.ok(m, 'no \\photoL{...} in the PDF header');
  assert.ok(css.includes(m[1]), `the PDF photo is ${m[1]}; the print sheet never uses that size`);
});

test('the photo keeps its heading-rule ring', () => {
  // altacv draws the photo as a TikZ circle stroked in headingrule (ThirdColor).
  // The screen styles ring it in the primary navy, and print never overrode it.
  assert.match(cls, /filldraw\[color=headingrule/, 'altacv no longer rings the photo');
  assert.match(
    css,
    /#profile-picture[^}]*border:[^;}]*var\(--accent-color\)/,
    'the printed photo does not take the heading-rule colour',
  );
});

test('section rules are as thick as the LaTeX ones', () => {
  // \cvsection rules at 2pt in the main column, \cvsectionsidebar at 1.5pt.
  const main = cls.match(/\\newcommand\{\\cvsection\}[\s\S]*?\\rule\{\\linewidth\}\{([\d.]+pt)\}/);
  const side = preamble.match(/cvsectionsidebar[\s\S]*?\\rule\{\\linewidth\}\{([\d.]+pt)\}/);
  assert.ok(main && side, 'could not read the heading rule thicknesses');
  // Matched as a border declaration, not as a bare substring: "2pt" also
  // occurs in `margin: 0 0 2pt`, which passed this check while every heading
  // rule on the sheet was still 1.5pt.
  for (const [where, width] of [
    ['main-column', main[1]],
    ['sidebar', side[1]],
  ]) {
    assert.match(
      css,
      new RegExp(`border-bottom:\\s*${width.replace('.', '\\.')}\\s+solid`),
      `${where} heading rules are ${width} in the PDF; no print rule declares that border`,
    );
  }
});

test('a work entry splits its header the way the PDF does', () => {
  // Position in a 0.62\linewidth box, employer right-aligned in a 0.35 one,
  // then dates and location side by side underneath — not three stacked lines.
  const boxes = [...workJs.matchAll(/parbox\[t\]\{([\d.]+)\\\\linewidth\}/g)].map((m) =>
    Math.round(Number(m[1]) * 100),
  );
  assert.ok(boxes.length >= 2, 'work.js no longer lays the entry header out in parboxes');
  for (const pct of new Set(boxes)) {
    assert.ok(css.includes(`${pct}%`), `the entry header uses ${pct}% in the PDF, never in print`);
  }
});

test('the print sheet drops the highlights the PDF never renders', () => {
  // sections/work.js renders the summary and the trailer; `highlights` is not
  // part of the PDF at all. The page prints one bulleted line per highlight,
  // which on this CV is a technology list under almost every entry.
  assert.doesNotMatch(workJs, /highlights/, 'the PDF now renders highlights — this test is stale');
  assert.match(
    css,
    /\.entry-highlight[^{]*\{[^}]*display:\s*none/,
    'the printed sheet keeps highlights the PDF does not have',
  );
});

test('the machine-readable links stay off the sheet', () => {
  // The PDF's \personalinfo carries email, phone, location, the profiles and
  // the driving licence — not the XML or JSON Resume views.
  const header = read('scripts/lib/pdf/sections/header.js');
  assert.doesNotMatch(header, /xmlResume|jsonRegistry/, 'the PDF now links the machine views');
  assert.match(
    css,
    /\.contact-machine[^{]*\{[^}]*display:\s*none/,
    'the sheet prints links the PDF does not carry',
  );
});

test('the day chart is tinted from the same wheel as the PDF', () => {
  // \wheelchart paints every slice in a tint of accent; the page gives each
  // item its own colour, and the sheet printed a multicoloured donut beside
  // the PDF's red one. Pinned by COUNT, not by value: the tints are xcolor
  // arithmetic and live in the stylesheet, but a seventh slice added to
  // WHEEL_STYLES with no rule here would print in the page's palette again.
  const sidebar = read('scripts/lib/pdf/sections/sidebar.js');
  const styles = sidebar.match(/const WHEEL_STYLES = \[([\s\S]*?)\]/);
  assert.ok(styles, 'no WHEEL_STYLES in the PDF sidebar builder');
  const slices = (styles[1].match(/accent/g) || []).length;
  const tinted = new Set(
    [...css.matchAll(/\.daily-life-chart path:nth-of-type\((\d+)\)/g)].map((m) => m[1]),
  );
  assert.equal(
    tinted.size,
    slices,
    `the PDF tints ${slices} slices; the print sheet covers ${tinted.size}`,
  );
});

test('the verso keeps its section headings once it is lifted out of the columns', () => {
  // js/print-layout.js moves the timeline and the references into
  // a verso block of their own, which took their headings out of reach of the
  // .sidebar / .main-content selectors: they printed as plain body text while
  // every other heading on the sheet kept its rule. Caught by eye on a render,
  // which is the only place it showed — hence this standing check. Both
  // are \\cvsection in the PDF: the scale of the main column.
  assert.match(
    css,
    /\.main-content h2,\s*#print-verso h2\s*\{[^}]*font-size:\s*1\.501rem/,
    'the headings of the verso take no heading scale — they print as body text',
  );
});

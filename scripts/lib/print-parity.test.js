// css/print.css exists to make the browser-printed CV look like the LaTeX one.
// Those two are produced by completely different engines, so nothing keeps them
// in step automatically: change a colour in the LaTeX preamble and the print
// stylesheet silently drifts. These tests pin the shared constants to their
// single source of truth — the LaTeX build itself.
//
// What they deliberately do NOT claim: that the two outputs are identical. Line
// breaking, hyphenation and pagination come from TeX's algorithms and cannot be
// reproduced by a browser. See the header comment of css/print.css.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildPreamble } = require('./pdf/preamble');
const { FIT_PLANS } = require('./pdf/config');

const ROOT = path.resolve(__dirname, '../..');
// The print sheet is split across css/print*.css; assertions are about the
// sheet as a whole, so read them as one corpus rather than naming one file.
const css = fs
  .readdirSync(path.join(ROOT, 'css'))
  .filter((f) => /^print.*\.css$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8'))
  .join('\n');
const preamble = buildPreamble('en');
const documentJs = fs.readFileSync(path.join(__dirname, 'pdf/document.js'), 'utf8');

// \definecolor{PrimaryColor}{HTML}{001F5A} -> { PrimaryColor: '001F5A' }
function latexColours() {
  const out = {};
  for (const m of preamble.matchAll(/\\definecolor\{(\w+)\}\{HTML\}\{([0-9A-Fa-f]{6})\}/g)) {
    out[m[1]] = m[2].toUpperCase();
  }
  return out;
}

// \geometry{left=0.9cm,...} -> { left: '0.9cm', ... }
function latexGeometry() {
  const m = preamble.match(/\\geometry\{([^}]*)\}/);
  assert.ok(m, 'no \\geometry{...} in the preamble');
  return Object.fromEntries(m[1].split(',').map((kv) => kv.split('=')));
}

test('every LaTeX colour is declared in the print stylesheet', () => {
  const missing = Object.entries(latexColours())
    .filter(([, hex]) => !new RegExp(`#${hex}`, 'i').test(css))
    .map(([name, hex]) => `${name} (#${hex})`);
  assert.deepEqual(
    missing,
    [],
    `colours in the LaTeX CV but not in print.css: ${missing.join(', ')}`,
  );
});

test('the print page geometry matches the LaTeX geometry', () => {
  const geo = latexGeometry();
  for (const [key, value] of Object.entries(geo)) {
    assert.ok(
      css.includes(value),
      `\\geometry ${key}=${value} is not reflected anywhere in print.css`,
    );
  }
});

test('the print column split matches the LaTeX \\columnratio', () => {
  const m = documentJs.match(/\\\\columnratio\{([\d.]+)\}/);
  assert.ok(m, 'no \\columnratio{...} found in pdf/document.js');
  const percent = `${Number(m[1]) * 100}%`;
  assert.ok(
    css.includes(percent),
    `\\columnratio{${m[1]}} means a ${percent} column; print.css does not use it`,
  );
});

test('the print view applies the same content reductions as the winning fit plan', () => {
  // The plan the compiler settles on for all six languages: 8 work entries and
  // no per-entry skill tags (see the comments in pdf/config.js). If the plans
  // are reshaped, this trips and print.css must be revisited alongside them.
  const WORK_CAP = 8;
  assert.ok(
    FIT_PLANS.some((p) => p.work === WORK_CAP && p.show_skills === false),
    `no fit plan with work=${WORK_CAP} and show_skills=false — print.css mirrors a plan that no longer exists`,
  );
  assert.match(
    css,
    new RegExp(`nth-of-type\\(n\\s*\\+\\s*${WORK_CAP + 1}\\)`),
    `print.css does not cap the work timeline at ${WORK_CAP} entries`,
  );
  assert.match(
    css,
    /\.skill-tags[^{]*\{[^}]*display:\s*none/,
    'print.css does not hide the skill tags',
  );
});

test('the browser chrome is not printed', () => {
  for (const sel of ['nav', '.lang-switcher', '.cv-download-button', '.cv-print-button']) {
    assert.ok(
      new RegExp(`${sel.replace('.', '\\.')}[^{]*\\{[^}]*display:\\s*none`).test(css),
      `${sel} would be printed onto the sheet`,
    );
  }
});

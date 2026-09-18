// The printable view must carry the same entries as the LaTeX PDF — not merely
// the same look. The PDF applies a fit plan: it keeps the N most recent work
// entries and drops the Education section from the body, leaving the sidebar's
// two-line degrees summary.
//
// Getting this right by hiding "everything past the 8th" in CSS only works
// while the JSON happens to be stored in recency order. It is today, which is
// exactly what makes the bug invisible: add one entry out of order and the
// sheet silently starts advertising a different career than the PDF. So the
// selection is computed with the PDF's own topN, and these tests check the
// generated HTML rather than the stylesheet.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { FIT_PLANS, PRINT_PLAN_INDEX } = require('./pdf/config');
const { loadResume, topN } = require('./pdf/data');
const { PRINT_PLAN, printedWork } = require('./print-selection');

const ROOT = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const printCss = fs
  .readdirSync(path.join(ROOT, 'css'))
  .filter((f) => /^print.*\.css$/.test(f))
  .map((f) => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8'))
  .join('\n');

// [{ hidden, label }] for each work article, in document order. A position
// title alone is ambiguous here — several roles repeat across employers — so
// entries are identified by position + company on both sides.
function articles() {
  const out = [];
  for (const m of html.matchAll(/<article class="experience-item([^"]*)">([\s\S]*?)<\/article>/g)) {
    const h3 = /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(m[2]);
    const raw = h3 ? h3[1] : '';
    const companyMatch = /<span class="company">([\s\S]*?)<\/span>/.exec(raw);
    const company = companyMatch ? strip(companyMatch[1]) : '';
    // Some roles append the client after the position ("Crafter · aXinco");
    // the PDF keys on the position alone, so cut at the first separator.
    const position = strip(raw.replace(/<span class="company">[\s\S]*?<\/span>/, ''))
      .split('·')[0]
      .replace(/[|·]\s*$/, '');
    out.push({ hidden: m[1].includes('print-hidden'), label: `${position.trim()} — ${company}` });
  }
  return out;
}

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
const labelOf = (w) => `${w.position} — ${w.company}`;

test('the plan the print view mirrors is a real fit plan', () => {
  assert.ok(FIT_PLANS[PRINT_PLAN_INDEX], `FIT_PLANS has no index ${PRINT_PLAN_INDEX}`);
  assert.equal(PRINT_PLAN, FIT_PLANS[PRINT_PLAN_INDEX]);
});

test('printedWork selects what the PDF selects, by recency', () => {
  const resume = loadResume();
  const printed = printedWork(resume);
  assert.equal(printed.size, PRINT_PLAN.work);
  assert.deepEqual([...printed], topN(resume.work, PRINT_PLAN.work));
});

test('the generated page marks exactly the entries the PDF drops', () => {
  const resume = loadResume();
  const printed = new Set([...printedWork(resume)].map(labelOf));
  const rendered = articles();
  assert.equal(rendered.length, resume.work.length, 'not every work entry reached the page');

  const shown = rendered.filter((a) => !a.hidden).map((a) => a.label);
  assert.deepEqual(
    [...shown].sort(),
    [...printed].sort(),
    'the entries left visible for printing are not the ones the PDF prints',
  );
});

test('Education is dropped from the body, as the plan says', () => {
  assert.equal(
    PRINT_PLAN.education_in_body,
    false,
    'the mirrored plan now renders Education in the body; print.css must follow',
  );
  assert.match(
    printCss,
    /#education .education-item[^{]*\{[^}]*display:\s*none/,
    'print.css still prints the Education entries the PDF leaves out',
  );
});

test('a recorded PDF build agrees with the mirrored plan', () => {
  const recorded = path.join(ROOT, 'assets/cv/fit-plan.json');
  if (!fs.existsSync(recorded)) {
    // Written by scripts/generate-pdf.js. Absent until the PDFs are next built.
    return;
  }
  const byLang = JSON.parse(fs.readFileSync(recorded, 'utf8'));
  const drifted = Object.entries(byLang).filter(([, i]) => i !== PRINT_PLAN_INDEX);
  assert.deepEqual(
    drifted,
    [],
    `the PDFs were built with a different plan than the print view mirrors: ${JSON.stringify(drifted)}`,
  );
});

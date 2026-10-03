// The shipped landscape timeline PDFs, read back with poppler: one landscape
// page, named after what they are, every dated entry on it, and no label
// printed over another — row packing works from estimated label widths, and
// this is where an estimate that came out short would show.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { LANGS, OUTPUT_DIR } = require('./pdf/config');
const I18N = require('./pdf/i18n');
const { loadResume } = require('./pdf/data');
const { applyPdfOverrides } = require('./site-overrides');
const { timelineBars } = require('./pdf/timeline/bars');

const pdfOf = (lang) => path.join(OUTPUT_DIR, `cv_grosjean_baptiste_timeline_${lang}.pdf`);
const run = (tool, args) => execFileSync(tool, args, { encoding: 'utf8' });

// Each word poppler finds, with its box in points.
function wordsOf(file) {
  const html = run('pdftotext', ['-bbox', file, '-']);
  return [
    ...html.matchAll(/xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</g),
  ].map((m) => ({ x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], text: m[5] }));
}

// Overlap beyond a hair: neighbouring words on one line may touch.
const overprints = (a, b) =>
  Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0) > 0.5 &&
  Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0) > 0.5;

// An ellipsis reads back as three dots (Lato has no glyph for it) or, under
// xeCJK, as the midline "⋯": all three are the same truncation.
const squeeze = (s) => s.replace(/\s+/g, '').replace(/\.\.\.|⋯/g, '…');

for (const lang of LANGS) {
  test(`${lang}: the timeline PDF is one page`, () => {
    assert.match(run('pdfinfo', [pdfOf(lang)]), /^Pages:\s+1$/m);
  });

  test(`${lang}: the timeline PDF is A4 in landscape`, () => {
    assert.match(run('pdfinfo', [pdfOf(lang)]), /^Page size:\s+841\.\d+ x 595\.\d+ pts \(A4\)/m);
  });

  test(`${lang}: the timeline PDF is titled after the person and the timeline`, () => {
    const name = loadResume(lang).basics.name;
    assert.match(
      run('pdfinfo', [pdfOf(lang)]),
      new RegExp(`^Title:\\s+${name} — ${I18N[lang].timeline}$`, 'm'),
    );
  });

  test(`${lang}: no label is printed over another`, () => {
    const words = wordsOf(pdfOf(lang));
    const clashes = [];
    for (let i = 0; i < words.length; i++)
      for (let j = i + 1; j < words.length; j++)
        if (overprints(words[i], words[j])) clashes.push(`${words[i].text} / ${words[j].text}`);
    assert.deepEqual(clashes, []);
  });

  test(`${lang}: every dated entry is on the page`, () => {
    const page = squeeze(run('pdftotext', ['-raw', pdfOf(lang), '-']));
    const bars = timelineBars(applyPdfOverrides(loadResume(lang)), new Date()).lanes.flatMap(
      (l) => l.bars,
    );
    const missing = bars
      .filter((b) => b.strong && !page.includes(squeeze(b.strong)))
      .map((b) => b.strong);
    assert.deepEqual(missing, []);
  });
}

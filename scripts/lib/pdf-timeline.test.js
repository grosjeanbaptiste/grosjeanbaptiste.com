// The shipped landscape timeline PDFs — the whole career, the last five years,
// the last two — read back with poppler: one landscape page, named after what they are, every dated entry on it, and no label
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
const { SPANS, timelineFile } = require('./pdf/timeline/spans');

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

// What pdfinfo prints as the title, regex-escaped: the span is in parentheses.
function titleOf(lang, years) {
  const t = I18N[lang];
  const title = years === null ? t.timeline : `${t.timeline} (${t.timelineSpan(years)})`;
  return `${loadResume(lang).basics.name} — ${title}`.replace(/[()]/g, '\\$&');
}

function checkTimelinePdf(lang, span) {
  const file = path.join(OUTPUT_DIR, timelineFile(lang, span));
  const name = timelineFile(lang, span);

  test(`${name} is one page`, () => {
    assert.match(run('pdfinfo', [file]), /^Pages:\s+1$/m);
  });

  test(`${name} is A4 in landscape`, () => {
    assert.match(run('pdfinfo', [file]), /^Page size:\s+841\.\d+ x 595\.\d+ pts \(A4\)/m);
  });

  test(`${name} is titled after the person, the timeline and its span`, () => {
    assert.match(
      run('pdfinfo', [file]),
      new RegExp(`^Title:\\s+${titleOf(lang, span.years)}$`, 'm'),
    );
  });

  test(`${name} prints no label over another`, () => {
    const words = wordsOf(file);
    const clashes = [];
    for (let i = 0; i < words.length; i++)
      for (let j = i + 1; j < words.length; j++)
        if (overprints(words[i], words[j])) clashes.push(`${words[i].text} / ${words[j].text}`);
    assert.deepEqual(clashes, []);
  });

  test(`${name} carries every entry of its span`, () => {
    const page = squeeze(run('pdftotext', ['-raw', file, '-']));
    const resume = applyPdfOverrides(loadResume(lang));
    const bars = timelineBars(resume, new Date(), span.years).lanes.flatMap((l) =>
      l.groups.flatMap((g) => [g.head, ...g.children]),
    );
    const missing = bars
      .filter((b) => b.strong && !page.includes(squeeze(b.strong)))
      .map((b) => b.strong);
    assert.deepEqual(missing, []);
  });
}

for (const span of SPANS) for (const lang of LANGS) checkTimelinePdf(lang, span);

// The shipped timeline PDFs — the whole career, the last five years, the last
// two — read back with poppler: a landscape page then a portrait one (the same
// timeline, time running up), named after what they are, every dated entry on
// them, and no label printed over another — row packing works from estimated label widths, and
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
function wordsOf(file, page) {
  const html = run('pdftotext', ['-bbox', '-f', `${page}`, '-l', `${page}`, file, '-']);
  return (
    [...html.matchAll(/xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</g)]
      .map((m) => ({ x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], text: m[5] }))
      // The icons' hidden text, whose box poppler misplaces on the turned first
      // sheet (/Rotate 90): the drawn page shows the icon where it belongs.
      .filter((w) => !w.text.startsWith('\\fa'))
  );
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

  test(`${name} is two pages`, () => {
    assert.match(run('pdfinfo', [file]), /^Pages:\s+2$/m);
  });

  // pdflscape turns the first sheet with /Rotate, so poppler reports the
  // upright size and a rotation of 90.
  test(`${name} is A4: landscape, then portrait`, () => {
    const info = run('pdfinfo', ['-f', '1', '-l', '2', file]);
    assert.match(info, /^Page +1 size:\s+595\.\d+ x 841\.\d+ pts \(A4\)/m);
    assert.match(info, /^Page +1 rot:\s+90$/m);
    assert.match(info, /^Page +2 size:\s+595\.\d+ x 841\.\d+ pts \(A4\)/m);
    assert.match(info, /^Page +2 rot:\s+0$/m);
  });

  test(`${name} draws the same entries on both pages`, () => {
    const on = (page) =>
      squeeze(run('pdftotext', ['-raw', '-f', `${page}`, '-l', `${page}`, file, '-']));
    const resume = applyPdfOverrides(loadResume(lang));
    const heads = timelineBars(resume, new Date(), span.years).lanes.flatMap((l) =>
      l.groups.map((g) => g.head),
    );
    // Beside a short bar a name is cut at the width the page gives it: the
    // portrait page's differs, so only the first letters are compared.
    const start = (b) => squeeze(b.strong).replace(/…$/, '').slice(0, 4);
    const missing = heads.filter((b) => b.strong && !on(2).includes(start(b))).map((b) => b.strong);
    assert.deepEqual(missing, []);
  });

  test(`${name} is titled after the person, the timeline and its span`, () => {
    assert.match(
      run('pdfinfo', [file]),
      new RegExp(`^Title:\\s+${titleOf(lang, span.years)}$`, 'm'),
    );
  });

  for (const page of [1, 2]) {
    test(`${name} prints no label over another, page ${page}`, () => {
      const words = wordsOf(file, page);
      const clashes = [];
      for (let i = 0; i < words.length; i++)
        for (let j = i + 1; j < words.length; j++)
          if (overprints(words[i], words[j])) clashes.push(`${words[i].text} / ${words[j].text}`);
      assert.deepEqual(clashes, []);
    });
  }

  test(`${name} carries every entry of its span`, () => {
    const page = squeeze(run('pdftotext', ['-raw', file, '-']));
    const resume = applyPdfOverrides(loadResume(lang));
    const bars = timelineBars(resume, new Date(), span.years).lanes.flatMap((l) =>
      l.groups.flatMap((g) => [g.head, ...g.children]),
    );
    // A name is cut beside a short bar and whole inside a wide one: either way
    // the page carries its beginning.
    const beginning = (b) => squeeze(b.strong).replace(/…$/, '');
    const missing = bars
      .filter((b) => b.strong && !page.includes(beginning(b)))
      .map((b) => b.strong);
    assert.deepEqual(missing, []);
  });
}

for (const span of SPANS) for (const lang of LANGS) checkTimelinePdf(lang, span);

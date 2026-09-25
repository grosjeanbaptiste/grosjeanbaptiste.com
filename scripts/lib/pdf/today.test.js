// The "Updated <date>" line in the CV header.
//
// It used to be LaTeX's \today, which babel localises from \selectlanguage.
// That works for the five babel languages and silently fails for the sixth:
// config.js maps zh onto babel's `english` on purpose (babel's CJK support is
// poor; xeCJK does the typesetting instead), so the Chinese CV printed a
// Chinese label over an English date — "更新于 September 14, 2026".
//
// Formatting the date here instead puts it where every other localized string
// in this build already lives, and removes the dependency on which babel
// language happens to be selected.

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatLongDate } = require('./today');
const { LANGS } = require('./config');

const DAY = new Date(2026, 8, 14); // 14 September 2026, local time

// What each PDF already printed before this module existed, verbatim, so the
// five languages babel got right cannot regress into a new house style.
const BABEL_WORDING = {
  en: 'September 14, 2026',
  fr: '14 septembre 2026',
  nl: '14 september 2026',
  es: '14 de septiembre de 2026',
  de: '14. September 2026',
};

for (const [lang, expected] of Object.entries(BABEL_WORDING)) {
  test(`${lang} keeps the wording babel produced`, () => {
    assert.equal(formatLongDate(DAY, lang), expected);
  });
}

test('zh writes the date in Chinese, not in English', () => {
  assert.equal(formatLongDate(DAY, 'zh'), '2026年9月14日');
});

test('every language the CV ships can format a date', () => {
  for (const lang of LANGS) {
    assert.match(formatLongDate(DAY, lang), /2026/, `${lang} produced no usable date`);
  }
});

test('a single-digit day is not zero-padded in the latin languages', () => {
  // \today never padded; "01. September" would be a visible change of style.
  assert.equal(formatLongDate(new Date(2026, 8, 1), 'de'), '1. September 2026');
  assert.equal(formatLongDate(new Date(2026, 8, 1), 'fr'), '1 septembre 2026');
});

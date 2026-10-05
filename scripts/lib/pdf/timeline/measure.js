// A label's width on paper, estimated from its characters before TeX runs:
// rows are packed on it. Widths are Lato's, in ems, rounded up — an estimate
// that comes out short would let two labels overprint.

const MM_PER_PT = 0.3528;
const MARGIN = 1.08;

const CJK = /[⺀-鿿가-힯豈-﫿＀-￯]/u;

function ems(char) {
  if (CJK.test(char)) return 1;
  if (char === ' ') return 0.27;
  if (/[mwMW@]/.test(char)) return 0.85;
  if (/[A-Z0-9&]/.test(char)) return 0.64;
  if (/[iljtfr.,:;'|!()\-]/.test(char)) return 0.32;
  return 0.54;
}

const widthOf = (text, bold) => [...text].reduce((sum, c) => sum + ems(c), 0) * (bold ? 1.07 : 1);

// The text of a label: the name in bold, then " · " and the rest.
const restOf = (bar) => (bar.rest ? ` · ${bar.rest}` : '');

function labelWidth(bar, sizePt = 6) {
  const em = widthOf(bar.strong, true) + widthOf(restOf(bar), false);
  return em * sizePt * MM_PER_PT * MARGIN;
}

// A text's width in mm, same estimate.
const textWidth = (text, bold, sizePt = 6) => widthOf(text, bold) * sizePt * MM_PER_PT * MARGIN;

module.exports = { labelWidth, textWidth, restOf, MM_PER_PT };

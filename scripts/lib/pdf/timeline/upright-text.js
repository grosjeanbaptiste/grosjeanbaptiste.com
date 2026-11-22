// A label of the upright timeline as lines of words, and as TeX.
const { tex } = require('../tex');
const { textWidth } = require('./measure');
const { FONT } = require('./upright-metrics');

// A label's words, each in bold (the name) or not (what follows it), whole.
// `names`: the name alone — kept with its role where the name alone would not
// tell two entries apart, and for a degree, whose school does not say what was
// studied (`told`: whether the bar keeps its role).
function wordsOf(bar, names, told) {
  const words = (text) => (text ?? '').split(' ').filter(Boolean);
  const strong = words(bar.full?.strong ?? bar.strong);
  const rest = bar.depth !== 0 || !told(bar, names) ? [] : words(bar.full?.rest ?? bar.rest);
  return [
    ...strong.map((w) => ({ w, bold: true })),
    ...(rest.length ? ['·', ...rest] : []).map((w) => ({ w, bold: false })),
  ];
}

// A word longer than a line is broken where it stands.
function pieces(word, room) {
  const out = [];
  let chunk = '';
  for (const c of [...word.w]) {
    if (chunk && textWidth(chunk + c, word.bold, FONT) > room) {
      out.push({ ...word, w: chunk });
      chunk = '';
    }
    chunk += c;
  }
  return [...out, { ...word, w: chunk }];
}

// The words filled into lines no wider than `room`.
function wrap(words, room, first = 0) {
  const space = textWidth(' ', false, FONT);
  const lines = [[]];
  let used = first;
  const fitting = words.flatMap((w) =>
    textWidth(w.w, w.bold, FONT) > room ? pieces(w, room) : [w],
  );
  for (const word of fitting) {
    const width = textWidth(word.w, word.bold, FONT);
    const line = lines.at(-1);
    if (line.length && used + space + width > room) {
      lines.push([word]);
      used = width;
    } else {
      line.push(word);
      used += (line.length > 1 ? space : 0) + width;
    }
  }
  return lines;
}

// A line of words as TeX: consecutive words of one weight share one \textbf.
function texOf(line) {
  const runs = [];
  for (const { w, bold } of line) {
    const run = runs.at(-1);
    if (run && run.bold === bold) run.text += ` ${tex(w)}`;
    else runs.push({ bold, text: tex(w) });
  }
  // The name in bold, what follows it (the role, a degree's title) in the grey of body text.
  return runs
    .map((r) => (r.bold ? `\\textbf{${r.text}}` : `{\\color{BodyColor}${r.text}}`))
    .join(' ');
}

module.exports = { wordsOf, wrap, texOf };

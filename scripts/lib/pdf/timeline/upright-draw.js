// The upright timeline as a TikZ picture: the years, then each lane's title,
// outlines, bars and labels.
const { tex } = require('../tex');
const { LANE_TITLE, MOON, OUTLINE, fillOf, isEvening } = require('./picture');
const { texOf } = require('./upright-text');
const { AXIS, WIDTH, FONT, LINE, MARK, GUTTER, BASE, LABEL_GAP } = require('./upright-metrics');

const mm = (n) => n.toFixed(2);

// A year's number is about 2.5 mm tall: one closer than that to the last drawn
// keeps its line and leaves its number out, as the years of school are squeezed.
function yearLines(sheet) {
  let last = Number.NEGATIVE_INFINITY;
  return sheet.years.flatMap(({ year, y }) => {
    const line = `\\draw[BodyColor!45,dashed,line width=0.3pt] (${AXIS - 1},${mm(y)}) -- (${WIDTH},${mm(y)});`;
    if (y - last < LABEL_GAP) return [line];
    last = y;
    return [
      line,
      `\\node[anchor=east,text=BodyColor,font=\\fontsize{7}{8}\\selectfont] at (${AXIS - 1.4},${mm(y)}) {${year}};`,
    ];
  });
}

function laneLines(lane, t) {
  const right = lane.x + lane.barsWidth + GUTTER + MARK + 1 + lane.room;
  const heading = [
    `\\draw[headingrule,line width=0.5pt] (${mm(lane.x)},4.5) -- (${mm(right)},4.5);`,
    `\\node[anchor=south west,text=heading,font=\\fontsize{8}{9}\\selectfont\\bfseries] at (${mm(lane.x)},4.8) {${tex(t[LANE_TITLE[lane.kind]])}};`,
  ];
  const colour = OUTLINE[lane.kind] ?? 'BodyColor';
  const outlines = lane.groups
    .filter((g) => g.outlined)
    .map(
      (g) =>
        `\\filldraw[draw=${colour}!55,fill=${colour}!10,line width=0.3pt,rounded corners=0.6mm] (${mm(lane.x + g.x0)},${mm(g.top + 0.4)}) rectangle (${mm(lane.x + g.x1 - 0.2)},${mm(g.bottom - 0.4)});`,
    );
  // A family of projects is outlined inside its entry's outline, a tint darker.
  const families = lane.groups
    .filter((g) => g.family)
    .map(
      ({ family: f }) =>
        `\\filldraw[draw=${colour}!70,fill=${colour}!22,line width=0.3pt,rounded corners=0.5mm] (${mm(lane.x + f.x0)},${mm(f.top + 0.3)}) rectangle (${mm(lane.x + f.x1)},${mm(f.bottom - 0.3)});`,
    );
  const bars = lane.bars.map((b) => {
    const x0 = lane.x + b.dx;
    return `\\fill[${fillOf(b)},rounded corners=0.4mm] (${mm(x0)},${mm(b.y0)}) rectangle (${mm(x0 + lane.bar)},${mm(b.y1)});`;
  });
  const labels = lane.labels.flatMap(({ bar, lines, top }) => {
    const y = top - LINE / 2;
    const out = [];
    // The label has been pushed away from its bar: a thin line joins them.
    if (bar.y0 - top > LINE * 0.6)
      out.push(
        `\\draw[BodyColor!50,line width=0.2pt] (${mm(lane.x + bar.dx + lane.bar)},${mm(bar.y0 - 0.6)}) -- (${mm(lane.labelX - 0.2)},${mm(y)});`,
      );
    out.push(
      `\\fill[${fillOf(bar)}] (${mm(lane.labelX)},${mm(y - MARK / 2)}) rectangle (${mm(lane.labelX + MARK)},${mm(y + MARK / 2)});`,
    );
    lines.forEach((line, i) => {
      const moon = i === 0 && isEvening(bar) ? MOON : '';
      out.push(
        `\\node[anchor=base west,text=EmphasisColor] at (${mm(lane.labelX + MARK + 0.8)},${mm(y - i * LINE - BASE)}) {${moon}${texOf(line)}};`,
      );
    });
    return out;
  });
  return [...heading, ...outlines, ...families, ...bars, ...labels];
}

function buildUpright(sheet, t) {
  return [
    `\\begin{tikzpicture}[x=1mm,y=1mm,every node/.style={inner sep=0pt},font=\\fontsize{${FONT}}{${FONT + 1}}\\selectfont]`,
    ...yearLines(sheet),
    ...sheet.lanes.flatMap((lane) => laneLines(lane, t)),
    '\\end{tikzpicture}',
  ].join('\n');
}

module.exports = { buildUpright };

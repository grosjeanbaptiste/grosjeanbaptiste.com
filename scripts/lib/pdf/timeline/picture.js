// The timeline as a TikZ picture: the year axis, then each lane's title and
// bars, every bar carrying its label (inside it, or beside it when too short).
const { tex } = require('../tex');
const { restOf } = require('./measure');

const LANE_TITLE = {
  work: 'experience',
  education: 'education',
  competitions: 'competitions',
  projects: 'projects',
  volunteer: 'volunteer',
};

// An entry's colour by its kind, in the PDF's palette. What an entry carried is
// drawn under it in a lighter tint of its own colour, with dark text.
const FILL = {
  work: 'ThirdColor',
  education: 'PrimaryColor',
  competition: 'PrimaryColor!55!ThirdColor',
  project: 'SecondaryColor!75!ThirdColor',
  volunteer: 'BodyColor',
};
const fillOf = (bar) => (bar.depth === 1 ? `${FILL[bar.kind]}!30!BackgroundColor` : FILL[bar.kind]);
// The outline of an entry that carried something, in its lane's colour.
const OUTLINE = {
  work: 'ThirdColor',
  education: 'PrimaryColor',
  competitions: 'PrimaryColor!55!ThirdColor',
};

const mm = (n) => n.toFixed(2);
// Where the lane titles go, left of the axis (mm), unless the sheet says.
const TITLES = { x: -27, width: 24, size: 8 };

function yearLines(sheet) {
  return sheet.years.flatMap(({ year, x }) => [
    `\\draw[BodyColor!45,dashed,line width=0.3pt] (${mm(x)},${mm(-sheet.axis + 1)}) -- (${mm(x)},${mm(-sheet.height)});`,
    `\\node[anchor=south,text=BodyColor,font=\\fontsize{7}{8}\\selectfont] at (${mm(x)},${mm(-sheet.axis + 1.4)}) {${year}};`,
  ]);
}

function barLines(lane, sheet) {
  return lane.bars.flatMap((bar) => {
    const y = lane.top - bar.row * sheet.pitch;
    const inside = bar.label.place === 'inside';
    // White on a full colour; dark on the light tint of what an entry carried.
    const ink = inside && bar.depth === 0 ? 'white' : 'EmphasisColor';
    const anchor = bar.label.place === 'left' ? 'east' : 'west';
    const text = `\\textbf{${tex(bar.strong)}}${tex(restOf(bar))}`;
    // A bar the span cut short points left, into the gap before the axis.
    const cut = bar.clipped
      ? [
          `\\fill[${fillOf(bar)}] (-0.20,${mm(y)}) -- (-1.60,${mm(y - sheet.bar / 2)}) -- (-0.20,${mm(y - sheet.bar)}) -- cycle;`,
        ]
      : [];
    // A bar with no room for even a cut name carries none.
    const label = bar.strong
      ? [
          `\\node[anchor=${anchor},text=${ink}] at (${mm(bar.label.x)},${mm(y - sheet.bar / 2)}) {${text}};`,
        ]
      : [];
    return [
      ...cut,
      `\\fill[${fillOf(bar)},rounded corners=0.5mm] (${mm(bar.x0)},${mm(y)}) rectangle (${mm(bar.x1)},${mm(y - sheet.bar)});`,
      ...label,
    ];
  });
}

// Behind the bars: each entry that carried something, with what it carried.
// Drawn from the start of its first bar to the end of its last, and inside the
// gap between rows on both sides — so two outlines that meet, across the page
// (an entry that begins the day another ends) or down it, never overlap.
function outlineLines(lane, sheet) {
  const colour = OUTLINE[lane.kind] ?? 'BodyColor';
  const gap = sheet.pitch - sheet.bar;
  return lane.outlines.map((o) => {
    const top = lane.top - o.row * sheet.pitch + gap * 0.4;
    const bottom = lane.top - (o.row + o.rows) * sheet.pitch + gap * 0.6;
    return `\\filldraw[draw=${colour}!55,fill=${colour}!10,line width=0.3pt,rounded corners=0.6mm] (${mm(o.x0)},${mm(top)}) rectangle (${mm(o.x1)},${mm(bottom)});`;
  });
}

function laneLines(lane, sheet, t) {
  const { x, width, size } = sheet.titles ?? TITLES;
  return [
    `\\draw[headingrule,line width=0.5pt] (${x},${mm(lane.top + 1)}) -- (${mm(x + width)},${mm(lane.top + 1)});`,
    `\\node[anchor=north west,text width=${width}mm,align=left,text=heading,font=\\fontsize{${size}}{${size + 1}}\\selectfont\\bfseries] at (${x},${mm(lane.top)}) {${tex(t[LANE_TITLE[lane.kind]])}};`,
    ...outlineLines(lane, sheet),
    ...barLines(lane, sheet),
  ];
}

function buildPicture(sheet, t) {
  return [
    `\\begin{tikzpicture}[x=1mm,y=1mm,every node/.style={inner sep=0pt},font=\\fontsize{${sheet.font}}{${sheet.font + 1}}\\selectfont]`,
    ...yearLines(sheet),
    ...sheet.lanes.flatMap((lane) => laneLines(lane, sheet, t)),
    '\\end{tikzpicture}',
  ].join('\n');
}

module.exports = { buildPicture };

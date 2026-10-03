// The timeline as a TikZ picture: the year axis, then each lane's title and
// bars, every bar carrying its label (inside it, or beside it when too short).
const { tex } = require('../tex');
const { restOf } = require('./measure');

const LANE_TITLE = {
  work: 'experience',
  education: 'education',
  projects: 'projects',
  volunteer: 'volunteer',
};

// The interactive view's lane colours, in the PDF's palette.
const FILL = {
  work: 'ThirdColor',
  education: 'PrimaryColor',
  projects: 'SecondaryColor!75!ThirdColor',
  volunteer: 'BodyColor',
};

const mm = (n) => n.toFixed(2);
const TITLE_X = -27;

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
    const anchor = bar.label.place === 'left' ? 'east' : 'west';
    const text = `\\textbf{${tex(bar.strong)}}${tex(restOf(bar))}`;
    return [
      `\\fill[${FILL[lane.kind]},rounded corners=0.5mm] (${mm(bar.x0)},${mm(y)}) rectangle (${mm(bar.x1)},${mm(y - sheet.bar)});`,
      `\\node[anchor=${anchor},text=${inside ? 'white' : 'EmphasisColor'}] at (${mm(bar.label.x)},${mm(y - sheet.bar / 2)}) {${text}};`,
    ];
  });
}

function laneLines(lane, sheet, t) {
  return [
    `\\draw[headingrule,line width=0.5pt] (${TITLE_X},${mm(lane.top + 1)}) -- (${mm(TITLE_X + 24)},${mm(lane.top + 1)});`,
    `\\node[anchor=north west,text width=24mm,align=left,text=heading,font=\\fontsize{8}{9}\\selectfont\\bfseries] at (${TITLE_X},${mm(lane.top)}) {${tex(t[LANE_TITLE[lane.kind]])}};`,
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

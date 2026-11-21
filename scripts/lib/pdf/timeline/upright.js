// The timeline upright, for a portrait page: time runs up it (the oldest at
// the bottom, the newest at the top), each lane is a column of thin vertical
// bars, and every label is set horizontally beside its lane, in order of date,
// joined to its bar by a thin line when the labels above it have pushed it down.
// Lengths in mm; y is 0 at the top of the time axis and negative below it.
const { tex } = require('../tex');
const { cut } = require('./cut');
const { textWidth, restOf } = require('./measure');
const { timeScale } = require('./scale');
const { schoolYears } = require('./page');
const { LANE_TITLE, MOON, fillOf, isEvening } = require('./picture');

const WIDTH = 190; // what the page leaves between its margins
const HEIGHT = 261; // the time axis
const AXIS = 8; // the years, left of the lanes
const LANE_GAP = 3.5;
const BAR = 1.5; // a bar's width, and the gap beside it
const GAP = 0.4;
const MIN_BAR = 0.9;
const FONT = 6;
const PITCH = 2.75; // between two labels
const MARK = 1.6; // the colour square before a label
const GUTTER = 1.2;

const mm = (n) => n.toFixed(2);

// Every bar of a lane that is drawn: heads, what they carried, a degree's years.
function barsOf(lane) {
  return lane.groups.flatMap(({ head, children, bands = [] }) => [
    { ...head, depth: 0, labelled: true },
    ...bands.map((b) => ({ ...b, depth: 1, labelled: false })),
    ...children.map((c) => ({ ...c, depth: 1, labelled: true })),
  ]);
}

// The first track of a lane whose last bar ended above this one's top.
function inTracks(bars) {
  const ends = [];
  return bars
    .toSorted((a, b) => b.y0 - a.y0 || a.depth - b.depth)
    .map((bar) => {
      let track = ends.findIndex((bottom) => bar.y0 <= bottom - GAP);
      if (track < 0) track = ends.length;
      ends[track] = bar.y1;
      return { ...bar, track };
    });
}

function layOut(timeline, { width = WIDTH, height = HEIGHT, measure = textWidth } = {}) {
  const all = timeline.lanes.flatMap(barsOf);
  const y = timeScale({
    from: timeline.from,
    to: timeline.to,
    track: height,
    spans: all,
    density: 0.6,
    squeeze: schoolYears(timeline),
  });
  // Time grows downwards from the top of the axis, so the newest is at 0.
  const yOf = (month) => y(month) - height;
  const lanes = timeline.lanes.map((lane) => {
    const bars = inTracks(
      barsOf(lane).map((b) => {
        const y0 = yOf(b.end + 1);
        return { ...b, y0, y1: Math.min(y0 - MIN_BAR, yOf(b.start)) };
      }),
    );
    const tracks = 1 + Math.max(...bars.map((b) => b.track));
    const text = (b) => ({
      strong: b.strong,
      rest: b.depth === 0 ? restOf(b) : '',
      width: measure(b.strong, true, FONT) + measure(b.depth === 0 ? restOf(b) : '', false, FONT),
    });
    const labelled = bars.filter((b) => b.labelled && b.strong).map((b) => ({ ...b, ...text(b) }));
    return {
      kind: lane.kind,
      bars,
      labelled,
      barsWidth: tracks * (BAR + GAP),
      want: Math.max(...labelled.map((b) => b.width + (isEvening(b) ? 3 : 0))),
    };
  });
  // What the bars leave of the width goes to the labels, by what they ask.
  const free =
    width -
    AXIS -
    LANE_GAP * (lanes.length - 1) -
    lanes.reduce((s, l) => s + l.barsWidth + GUTTER + MARK + 1, 0);
  const asked = lanes.reduce((s, l) => s + l.want, 0);
  let x = AXIS;
  const placed = lanes.map((lane) => {
    const room = Math.min(lane.want, (free * lane.want) / asked);
    const at = { ...lane, x, labelX: x + lane.barsWidth + GUTTER, room };
    x += lane.barsWidth + GUTTER + MARK + 1 + room + LANE_GAP;
    return at;
  });
  return {
    lanes: placed.map((lane) => ({ ...lane, labels: labelsOf(lane, height) })),
    years: yearsOf(timeline, yOf),
    height,
  };
}

// Labels in order of date, newest first, each as near its bar's top as the ones
// above allow.
function labelsOf(lane, height) {
  const pitch = Math.min(PITCH, (height - 2) / Math.max(1, lane.labelled.length));
  let last = Number.POSITIVE_INFINITY;
  return lane.labelled
    .toSorted((a, b) => b.y0 - a.y0 || a.depth - b.depth)
    .map((bar) => {
      const wanted = bar.y0 - pitch / 2;
      const y = Math.min(wanted, last - pitch);
      last = y;
      const strong = cut(bar.strong, lane.room - (isEvening(bar) ? 3 : 0), (t) =>
        textWidth(t, true, FONT),
      );
      const rest =
        strong === bar.strong
          ? cut(bar.rest, lane.room - textWidth(strong, true, FONT), (t) =>
              textWidth(t, false, FONT),
            )
          : '';
      return { bar, y, wanted, strong, rest };
    });
}

function yearsOf(timeline, yOf) {
  const years = [];
  for (let m = Math.floor(timeline.from / 12) + 1; m <= Math.floor(timeline.to / 12); m += 1)
    years.push({ year: m, y: yOf(m * 12) });
  return years;
}

// A year's number is about 2.5 mm tall: one closer than that to the last drawn
// keeps its line and leaves its number out, as the years of school are squeezed.
const LABEL_GAP = 3.4;
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
  const heading = [
    `\\draw[headingrule,line width=0.5pt] (${mm(lane.x)},4.5) -- (${mm(lane.x + lane.barsWidth + GUTTER + MARK + 1 + lane.room)},4.5);`,
    `\\node[anchor=south west,text=heading,font=\\fontsize{8}{9}\\selectfont\\bfseries] at (${mm(lane.x)},4.8) {${tex(t[LANE_TITLE[lane.kind]])}};`,
  ];
  const bars = lane.bars.map((b) => {
    const x0 = lane.x + b.track * (BAR + GAP);
    return `\\fill[${fillOf(b)},rounded corners=0.4mm] (${mm(x0)},${mm(b.y0)}) rectangle (${mm(x0 + BAR)},${mm(b.y1)});`;
  });
  const labels = lane.labels.flatMap(({ bar, y, wanted, strong, rest }) => {
    if (!strong) return [];
    const x0 = lane.x + bar.track * (BAR + GAP) + BAR;
    const out = [];
    // The label has been pushed away from its bar: a thin line joins them.
    if (Math.abs(y - wanted) > PITCH * 0.6)
      out.push(
        `\\draw[BodyColor!50,line width=0.2pt] (${mm(x0)},${mm(bar.y0 - 0.6)}) -- (${mm(lane.labelX - 0.2)},${mm(y)});`,
      );
    out.push(
      `\\fill[${fillOf(bar)}] (${mm(lane.labelX)},${mm(y - MARK / 2)}) rectangle (${mm(lane.labelX + MARK)},${mm(y + MARK / 2)});`,
      `\\node[anchor=west,text=EmphasisColor] at (${mm(lane.labelX + MARK + 0.8)},${mm(y)}) {${isEvening(bar) ? MOON : ''}${bar.kind === 'unit' ? tex(strong) : `\\textbf{${tex(strong)}}`}${rest ? tex(rest) : ''}};`,
    );
    return out;
  });
  return [...heading, ...bars, ...labels];
}

function buildUpright(sheet, t) {
  return [
    `\\begin{tikzpicture}[x=1mm,y=1mm,every node/.style={inner sep=0pt},font=\\fontsize{${FONT}}{${FONT + 1}}\\selectfont]`,
    ...yearLines(sheet),
    ...sheet.lanes.flatMap((lane) => laneLines(lane, t)),
    '\\end{tikzpicture}',
  ].join('\n');
}

module.exports = { layOut, buildUpright };

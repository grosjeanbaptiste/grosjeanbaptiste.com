// The timeline upright, for a portrait page: time runs up it (the oldest at
// the bottom, the newest at the top), each lane is a column of thin vertical
// bars, and every label is set level beside its lane, in order of date, joined
// to its bar by a thin line when the labels above it have pushed it down.
// Labels are never cut: a long one wraps onto more lines, and the page's width
// is shared among the lanes so that what each lane stacks fits its height.
// Lengths in mm; y is 0 at the top of the time axis and negative below it.
const { tex } = require('../tex');
const { textWidth } = require('./measure');
const { timeScale } = require('./scale');
const { schoolYears } = require('./page');
const { LANE_TITLE, MOON, OUTLINE, fillOf, isEvening } = require('./picture');

const WIDTH = 190; // what the page leaves between its margins
const HEIGHT = 236; // the time axis, under the header
const AXIS = 8; // the years, left of the lanes
const LANE_GAP = 3.5;
const BAR = 1.3; // a bar's width, and the gap beside it
const GAP = 0.3;
const MIN_BAR = 0.9;
const FONT = 5.5;
const LINE = 2.7; // between two lines of a label (5.5 pt: poppler boxes a line, accents included, 1.4 em tall)
const BETWEEN = 0.3; // between two labels
const MARK = 1.6; // the colour square before a label
const GUTTER = 1.2;
const MIN_ROOM = 18; // the least a lane's labels may be given
const STEP = 2; // what moves from one lane to another while sharing the width
const MOON_ROOM = 3;
// A line is set on its baseline — a node centred on its box moves with the
// accents in it — this far under the line's middle.
const BASE = 0.7;
const CEILING = 1.5; // the highest a label may reach: the lane's rule is above

const mm = (n) => n.toFixed(2);

// The bars of one group — an experience, a degree or a competition and what it
// carried: the head, a degree's years, the projects.
const barsOfGroup = ({ head, children, bands = [] }) => [
  { ...head, depth: 0, labelled: true },
  ...bands.map((b) => ({ ...b, depth: 1, labelled: false })),
  ...children.map((c) => ({ ...c, depth: 1, labelled: true })),
];
const barsOf = (lane) => lane.groups.flatMap(barsOfGroup);

// The first track whose last bar ended above this one's top, the newest first.
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

// A group keeps its head in its first track and what it carried in the tracks
// beside it; it is outlined when it carried something. Groups that do not meet
// in time share a column of the lane.
const PAD = 0.5;
function inGroups(groups, yOf, k) {
  const pitch = (BAR + GAP) * k;
  const placed = groups.map((group) => {
    const bars = barsOfGroup(group).map((b) => {
      const y0 = yOf(b.end + 1);
      return { ...b, y0, y1: Math.min(y0 - MIN_BAR, yOf(b.start)) };
    });
    const [head, ...carried] = bars;
    const inside = inTracks(carried).map((b) => ({ ...b, track: b.track + 1 }));
    const all = [{ ...head, track: 0 }, ...inside];
    return {
      bars: all,
      outlined: carried.length > 0,
      top: Math.max(...all.map((b) => b.y0)),
      bottom: Math.min(...all.map((b) => b.y1)),
      width: (1 + Math.max(0, ...inside.map((b) => b.track))) * pitch + 2 * PAD,
    };
  });
  const columns = [];
  for (const group of placed.toSorted((a, b) => b.top - a.top)) {
    let at = columns.findIndex((c) => group.top <= c.bottom - GAP);
    if (at < 0) at = columns.push({ width: 0 }) - 1;
    Object.assign(columns[at], {
      bottom: group.bottom,
      width: Math.max(columns[at].width, group.width),
    });
    group.column = at;
  }
  let x = 0;
  const offsets = columns.map((c) => {
    const at = x;
    x += c.width;
    return at;
  });
  for (const group of placed) {
    const left = offsets[group.column];
    for (const bar of group.bars) bar.dx = left + PAD + bar.track * pitch;
    group.x0 = left;
    group.x1 = left + group.width;
  }
  return { groups: placed, width: x };
}

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

// Labels in order of date, newest first, each as near its bar's top as the ones
// above allow. What comes of it: the labels, how far they sit from their bars,
// and how far below the axis the last one ends.
function placeLabels(lane, room, names, height) {
  let last = Number.POSITIVE_INFINITY;
  const labels = lane.labelled.map((bar) => {
    const lines = wrap(wordsOf(bar, names, lane.told), room, isEvening(bar) ? MOON_ROOM : 0);
    const top = Math.min(bar.y0, last);
    last = top - lines.length * LINE - BETWEEN;
    return { bar, lines, top };
  });
  // The oldest labels would hang below the axis: they are lifted back, and
  // lift the ones above them.
  let floor = -height;
  for (const label of labels.toReversed()) {
    label.top = Math.max(label.top, floor + label.lines.length * LINE);
    floor = label.top + BETWEEN;
  }
  const moved = labels.reduce((sum, l) => sum + Math.abs(l.bar.y0 - l.top), 0);
  // How far the lane goes beyond the axis, at either end.
  const over = Math.max(0, (labels[0]?.top ?? 0) - CEILING);
  return { labels, moved, over };
}

// What a way of sharing the width costs: how far the lanes overflow their
// height, then how far labels sit from their bars.
const OVERFLOW = 100;
const costOf = (lanes, rooms, names, height) =>
  lanes.reduce((sum, lane, i) => {
    const { moved, over } = placeLabels(lane, rooms[i], names, height);
    return sum + moved + OVERFLOW * over;
  }, 0);

// Moves width between lanes while that makes the page cost less.
function shareWidth(lanes, free, names, height) {
  // Start from each lane's share of the labels: the busiest has the most to say.
  const labels = lanes.reduce((sum, l) => sum + l.labelled.length, 0);
  const rooms = lanes.map((l) => Math.max(MIN_ROOM, (free * l.labelled.length) / labels));
  let cost = costOf(lanes, rooms, names, height);
  for (let improved = true; improved; ) {
    improved = false;
    for (const from of rooms.keys())
      for (const to of rooms.keys()) {
        if (from === to || rooms[from] - STEP < MIN_ROOM) continue;
        const moved = rooms.map((r, i) => r + (i === to ? STEP : i === from ? -STEP : 0));
        const next = costOf(lanes, moved, names, height);
        if (next < cost - 1e-6) {
          rooms.splice(0, rooms.length, ...moved);
          cost = next;
          improved = true;
        }
      }
  }
  return { rooms, cost };
}

function layOut(timeline, { width = WIDTH, height = HEIGHT } = {}) {
  const spans = timeline.lanes.flatMap(barsOf);
  const y = timeScale({
    from: timeline.from,
    to: timeline.to,
    track: height,
    spans,
    density: 0.6,
    squeeze: schoolYears(timeline),
  });
  // Time grows downwards from the top of the axis, so the newest is at 0.
  const yOf = (month) => y(month) - height;
  // Bars are drawn at their full width; a timeline whose groups all meet in time
  // (a short span) narrows them until the labels have room.
  const attempt = (k) => {
    const lanes = timeline.lanes.map((lane) => {
      const { groups, width: barsWidth } = inGroups(lane.groups, yOf, k);
      const bars = groups.flatMap((g) => g.bars);
      const heads = bars.filter((b) => b.depth === 0).map((b) => b.strong);
      const twice = new Set(heads.filter((name, i) => heads.indexOf(name) !== i));
      return {
        kind: lane.kind,
        // 0: every role; 1: the roles of degrees and of names met twice; 2: the
        // latter only.
        told: (bar, level) =>
          level === 0 || twice.has(bar.strong) || (level === 1 && bar.kind === 'education'),
        groups,
        bars,
        labelled: bars
          .filter((b) => b.labelled && b.strong)
          .toSorted((a, b) => b.y0 - a.y0 || b.dx - a.dx || a.depth - b.depth),
        barsWidth,
      };
    });
    const free =
      width -
      AXIS -
      LANE_GAP * (lanes.length - 1) -
      lanes.reduce((s, l) => s + l.barsWidth + GUTTER + MARK + 1, 0);
    // Full labels first; the names alone when no sharing of the width holds them.
    const plans = [0, 1, 2].map((names) => ({
      names,
      ...shareWidth(lanes, free, names, height),
    }));
    const holds = (p) =>
      lanes.every((lane, i) => placeLabels(lane, p.rooms[i], p.names, height).over === 0);
    const plan = plans.find(holds);
    return plan ? { lanes, plan, k } : null;
  };
  const made = [1, 0.8, 0.65, 0.5].map(attempt).find(Boolean);
  if (!made) throw new Error(`the upright timeline does not fit its page`);
  const { lanes, plan, k } = made;
  let x = AXIS;
  const placed = lanes.map((lane, i) => {
    const room = plan.rooms[i];
    const at = {
      ...lane,
      x,
      room,
      bar: BAR * k,
      labelX: x + lane.barsWidth + GUTTER,
      ...placeLabels(lane, room, plan.names, height),
    };
    x += lane.barsWidth + GUTTER + MARK + 1 + room + LANE_GAP;
    return at;
  });
  return {
    lanes: placed,
    years: yearsOf(timeline, yOf),
    height,
    labels: plan.names ? 'names' : 'full',
  };
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
  return [...heading, ...outlines, ...bars, ...labels];
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

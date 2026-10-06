// The sheet of the timeline on the verso of the vertical CV. The landscape PDF
// (page.js) gives every label its own room, which costs rows; here the page has
// a third of that height. So the rows are the screen's — packed by time
// (lib/timeline-model.js) — and each bar carries its name alone, as on screen,
// fitted where there is room: inside the bar, else after it, else before it,
// else cut short in the widest of the three. Lengths in mm, y downwards from
// the axis as in page.js; the result is drawn by picture.js like any sheet.
const { textWidth } = require('./measure');
const { timeScale } = require('./scale');

const AXIS = 5;
const LANE_GAP = 2;
const GAP = 1; // kept clear between a label and its neighbour
const PAD = 1; // between a label and the edge of its bar
const SHORTEST = 3; // characters, the ellipsis included: under that, no label

// The longest beginning of `text` that fits `room`, marked as cut; '' if none.
function cut(text, room, measure) {
  if (measure(text) <= room) return text;
  const chars = [...text];
  for (let n = chars.length - 1; n >= SHORTEST - 1; n -= 1) {
    const candidate = `${chars.slice(0, n).join('').trimEnd()}…`;
    if (measure(candidate) <= room) return candidate;
  }
  return '';
}

// Where a label of `width` goes in a slot, and what it then occupies.
const PLACED = {
  inside: (bar) => ({ x: bar.x0 + PAD, from: bar.x0, to: bar.x1 }),
  right: (bar, width) => ({ x: bar.x1 + PAD, from: bar.x0, to: bar.x1 + PAD + width }),
  left: (bar, width) => ({ x: bar.x0 - PAD, from: bar.x0 - PAD - width, to: bar.x1 }),
};

// The room each slot offers a bar: inside it, after it up to the next thing on
// its row, before it back to the previous one.
function slotsOf(bar, before, after) {
  return [
    { place: 'inside', room: bar.x1 - bar.x0 - 2 * PAD },
    { place: 'right', room: after - GAP - (bar.x1 + PAD) },
    { place: 'left', room: bar.x0 - PAD - (before + GAP) },
  ];
}

// A block of a degree is one segment in a row of segments: its label stays
// inside it — with the programme's name when it fits, the year alone otherwise.
function blockLabelled(bar, inside, measure) {
  const strong =
    [bar.caption ?? bar.name, bar.name].find((text) => measure(text) <= inside.room) ?? '';
  return {
    ...bar,
    strong,
    rest: '',
    clipped: false,
    label: { place: 'inside', ...PLACED.inside(bar) },
  };
}

function labelled(bar, slots, measure) {
  if (bar.kind === 'block') return blockLabelled(bar, slots[0], measure);
  // What the bar reads: its name, with its title when a namesake shares the lane.
  const text = bar.caption ?? bar.name;
  const width = measure(text);
  const fits = slots.find((slot) => width <= slot.room);
  const slot = fits ?? [...slots].sort((a, b) => b.room - a.room)[0];
  const strong = fits ? text : cut(text, slot.room, measure);
  const label = { place: slot.place, ...PLACED[slot.place](bar, strong ? measure(strong) : 0) };
  return { ...bar, strong, rest: '', clipped: false, label };
}

// One lane: bars placed by their months, then named row by row from the left,
// each label kept off the bars of its row, off the labels already written
// there, and out of the outlines of the groups it does not belong to.
function laneOf(lane, x, track, measure) {
  const outlines = lane.groups.map((g) => ({ ...g, x0: x(g.start), x1: x(g.end + 1) }));
  const placed = lane.bars.map((b) => ({ ...b, x0: x(b.start), x1: x(b.end + 1) }));
  const written = new Map(); // row → how far the labels written on it reach
  const bars = [...placed]
    .sort((a, b) => a.x0 - b.x0)
    .map((bar) => {
      const others = [
        ...placed.filter((b) => b !== bar && b.row === bar.row),
        ...outlines.filter(
          (o) => o.group !== bar.group && o.row <= bar.row && bar.row < o.row + o.rows,
        ),
      ];
      const before = Math.max(
        0,
        written.get(bar.row) ?? 0,
        ...others.filter((o) => o.x1 <= bar.x0).map((o) => o.x1),
      );
      const after = Math.min(track + GAP, ...others.filter((o) => o.x0 >= bar.x1).map((o) => o.x0));
      const named = labelled(bar, slotsOf(bar, before, after), measure);
      written.set(bar.row, Math.max(written.get(bar.row) ?? 0, named.label.to));
      return named;
    });
  return {
    kind: lane.kind,
    rows: lane.rows,
    bars,
    outlines: outlines.map(({ x0, x1, row, rows }) => ({ x0, x1, row, rows })),
  };
}

// `track`: the width of the time axis. `pitch`: the height of a row.
// `density`: the share of the width given to the years by what they hold
// rather than by time (./scale.js); 0 draws time to scale.
function layOutCompact(model, { track, pitch = 3.2, font = 6, measure, density = 0 } = {}) {
  const width = measure ?? ((text) => textWidth(text, true, font));
  const x = timeScale({
    from: model.from,
    to: model.from + model.months - 1,
    track,
    spans: model.lanes.flatMap((lane) => lane.bars),
    density,
  });
  let top = -AXIS;
  const lanes = model.lanes.map((lane) => {
    const at = { ...laneOf(lane, x, track, width), top };
    top -= lane.rows * pitch + LANE_GAP;
    return at;
  });
  const years = model.years.map(({ year, month }) => ({ year, x: x(month) }));
  return {
    lanes,
    height: -top,
    years,
    pitch,
    bar: pitch * 0.78,
    font,
    axis: AXIS,
    labels: 'names',
  };
}

module.exports = { layOutCompact };

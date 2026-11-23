// The timeline upright, for a portrait page: time runs up it (the oldest at
// the bottom, the newest at the top), each lane is a column of thin vertical
// bars, and every label is set level beside its lane, in order of date, joined
// to its bar by a thin line when the labels above it have pushed it down.
// Labels are never cut: a long one wraps onto more lines, and the page's width
// is shared among the lanes so that what each lane stacks fits its height.
// Lengths in mm; y is 0 at the top of the time axis and negative below it.
const { timeScale } = require('./scale');
const { schoolYears } = require('./page');
const { isEvening } = require('./picture');
const { wordsOf, wrap } = require('./upright-text');
const { barsOf, inGroups } = require('./upright-groups');
const { buildUpright } = require('./upright-draw');
const {
  WIDTH,
  HEIGHT,
  AXIS,
  LANE_GAP,
  BAR,
  LINE,
  BETWEEN,
  GUTTER,
  MARK,
  MIN_ROOM,
  STEP,
  MOON_ROOM,
  CEILING,
} = require('./upright-metrics');

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
    density: 0.8,
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
          .toSorted(
            (a, b) =>
              b.y0 - a.y0 ||
              (b.umbrella ? 1 : 0) - (a.umbrella ? 1 : 0) ||
              b.dx - a.dx ||
              a.depth - b.depth,
          ),
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
  if (!made) throw new Error('the upright timeline does not fit its page');
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

module.exports = { layOut, buildUpright };

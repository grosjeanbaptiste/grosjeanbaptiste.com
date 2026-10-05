// The sheet: the timeline scaled to the width of an A4 landscape page, lanes
// stacked under the year axis. Lengths in mm; y grows upwards from the axis, so
// everything below it is negative. The type is the largest that still fits —
// a larger type makes longer labels, so more rows — and a timeline that fits in
// none is refused: TeX would not break the picture across pages, it would cut
// it off.
const { packGroupsOnPaper } = require('./rows');
const { labelWidth, MM_PER_PT } = require('./measure');

const TRACK = 248; // the time axis, right of the lane titles
const HEIGHT = 170; // what the page leaves under the header
const AXIS = 5;
const LANE_GAP = 3;
const SIZES = [8, 7.5, 7, 6.5, 6]; // pt, largest first
// A row at its tightest: the type and two thirds as much again around it. It
// was twice the type; nested under their entries, the bars of the whole career
// then needed 182 mm of a 170 mm page.
const PITCH_PER_PT = MM_PER_PT * 1.65;
const MAX_SPREAD = 1.4; // how far rows may be spaced out to fill the page

function lanesAt(timeline, x, size, measure, track) {
  const scale = { x, labelWidth: (bar) => measure(bar, size), trackEnd: track };
  return timeline.lanes.map((lane) => ({
    kind: lane.kind,
    ...packGroupsOnPaper(lane.groups, scale),
  }));
}

function stack(lanes, pitch) {
  let top = -AXIS;
  const placed = lanes.map((lane) => {
    const at = { ...lane, top };
    top -= lane.rows * pitch + LANE_GAP;
    return at;
  });
  return { lanes: placed, height: -top };
}

// What the labels say, fullest first: "name · role", then — when no type fits
// that on the page — the names alone, which need fewer rows.
const namesOnly = (timeline) => ({
  ...timeline,
  lanes: timeline.lanes.map((lane) => ({
    ...lane,
    groups: lane.groups.map(({ head, children }) => ({ head: { ...head, rest: '' }, children })),
  })),
});
const PLANS = [
  { labels: 'full', of: (timeline) => timeline },
  { labels: 'names', of: namesOnly },
];

const yearsOf = (timeline, x) => {
  const years = [];
  for (let y = Math.floor(timeline.from / 12) + 1; y <= Math.floor(timeline.to / 12); y += 1)
    years.push({ year: y, x: x(y * 12) });
  return years;
};

// `track` and `height` (mm): the room the sheet gives the picture — a landscape
// page of its own by default, less on the verso of the vertical CV. The sheet
// says which labels it carries (`labels`), for the caller to report a reduction.
function layOut(timeline, { measure = labelWidth, track = TRACK, height = HEIGHT } = {}) {
  const months = timeline.to + 1 - timeline.from;
  const x = (month) => ((month - timeline.from) / months) * track;
  const room = height - AXIS - LANE_GAP * timeline.lanes.length;
  for (const plan of PLANS) {
    const worded = plan.of(timeline);
    for (const size of SIZES) {
      const lanes = lanesAt(worded, x, size, measure, track);
      const rows = lanes.reduce((sum, lane) => sum + lane.rows, 0);
      const tightest = size * PITCH_PER_PT;
      if (rows * tightest > room) continue;
      const pitch = Math.min(room / rows, tightest * MAX_SPREAD);
      const drawn = { pitch, bar: pitch * 0.78, font: size, axis: AXIS, labels: plan.labels };
      return { ...stack(lanes, pitch), years: yearsOf(timeline, x), ...drawn };
    }
  }
  throw new Error(
    `The timeline does not fit on one page (${height} mm), even with names alone in ${SIZES.at(-1)} pt type`,
  );
}

module.exports = { layOut, TRACK };

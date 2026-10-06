// The sheet: the timeline scaled to the width of an A4 landscape page, lanes
// stacked under the year axis. Lengths in mm; y grows upwards from the axis, so
// everything below it is negative. The type is the largest that still fits —
// a larger type makes longer labels, so more rows — and a timeline that fits in
// none is refused: TeX would not break the picture across pages, it would cut
// it off.
const { packGroupsOnPaper } = require('./rows');
const { labelWidth, MM_PER_PT } = require('./measure');
const { timeScale } = require('./scale');
const { readable, isUnit } = require('./units');

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

function lanesAt(timeline, x, size, measure, track, units) {
  const scale = { x, labelWidth: (bar) => measure(bar, size), trackEnd: track, units };
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
// Two entries of one name keep their role even then: it tells them apart.
// `degrees`: a degree keeps its title too — the school alone does not say
// what was studied.
const namesOnly = (degrees) => (timeline) => ({
  ...timeline,
  lanes: timeline.lanes.map((lane) => {
    const met = (name) => lane.groups.filter((g) => g.head.strong === name).length;
    const keeps = (head) => (degrees && head.kind === 'education') || met(head.strong) > 1;
    return {
      ...lane,
      groups: lane.groups.map((group) => ({
        ...group,
        head: keeps(group.head) ? group.head : { ...group.head, rest: '' },
      })),
    };
  }),
});
// A degree's course units are kept as long as anything fits with them: the
// roles go first. Without them the sheet is the one it always was.
const PLANS = [
  { labels: 'full', of: (timeline) => timeline, units: true },
  { labels: 'names', of: namesOnly(true), units: true },
  { labels: 'full', of: (timeline) => timeline, units: false },
  { labels: 'names', of: namesOnly(true), units: false },
  // Last, the degrees by their school alone.
  { labels: 'names', of: namesOnly(false), units: false },
];
const hasUnits = (timeline) =>
  timeline.lanes.some((l) => l.groups.some((g) => (g.bands ?? []).some((b) => b.units?.length)));

const yearsOf = (timeline, x) => {
  const years = [];
  for (let y = Math.floor(timeline.from / 12) + 1; y <= Math.floor(timeline.to / 12); y += 1)
    years.push({ year: y, x: x(y * 12) });
  return years;
};

// 'drawn', 'dropped' (the caller says so) or 'none' (the CV has none).
function unitsOn(lanes, timeline) {
  if (lanes.some((l) => l.bars.some(isUnit))) return 'drawn';
  return hasUnits(timeline) ? 'dropped' : 'none';
}

// One plan in the largest type that fits `room`; undefined when none does.
function fitted(plan, timeline, { x, measure, track, room }) {
  const worded = plan.of(timeline);
  for (const size of SIZES) {
    const lanes = lanesAt(worded, x, size, measure, track, plan.units);
    // Units in a year too narrow to read them are not worth their rows.
    if (plan.units && !readable(lanes)) return undefined;
    const rows = lanes.reduce((sum, lane) => sum + lane.rows, 0);
    const tightest = size * PITCH_PER_PT;
    if (rows * tightest > room) continue;
    const pitch = Math.min(room / rows, tightest * MAX_SPREAD);
    const drawn = { pitch, bar: pitch * 0.78, font: size, axis: AXIS, labels: plan.labels };
    return { ...stack(lanes, pitch), ...drawn, units: unitsOn(lanes, timeline) };
  }
  return undefined;
}

// `track` and `height` (mm): the room the sheet gives the picture — a landscape
// page of its own by default, less on the verso of the vertical CV. The sheet
// says which labels it carries (`labels`) and whether it drew the course units
// (`units`), for the caller to report a reduction.
// `density`: the share of the width given to the years by what they hold
// rather than by time (./scale.js); 0 draws time to scale.
function layOut(
  timeline,
  { measure = labelWidth, track = TRACK, height = HEIGHT, density = 0 } = {},
) {
  const spans = timeline.lanes.flatMap((lane) =>
    lane.groups.flatMap((g) => [g.head, ...(g.bands ?? []), ...g.children]),
  );
  const x = timeScale({ from: timeline.from, to: timeline.to, track, spans, density });
  const room = height - AXIS - LANE_GAP * timeline.lanes.length;
  for (const plan of PLANS) {
    const sheet = fitted(plan, timeline, { x, measure, track, room });
    if (sheet) return { ...sheet, years: yearsOf(timeline, x) };
  }
  throw new Error(
    `The timeline does not fit on one page (${height} mm), even with names alone in ${SIZES.at(-1)} pt type`,
  );
}

module.exports = { layOut, TRACK };

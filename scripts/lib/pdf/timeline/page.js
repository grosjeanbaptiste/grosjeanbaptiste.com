// The sheet: the timeline scaled to the width of an A4 landscape page, lanes
// stacked under the year axis. Lengths in mm; y grows upwards from the axis, so
// everything below it is negative. The type is the largest that still fits —
// a larger type makes longer labels, so more rows — and a timeline that fits in
// none is refused: TeX would not break the picture across pages, it would cut
// it off.
const { packLane } = require('./rows');
const { labelWidth, MM_PER_PT } = require('./measure');

const TRACK = 248; // the time axis, right of the lane titles
const HEIGHT = 170; // what the page leaves under the header
const AXIS = 5;
const LANE_GAP = 3;
const SIZES = [8, 7.5, 7, 6.5, 6]; // pt, largest first
const PITCH_PER_PT = MM_PER_PT * 2; // a row: the type and as much again around it
const MAX_SPREAD = 1.4; // how far rows may be spaced out to fill the page

function lanesAt(timeline, x, size, measure) {
  const scale = { x, labelWidth: (bar) => measure(bar, size), trackEnd: TRACK };
  return timeline.lanes.map((lane) => {
    const bars = packLane(lane.bars, scale);
    return { kind: lane.kind, rows: Math.max(...bars.map((bar) => bar.row)) + 1, bars };
  });
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

function layOut(timeline, measure = labelWidth) {
  const months = timeline.to + 1 - timeline.from;
  const x = (month) => ((month - timeline.from) / months) * TRACK;
  const room = HEIGHT - AXIS - LANE_GAP * timeline.lanes.length;
  for (const size of SIZES) {
    const lanes = lanesAt(timeline, x, size, measure);
    const rows = lanes.reduce((sum, lane) => sum + lane.rows, 0);
    const tightest = size * PITCH_PER_PT;
    if (rows * tightest > room) continue;
    const pitch = Math.min(room / rows, tightest * MAX_SPREAD);
    const years = [];
    for (
      let year = Math.floor(timeline.from / 12) + 1;
      year <= Math.floor(timeline.to / 12);
      year++
    ) {
      years.push({ year, x: x(year * 12) });
    }
    return { ...stack(lanes, pitch), years, pitch, bar: pitch * 0.78, font: size, axis: AXIS };
  }
  throw new Error(`The timeline does not fit on one page, even in ${SIZES.at(-1)} pt type`);
}

module.exports = { layOut, TRACK };

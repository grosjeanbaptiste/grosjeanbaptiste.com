// A degree's course units on paper: one bar each under the block — the
// academic year — they were taken in, as wide as it, stacked; the units of two
// blocks share rows. A unit is named inside its bar, cut to it when longer.
const { cut } = require('./cut');

const PAD = 1.2; // mm between a name and the edge of its bar
// Under this width (mm) a year holds no name worth reading.
const READABLE = 20;

// `bands`: the blocks as laid on paper (x0, x1), each with its `units`. Rows
// count from the first one under the blocks.
function unitsOnPaper(bands, scale) {
  return bands.flatMap((band) =>
    // A block the span cut down to a sliver keeps its segment, not its units.
    (band.clipped && band.x1 - band.x0 < READABLE ? [] : band.units || []).map((unit, row) => {
      const room = band.x1 - band.x0 - 2 * PAD;
      const strong = cut(unit.strong, room, (text) => scale.labelWidth({ ...unit, strong: text }));
      return {
        ...unit,
        strong,
        x0: band.x0,
        x1: band.x1,
        row,
        label: { place: 'inside', x: band.x0 + PAD, from: band.x0, to: band.x1 },
      };
    }),
  );
}

const isUnit = (bar) => bar.kind === 'unit';
// Whether every unit drawn on these lanes sits in a year wide enough to read.
const readable = (lanes) =>
  lanes.every((lane) => lane.bars.filter(isUnit).every((bar) => bar.x1 - bar.x0 >= READABLE));

module.exports = { unitsOnPaper, readable, isUnit };

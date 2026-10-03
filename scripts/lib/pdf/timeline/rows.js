// Packs one lane's bars into rows by what each occupies on paper: the bar and
// its label together. A label is written inside its bar when it fits, after it
// otherwise — or before it, when after would run past the end of the track.

const GAP = 1; // mm kept clear between two neighbours on a row
const PAD = 1.2; // mm between a label and the edge of its bar

function labelOf(x0, x1, width, trackEnd) {
  if (width + 2 * PAD <= x1 - x0) return { place: 'inside', x: x0 + PAD, from: x0, to: x1 };
  if (x1 + PAD + width <= trackEnd)
    return { place: 'right', x: x1 + PAD, from: x0, to: x1 + PAD + width };
  return { place: 'left', x: x0 - PAD, from: x0 - PAD - width, to: x1 };
}

// scale.x maps a month to mm; a bar covers its whole last month, hence end + 1.
function packLane(bars, scale) {
  const rowEnds = [];
  return bars
    .map((bar) => {
      const x0 = scale.x(bar.start);
      const x1 = scale.x(bar.end + 1);
      return { ...bar, x0, x1, label: labelOf(x0, x1, scale.labelWidth(bar), scale.trackEnd) };
    })
    .sort((a, b) => a.label.from - b.label.from)
    .map((bar) => {
      let row = rowEnds.findIndex((end) => end + GAP <= bar.label.from);
      if (row === -1) row = rowEnds.length;
      rowEnds[row] = bar.label.to;
      return { ...bar, row };
    });
}

module.exports = { packLane };

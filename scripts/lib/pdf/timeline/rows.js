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

// A lane of groups — an entry with what it carried under it. Each group is a
// block: the entry on its first row, what it carried packed on the rows below,
// as wide as its bars and their labels together. Blocks are then stacked: a
// group takes the first rows free over its whole width. Gives the bars with
// their row and depth, the rows used, and an outline per group that carried
// something.
function packGroupsOnPaper(groups, scale) {
  const blocks = groups.map(({ head, children }) => {
    const [top] = packLane([head], scale);
    const under = packLane(children, scale);
    const all = [top, ...under];
    return {
      top,
      under,
      from: Math.min(...all.map((b) => b.label.from)),
      to: Math.max(...all.map((b) => b.label.to)),
      height: 1 + (under.length ? Math.max(...under.map((b) => b.row)) + 1 : 0),
    };
  });
  const rowEnds = [];
  const free = (row, block) => rowEnds[row] === undefined || rowEnds[row] + GAP <= block.from;
  const fits = (at, block) =>
    Array.from({ length: block.height }, (_, i) => at + i).every((row) => free(row, block));
  const bars = [];
  const outlines = [];
  for (const block of [...blocks].sort((a, b) => a.from - b.from)) {
    let at = 0;
    while (!fits(at, block)) at += 1;
    for (let i = 0; i < block.height; i += 1) rowEnds[at + i] = block.to;
    bars.push({ ...block.top, row: at, depth: 0 });
    for (const b of block.under) bars.push({ ...b, row: at + 1 + b.row, depth: 1 });
    if (block.under.length)
      outlines.push({ x0: block.from, x1: block.to, row: at, rows: block.height });
  }
  return { bars, outlines, rows: rowEnds.length };
}

module.exports = { packLane, packGroupsOnPaper };

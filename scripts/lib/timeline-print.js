// The timeline as the pages carry it: laid out for the screen, course units
// included, and — for each bar, lane and outline — where it sits on paper,
// where the units are left out and the rows close up. A browser cannot pack
// rows, so both layouts are computed here and the print sheet picks its own.
const { timelineOf } = require('./timeline-model');

// The two layouts list the same bars in the same order, units aside. Were that
// ever untrue a bar would be printed on another's row: refused, not drawn.
function onPaper(lane, bare) {
  const kept = lane.bars.filter((bar) => bar.kind !== 'unit');
  const same =
    kept.length === bare.bars.length &&
    lane.groups.length === bare.groups.length &&
    kept.every((bar, i) => bar.name === bare.bars[i].name && bar.start === bare.bars[i].start);
  if (!same) throw new Error(`The ${lane.kind} lane prints other bars than it shows`);
  const printRow = new Map(kept.map((bar, i) => [bar, bare.bars[i].row]));
  return {
    ...lane,
    printRows: bare.rows,
    bars: lane.bars.map((bar) => ({ ...bar, printRow: printRow.get(bar) })),
    groups: lane.groups.map((group, i) => ({
      ...group,
      printRow: bare.groups[i].row,
      printRows: bare.groups[i].rows,
    })),
  };
}

function withPrintRows(resume, today) {
  const screen = timelineOf(resume, today);
  const bare = timelineOf(resume, today, { units: false });
  return { ...screen, lanes: screen.lanes.map((lane, i) => onPaper(lane, bare.lanes[i])) };
}

module.exports = { withPrintRows };

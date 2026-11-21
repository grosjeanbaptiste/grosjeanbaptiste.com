// The timeline as the pages carry it: laid out for the screen, course units
// included, and — for each bar, lane and outline — where it sits on paper,
// where the units are left out and the rows close up (and, for a phone, where
// the parts of a family of projects are folded into its bar). A browser cannot pack
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

// The parts of a family of projects (OpenActe) on a phone: the family's bar says
// them all, they are hidden and the rows close up. A part is a bar naming a
// family of its own group; each other bar keeps the row of the folded layout.
// A lane whose two layouts do not list the same bars keeps all of its own.
const isPart = (lane, bar) =>
  Boolean(bar.partOf) &&
  lane.bars.some((o) => o !== bar && o.name === bar.partOf && o.group === bar.group);

function onPhone(lane, fold) {
  const kept = lane.bars.filter((bar) => !isPart(lane, bar));
  const key = (bar) => `${bar.kind}|${bar.name}|${bar.start}`;
  const rowOf = new Map(fold.bars.map((bar) => [key(bar), bar.row]));
  const same =
    kept.length === fold.bars.length &&
    lane.groups.length === fold.groups.length &&
    kept.every((bar) => rowOf.has(key(bar)));
  if (!same)
    return {
      ...lane,
      foldRows: lane.rows,
      bars: lane.bars.map((bar) => ({ ...bar, foldRow: bar.row })),
      groups: lane.groups.map((g) => ({ ...g, foldRow: g.row, foldRows: g.rows })),
    };
  return {
    ...lane,
    foldRows: fold.rows,
    bars: lane.bars.map((bar) =>
      isPart(lane, bar) ? { ...bar, part: true } : { ...bar, foldRow: rowOf.get(key(bar)) },
    ),
    groups: lane.groups.map((group, i) => ({
      ...group,
      foldRow: fold.groups[i].row,
      foldRows: fold.groups[i].rows,
    })),
  };
}

function withPrintRows(resume, today) {
  const screen = timelineOf(resume, today);
  const bare = timelineOf(resume, today, { units: false });
  const fold = timelineOf(resume, today, { fold: true });
  return {
    ...screen,
    lanes: screen.lanes.map((lane, i) => onPhone(onPaper(lane, bare.lanes[i]), fold.lanes[i])),
  };
}

module.exports = { withPrintRows };

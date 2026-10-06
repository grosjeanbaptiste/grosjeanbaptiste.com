// Query: the timeline of the classic page and the XSLT themes, built at
// generation time. A lane for the experiences, one for the degrees, one for
// the competitions; each entry is a group — the entry on its first row, and
// under it the projects and the volunteering it carried (timeline-groups.js),
// which are not lanes of their own. Only a project or a role that nothing
// hosts keeps a lane. Rows are packed by time: on screen a label is clipped to
// its bar.
const { entryGroups, monthNow } = require('./timeline-groups');
const { packRows, packGroups } = require('./timeline-packing');

// A group as the packer wants it: its span, and the rows it needs.
function measured({ head, children }) {
  const packed = packRows(children);
  const all = [head, ...packed];
  return {
    head,
    children: packed,
    start: Math.min(...all.map((b) => b.start)),
    end: Math.max(...all.map((b) => b.end)),
    height: 1 + (packed.length ? Math.max(...packed.map((c) => c.row)) + 1 : 0),
  };
}

// A lane: its groups packed into rows, then flattened into bars (depth 0 for
// the entry, 1 for what sits under it) and the outlines of the real groups.
function laneOf({ kind, groups }) {
  const packed = packGroups(groups.map(measured));
  // An employer met twice gives two entries of one name: their title is then
  // what tells their bars apart.
  const met = (name) => packed.groups.filter((g) => g.head.name === name).length;
  const captionOf = (head) =>
    met(head.name) > 1 && head.title ? `${head.name} · ${head.title}` : head.name || head.title;
  // `group`: what ties a bar to the outline of its own group. `caption`: what
  // the bar reads.
  const bars = packed.groups.flatMap((g, group) => [
    { ...g.head, caption: captionOf(g.head), depth: 0, row: g.row, group },
    ...g.children.map((c) => ({
      ...c,
      caption: c.name || c.title,
      depth: 1,
      row: g.row + 1 + c.row,
      host: g.head,
      group,
    })),
  ]);
  const outlines = packed.groups
    .map((g, group) => ({ start: g.start, end: g.end, row: g.row, rows: g.height, group, g }))
    .filter(({ g }) => g.children.length)
    .map(({ g, ...outline }) => outline);
  return { kind, rows: packed.rows, bars, groups: outlines };
}

function timelineOf(resume, today) {
  const now = monthNow(today);
  const lanes = entryGroups(resume, now).map(laneOf);
  // The axis starts with the month of the earliest bar, which may start mid-month.
  const from = Math.floor(Math.min(now, ...lanes.flatMap((l) => l.bars.map((b) => b.start))));
  const years = [];
  for (let year = Math.floor(from / 12) + 1; year <= Math.floor(now / 12); year += 1)
    years.push({ year, month: year * 12 });
  return { from, months: now + 1 - from, years, lanes };
}

module.exports = { timelineOf };

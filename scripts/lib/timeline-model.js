// Query: the timeline of the classic page and the XSLT themes, built at
// generation time. A lane for the experiences, one for the degrees, one for
// the competitions; each entry is a group — the entry on its first row, and
// under it the projects and the volunteering it carried (timeline-groups.js),
// which are not lanes of their own. Only a project or a role that nothing
// hosts keeps a lane. Rows are packed by time: on screen a label is clipped to
// its bar.
const { entryGroups, monthNow } = require('./timeline-groups');
const { packRows, packGroups } = require('./timeline-packing');

// A group as the packer wants it: its span, and the rows it needs — the entry,
// then its blocks on one row (a degree's academic years), the course units of
// each block stacked under it, then what the entry carried.
const measured = (options) =>
  function measure({ head, children, blocks = [] }) {
    const packed = packRows(children);
    const all = [head, ...blocks, ...packed];
    const band = blocks.length ? 1 : 0;
    const units = options.units === false ? 0 : Math.max(0, ...blocks.map((b) => b.units.length));
    return {
      head,
      blocks,
      band,
      units,
      children: packed,
      start: Math.min(...all.map((b) => b.start)),
      end: Math.max(...all.map((b) => b.end)),
      height: 1 + band + units + (packed.length ? Math.max(...packed.map((c) => c.row)) + 1 : 0),
    };
  };

// What sits under an entry: `group` ties a bar to the outline of its own
// group, `caption` is what the bar reads.
const under = (g, group) => [
  ...g.blocks.map(({ units, ...b }) => ({
    ...b,
    caption: b.title ? `${b.name} · ${b.title}` : b.name,
    depth: 1,
    row: g.row + 1,
    host: g.head,
    group,
  })),
  // The units of two blocks share rows: they are never in the same year.
  ...(g.units ? g.blocks.flatMap((b) => b.units) : []).map((u) => ({
    ...u,
    depth: 1,
    row: g.row + 2 + u.slot,
    host: g.head,
    group,
  })),
  ...g.children.map((c) => ({
    ...c,
    caption: c.name || c.title,
    depth: 1,
    row: g.row + 1 + g.band + g.units + c.row,
    host: g.head,
    group,
  })),
];

// A lane: its groups packed into rows, then flattened into bars (depth 0 for
// the entry, 1 for what sits under it) and the outlines of the real groups.
const laneOf = (options) =>
  function lane({ kind, groups }) {
    const packed = packGroups(groups.map(measured(options)));
    // An employer met twice gives two entries of one name: their title is then
    // what tells their bars apart.
    const met = (name) => packed.groups.filter((g) => g.head.name === name).length;
    // A degree always reads with its title: the school alone does not say what
    // was studied.
    const captionOf = (head) =>
      head.title && (head.kind === 'education' || met(head.name) > 1)
        ? `${head.name} · ${head.title}`
        : head.name || head.title;
    const bars = packed.groups.flatMap((g, group) => [
      { ...g.head, caption: captionOf(g.head), depth: 0, row: g.row, group },
      ...under(g, group),
    ]);
    const outlines = packed.groups
      .map((g, group) => ({ start: g.start, end: g.end, row: g.row, rows: g.height, group, g }))
      .filter(({ g }) => g.height > 1)
      .map(({ g, ...outline }) => outline);
    return { kind, rows: packed.rows, bars, groups: outlines };
  };

// `units: false` leaves the course units out, for a page with no room for them.
function timelineOf(resume, today, options = {}) {
  const now = monthNow(today);
  const lanes = entryGroups(resume, now).map(laneOf(options));
  // The axis starts with the month of the earliest bar, which may start mid-month.
  const from = Math.floor(Math.min(now, ...lanes.flatMap((l) => l.bars.map((b) => b.start))));
  const years = [];
  for (let year = Math.floor(from / 12) + 1; year <= Math.floor(now / 12); year += 1)
    years.push({ year, month: year * 12 });
  return { from, months: now + 1 - from, years, lanes };
}

module.exports = { timelineOf };

// The upright timeline's groups: each an entry with what it carried, in tracks,
// and the columns that groups sharing no time have in common.
const { BAR, GAP, MIN_BAR, PAD } = require('./upright-metrics');

// The bars of one group — an experience, a degree or a competition and what it
// carried: the head, a degree's years, the projects.
const barsOfGroup = ({ head, children, bands = [] }) => [
  { ...head, depth: 0, labelled: true },
  ...bands.map((b) => ({ ...b, depth: 1, labelled: false })),
  ...children.map((c) => ({ ...c, depth: 1, labelled: true })),
];
const barsOf = (lane) => lane.groups.flatMap(barsOfGroup);

// The first track whose last bar ended above this one's top, the newest first.
function inTracks(bars) {
  const ends = [];
  return bars
    .toSorted((a, b) => b.y0 - a.y0 || a.depth - b.depth)
    .map((bar) => {
      let track = ends.findIndex((bottom) => bar.y0 <= bottom - GAP);
      if (track < 0) track = ends.length;
      ends[track] = bar.y1;
      return { ...bar, track };
    });
}

// A group keeps its head in its first track and what it carried in the tracks
// beside it; it is outlined when it carried something. Groups that do not meet
// in time share a column of the lane.
function inGroups(groups, yOf, k) {
  const pitch = (BAR + GAP) * k;
  const placed = groups.map((group) => {
    const bars = barsOfGroup(group).map((b) => {
      const y0 = yOf(b.end + 1);
      return { ...b, y0, y1: Math.min(y0 - MIN_BAR, yOf(b.start)) };
    });
    const [head, ...carried] = bars;
    // A family of small projects (OpenActe) stands as one bar with its parts in
    // tracks of their own beside it, outlined together.
    const named = (bar) => bar.full?.strong ?? bar.strong;
    const family = carried.find((bar) => carried.some((c) => c.partOf === named(bar)));
    const parts = family ? carried.filter((c) => c.partOf === named(family)) : [];
    const others = carried.filter((c) => c !== family && !parts.includes(c));
    const beside = inTracks(others).map((b) => ({ ...b, track: b.track + 1 }));
    const first = 1 + Math.max(0, ...beside.map((c) => c.track));
    const members = family
      ? [
          { ...family, track: first, umbrella: true },
          ...inTracks(parts).map((b) => ({ ...b, track: first + 1 + b.track })),
        ]
      : [];
    const inside = [...beside, ...members];
    const all = [{ ...head, track: 0 }, ...inside];
    return {
      bars: all,
      family: family && {
        first,
        last: Math.max(...members.map((m) => m.track)),
        top: Math.max(...members.map((m) => m.y0)),
        bottom: Math.min(...members.map((m) => m.y1)),
      },
      outlined: carried.length > 0,
      top: Math.max(...all.map((b) => b.y0)),
      bottom: Math.min(...all.map((b) => b.y1)),
      width: (1 + Math.max(0, ...inside.map((b) => b.track))) * pitch + 2 * PAD,
    };
  });
  const columns = [];
  for (const group of placed.toSorted((a, b) => b.top - a.top)) {
    let at = columns.findIndex((c) => group.top <= c.bottom - GAP);
    if (at < 0) at = columns.push({ width: 0 }) - 1;
    Object.assign(columns[at], {
      bottom: group.bottom,
      width: Math.max(columns[at].width, group.width),
    });
    group.column = at;
  }
  let x = 0;
  const offsets = columns.map((c) => {
    const at = x;
    x += c.width;
    return at;
  });
  for (const group of placed) {
    const left = offsets[group.column];
    for (const bar of group.bars) bar.dx = left + PAD + bar.track * pitch;
    group.x0 = left;
    group.x1 = left + group.width;
    if (group.family) {
      group.family.x0 = left + PAD + group.family.first * pitch - 0.3;
      group.family.x1 = left + PAD + (group.family.last + 1) * pitch - GAP * k + 0.3;
    }
  }
  return { groups: placed, width: x };
}

module.exports = { barsOf, inGroups };

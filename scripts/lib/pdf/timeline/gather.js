// On paper only: a host whose projects all still run stacks one row per
// project, since every one of them reaches today. When the page cannot hold
// them, the two newest that still run share one bar, named after both — the
// site keeps one bar each.

const running = (children) => children.filter((c) => c.ongoing);

// The group with the most projects still running, if two of them can share.
function busiest(lanes) {
  const groups = lanes.flatMap((lane) => lane.groups);
  const best = groups.reduce(
    (a, g) => (running(g.children).length > running(a.children).length ? g : a),
    groups[0],
  );
  return best && running(best.children).length >= 2 ? best : null;
}

// A comma, not a middle dot: the dot is a TS1 glyph, whose font descriptor
// made poppler read the header's words taller, into one another.
const named = (a, b) => `${a}, ${b}`;
const shared = (a, b) => ({
  ...a,
  end: Math.max(a.end, b.end),
  clipped: a.clipped || b.clipped,
  strong: named(a.strong, b.strong),
  rest: '',
  full: { strong: named(a.full.strong, b.full.strong), rest: '' },
});

// The timeline with one bar fewer, or null when no two projects can share.
function gatherNewest(timeline) {
  const host = busiest(timeline.lanes);
  if (!host) return null;
  const [a, b] = running(host.children)
    .sort((x, y) => y.start - x.start)
    .slice(0, 2)
    .sort((x, y) => x.start - y.start);
  const children = host.children.filter((c) => c !== b).map((c) => (c === a ? shared(a, b) : c));
  return {
    ...timeline,
    lanes: timeline.lanes.map((lane) => ({
      ...lane,
      groups: lane.groups.map((g) => (g === host ? { ...g, children } : g)),
    })),
  };
}

module.exports = { gatherNewest };

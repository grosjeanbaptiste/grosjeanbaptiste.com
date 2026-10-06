// Query: the read model behind the timeline PDFs — the site's timeline, on
// paper (lib/timeline-groups.js: each experience, degree or competition with
// the projects and the volunteering it carried). Over the whole career, or
// over the last `years` only (the 2- and 5-year PDFs), where what began earlier
// is cut at the start of the span. Each bar carries the text paper needs: a
// name in bold, then the rest.
const { truncate } = require('../tex');
const { entryGroups, monthOf, monthNow } = require('../../timeline-groups');

// Long names ("EDITx: IT Challenges, IT Jobs, Education in IT for X") would
// push their row's neighbours far along; the bar's place says the rest.
const STRONG_MAX = 30;
const REST_MAX = 34;

// Under its host a bar is told apart by its name alone; the host says where.
const worded = (bar, nested) => ({
  kind: bar.kind,
  start: bar.start,
  end: bar.end,
  ongoing: bar.ongoing,
  clipped: false,
  strong: truncate(bar.name, STRONG_MAX),
  rest: nested ? '' : truncate(bar.title, REST_MAX),
});

const reaches = (bar, from) => bar.end >= from;
const cut = (bar, from) => (bar.start < from ? { ...bar, start: from, clipped: true } : bar);

// The lane of what stands alone, by the kind of the bar left on its own.
const ALONE = { project: 'projects', volunteer: 'volunteer' };

// Cuts every group to the span. A host that ended before it takes its group
// away — but what it carried and still runs is kept, standing alone.
function within(lanes, from) {
  const orphans = [];
  const kept = lanes.map((lane) => ({
    kind: lane.kind,
    groups: lane.groups.flatMap(({ head, children }) => {
      const inSpan = children.filter((c) => reaches(c, from)).map((c) => cut(c, from));
      if (reaches(head, from)) return [{ head: cut(head, from), children: inSpan }];
      orphans.push(...inSpan);
      return [];
    }),
  }));
  for (const orphan of orphans) {
    const kind = ALONE[orphan.kind];
    if (!kept.some((l) => l.kind === kind)) kept.push({ kind, groups: [] });
    kept.find((l) => l.kind === kind).groups.push({ head: orphan, children: [] });
  }
  return kept.filter((lane) => lane.groups.length > 0);
}

function timelineBars(resume, today, years = null) {
  const now = monthNow(today);
  const all = entryGroups(resume, now).map((lane) => ({
    kind: lane.kind,
    groups: lane.groups.map(({ head, children }) => ({
      head: worded(head, false),
      children: children.map((c) => worded(c, true)),
    })),
  }));
  const spanStart = years === null ? null : now - years * 12 + 1;
  const lanes = spanStart === null ? all : within(all, spanStart);
  const starts = lanes.flatMap((l) =>
    l.groups.flatMap((g) => [g.head, ...g.children].map((b) => b.start)),
  );
  // The axis starts with the month of the earliest bar, which may start mid-month.
  return { from: spanStart ?? Math.floor(Math.min(now, ...starts)), to: now, lanes };
}

module.exports = { timelineBars, monthOf };

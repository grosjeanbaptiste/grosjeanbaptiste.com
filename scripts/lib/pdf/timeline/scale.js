// The time axis of the PDF timelines: where a month falls across the track.
// Each calendar year is given width by what it holds — the bar-months that
// fall in it — so the busy years of a career have room for their labels and
// the quiet ones do not waste the page. `density` (0 to 1) is the share of
// the track handed out that way; the rest is handed out by time, which is
// what keeps an empty year visible. Inside a year time runs evenly, and the
// axis still marks every year: the page stays true about when.

// The calendar years of the axis, cut to it: [from, until) in months.
function segmentsOf(from, until) {
  const out = [];
  for (let start = from; start < until; ) {
    const end = Math.min(until, (Math.floor(start / 12) + 1) * 12);
    out.push({ start, end });
    start = end;
  }
  return out;
}

// How many months of `span` (start to end + 1) fall in a segment.
const held = (segment, span) =>
  Math.max(0, Math.min(segment.end, span.end + 1) - Math.max(segment.start, span.start));

function timeScale({ from, to, track, spans, density }) {
  const until = to + 1;
  const segments = segmentsOf(from, until).map((s) => ({
    ...s,
    load: spans.reduce((sum, span) => sum + held(s, span), 0),
  }));
  const months = until - from;
  const load = segments.reduce((sum, s) => sum + s.load, 0);
  // With nothing to weigh, time alone decides.
  const byLoad = load > 0 ? density : 0;
  let x = 0;
  for (const s of segments) {
    s.x = x;
    s.width =
      track *
      ((1 - byLoad) * ((s.end - s.start) / months) + (load > 0 ? byLoad * (s.load / load) : 0));
    x += s.width;
  }
  return (month) => {
    if (month <= from) return ((month - from) / months) * track;
    const s = segments.find((seg) => month < seg.end) ?? segments.at(-1);
    return s.x + ((month - s.start) / (s.end - s.start)) * s.width;
  };
}

module.exports = { timeScale };

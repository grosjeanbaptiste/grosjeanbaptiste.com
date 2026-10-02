// Query: which bar the keyboard reaches from another one. Along a lane, time
// order; across lanes, the bar whose middle is closest in time. No wrapping —
// an edge answers undefined.
import type { Timeline, TimelineBar } from './timeline';

export type Direction = 'next' | 'previous' | 'up' | 'down';

const middle = (bar: TimelineBar) => bar.offset + bar.length / 2;
const byTime = (a: TimelineBar, b: TimelineBar) => a.offset - b.offset || a.row - b.row;

function locate(timeline: Timeline, id: string): { lane: number; bar: TimelineBar } {
  for (const [lane, { bars }] of timeline.lanes.entries()) {
    const bar = bars.find((b) => b.entry.id === id);
    if (bar) return { lane, bar };
  }
  throw new Error(`"${id}" is not on the timeline`);
}

export function neighbour(
  timeline: Timeline,
  id: string,
  direction: Direction,
): string | undefined {
  const { lane, bar } = locate(timeline, id);
  if (direction === 'next' || direction === 'previous') {
    const bars = [...(timeline.lanes[lane]?.bars ?? [])].sort(byTime);
    const at = bars.indexOf(bar) + (direction === 'next' ? 1 : -1);
    return bars[at]?.entry.id;
  }
  const other = timeline.lanes[lane + (direction === 'down' ? 1 : -1)];
  if (!other) return undefined;
  const closest = [...other.bars].sort(
    (a, b) => Math.abs(middle(a) - middle(bar)) - Math.abs(middle(b) - middle(bar)),
  )[0];
  return closest?.entry.id;
}

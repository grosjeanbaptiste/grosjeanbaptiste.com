// Query: which bar the keyboard reaches from another one, by bar key (an entry
// drawn under two hosts has two bars). Left and right follow a lane in time
// order. Up and down follow its rows — from an entry to what it carried — and
// past a lane's edge cross to the nearest row of the next lane; in a row, the
// bar whose middle is closest in time. No wrapping: an edge answers undefined.
import type { Timeline, TimelineBar, TimelineLane } from './timeline';

export type Direction = 'next' | 'previous' | 'up' | 'down';

const middle = (bar: TimelineBar) => bar.offset + bar.length / 2;
const byTime = (a: TimelineBar, b: TimelineBar) => a.offset - b.offset || a.row - b.row;

function locate(timeline: Timeline, key: string): { lane: number; bar: TimelineBar } {
  for (const [lane, { bars }] of timeline.lanes.entries()) {
    const bar = bars.find((b) => b.key === key);
    if (bar) return { lane, bar };
  }
  throw new Error(`"${key}" is not on the timeline`);
}

const closestIn = (lane: TimelineLane | undefined, row: number, to: TimelineBar) =>
  [...(lane?.bars ?? [])]
    .filter((b) => b.row === row)
    .sort((a, b) => Math.abs(middle(a) - middle(to)) - Math.abs(middle(b) - middle(to)))[0];

export function neighbour(
  timeline: Timeline,
  key: string,
  direction: Direction,
): string | undefined {
  const { lane, bar } = locate(timeline, key);
  const own = timeline.lanes[lane];
  if (direction === 'next' || direction === 'previous') {
    const bars = [...(own?.bars ?? [])].sort(byTime);
    return bars[bars.indexOf(bar) + (direction === 'next' ? 1 : -1)]?.key;
  }
  const step = direction === 'down' ? 1 : -1;
  const inLane = closestIn(own, bar.row + step, bar);
  if (inLane) return inLane.key;
  const other = timeline.lanes[lane + step];
  return closestIn(other, step === 1 ? 0 : (other?.rows ?? 1) - 1, bar)?.key;
}

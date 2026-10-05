// Query: the read model behind the interactive timeline. A lane for the
// experiences, one for the degrees, one for the competitions; each entry is a
// group — the entry on its first row, and under it the projects and the
// volunteering it carried, which are not lanes of their own. Only a project or
// a role that nothing hosts keeps a lane. Bars are measured in months from the
// start.
import type { Entry, EntryKind } from './entry';
import { type Period, type YearMonth, monthOf } from './period';
import { packGroups, packRows } from './timeline-packing';

// An entry that has a period — the only kind a timeline can place.
export type Dated = Entry & { readonly period: Period };

export interface TimelineBar {
  // One per bar: an entry drawn under two hosts has two.
  readonly key: string;
  readonly entry: Dated;
  readonly offset: number;
  readonly length: number;
  readonly row: number;
  // 0: an entry of the lane; 1: what it carried, drawn under it.
  readonly depth: 0 | 1;
}

// The outline of an entry that carried something: its rows and its months.
export interface TimelineGroup {
  readonly offset: number;
  readonly length: number;
  readonly row: number;
  readonly rows: number;
}

export interface TimelineLane {
  readonly kind: EntryKind;
  readonly rows: number;
  readonly bars: readonly TimelineBar[];
  readonly groups: readonly TimelineGroup[];
}

export interface Timeline {
  readonly from: YearMonth;
  readonly to: YearMonth;
  readonly months: number;
  readonly years: readonly { readonly year: number; readonly offset: number }[];
  readonly lanes: readonly TimelineLane[];
}

const HOSTS: readonly EntryKind[] = ['work', 'education', 'competition'];
const CARRIED: readonly EntryKind[] = ['project', 'volunteer'];

const ordinal = (ym: YearMonth) => ym.year * 12 + ym.month - 1;
const isDated = (e: Entry): e is Dated => e.period !== undefined;

type Placed = { readonly entry: Dated; readonly offset: number; readonly length: number };

function laneOf(kind: EntryKind, heads: readonly Placed[], carriedBy: (head: Dated) => Placed[]) {
  if (heads.length === 0) return [];
  const groups = heads.map((head) => {
    const children = packRows(carriedBy(head.entry));
    const all = [head, ...children];
    const offset = Math.min(...all.map((b) => b.offset));
    const end = Math.max(...all.map((b) => b.offset + b.length));
    const height = 1 + (children.length ? Math.max(...children.map((c) => c.row)) + 1 : 0);
    return { head, children, offset, length: end - offset, height };
  });
  const packed = packGroups(groups);
  const bars: TimelineBar[] = packed.groups.flatMap((g) => [
    { ...g.head, key: g.head.entry.id, row: g.row, depth: 0 as const },
    ...g.children.map((c) => ({
      entry: c.entry,
      offset: c.offset,
      length: c.length,
      key: `${g.head.entry.id}>${c.entry.id}`,
      row: g.row + 1 + c.row,
      depth: 1 as const,
    })),
  ]);
  const outlines = packed.groups
    .filter((g) => g.children.length > 0)
    .map((g) => ({ offset: g.offset, length: g.length, row: g.row, rows: g.height }));
  return [{ kind, rows: packed.rows, bars, groups: outlines }];
}

export function timelineOf(entries: readonly Entry[], today: Date): Timeline {
  const dated = entries.filter((e) => e.kind !== 'course').filter(isDated);
  const to = monthOf(today);
  const start = Math.min(...dated.map((e) => ordinal(e.period.start)), ordinal(to));
  const from = { year: Math.floor(start / 12), month: (start % 12) + 1 };
  const place = (entry: Dated): Placed => ({
    entry,
    offset: ordinal(entry.period.start) - start,
    length: entry.period.months(today),
  });

  const hostIds = new Set(dated.filter((e) => HOSTS.includes(e.kind)).map((e) => e.id));
  const carried = dated.filter((e) => CARRIED.includes(e.kind));
  const carriedBy = (head: Dated) => carried.filter((e) => e.related.includes(head.id)).map(place);
  const hosted = (e: Dated) => e.related.some((id) => hostIds.has(id));
  const heads = (kind: EntryKind) => dated.filter((e) => e.kind === kind).map(place);

  const lanes = [
    ...HOSTS.flatMap((kind) => laneOf(kind, heads(kind), carriedBy)),
    ...CARRIED.flatMap((kind) =>
      laneOf(
        kind,
        heads(kind).filter((p) => !hosted(p.entry)),
        () => [],
      ),
    ),
  ];

  const years = [];
  for (let year = from.year + 1; year <= to.year; year++) {
    years.push({ year, offset: year * 12 - start });
  }
  return { from, to, months: ordinal(to) - start + 1, years, lanes };
}

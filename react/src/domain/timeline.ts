// Query: the read model behind the interactive timeline. A lane for the
// experiences, one for the degrees, one for the competitions; each entry is a
// group — the entry on its first row, and under it the projects and the
// volunteering it carried, which are not lanes of their own. Only a project or
// a role that nothing hosts keeps a lane. Bars are measured in months from the
// start.
import type { Block, Entry, EntryKind } from './entry';
import { type Period, type YearMonth, monthOf } from './period';
import { type Placed, type Sources, laneOf } from './timeline-lane';

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
  // What the bar reads: the organisation, with the title when another entry
  // of the lane shares it; under its host, the title.
  readonly caption: string;
  // Set on a segment of a degree's blocks: the academic year it stands for.
  // Its `entry` is the degree, which it leads to.
  readonly block?: Block;
  // Set on a course unit of a degree: drawn under the block it was taken in.
  // Its `entry` is the degree, its `block` that year; it leads to the unit.
  readonly unit?: Entry;
  // 'evening' on a degree followed on an evening schedule, and on its blocks.
  readonly schedule?: 'evening';
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

export function timelineOf(entries: readonly Entry[], today: Date): Timeline {
  const dated = entries.filter((e) => e.kind !== 'course').filter(isDated);
  const to = monthOf(today);
  const start = Math.min(...dated.map((e) => ordinal(e.period.start)), ordinal(to));
  const from = { year: Math.floor(start / 12), month: (start % 12) + 1 };
  const place = (entry: Dated): Placed => ({
    entry,
    // To the day: see Period.startsAt / stopsAt.
    offset: entry.period.startsAt() - start,
    length: entry.period.stopsAt(today) - entry.period.startsAt(),
  });

  const byId = new Map(entries.map((e) => [e.id, e]));
  const sources = (carriedBy: Sources['carriedBy']): Sources => ({
    carriedBy,
    banded: (block) => ({
      offset: block.period.startsAt() - start,
      length: block.period.stopsAt(today) - block.period.startsAt(),
    }),
    // A block that names a unit the CV does not have is refused, not skipped.
    unitOf: (id) => {
      const unit = byId.get(id);
      if (!unit) throw new Error(`A block names an unknown course unit "${id}"`);
      return unit;
    },
  });

  const hostIds = new Set(dated.filter((e) => HOSTS.includes(e.kind)).map((e) => e.id));
  const carried = dated.filter((e) => CARRIED.includes(e.kind));
  const carriedBy = (head: Dated) => carried.filter((e) => e.related.includes(head.id)).map(place);
  const hosted = (e: Dated) => e.related.some((id) => hostIds.has(id));
  const heads = (kind: EntryKind) => dated.filter((e) => e.kind === kind).map(place);

  const lanes = [
    ...HOSTS.flatMap((kind) => laneOf(kind, heads(kind), sources(carriedBy))),
    ...CARRIED.flatMap((kind) =>
      laneOf(
        kind,
        heads(kind).filter((p) => !hosted(p.entry)),
        sources(() => []),
      ),
    ),
  ];

  const years = [];
  for (let year = from.year + 1; year <= to.year; year++) {
    years.push({ year, offset: year * 12 - start });
  }
  return { from, to, months: ordinal(to) - start + 1, years, lanes };
}

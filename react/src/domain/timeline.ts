// Query: the read model behind the interactive timeline. A lane for the
// experiences, one for the degrees, one for the competitions; each entry is a
// group — the entry on its first row, and under it the projects and the
// volunteering it carried, which are not lanes of their own. Only a project or
// a role that nothing hosts keeps a lane. Bars are measured in months from the
// start.
import type { Block, Entry, EntryKind } from './entry';
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
  // What the bar reads: the organisation, with the title when another entry
  // of the lane shares it; under its host, the title.
  readonly caption: string;
  // Set on a segment of a degree's blocks: the academic year it stands for.
  // Its `entry` is the degree, which it leads to.
  readonly block?: Block;
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

type Placed = { readonly entry: Dated; readonly offset: number; readonly length: number };

// What an entry carried is drawn for as long as the entry carried it: a
// project that outlives its degree stops under it when the degree was
// obtained. A bar the host names but never overlapped keeps its own dates.
function during(head: Placed, bar: Placed): Placed {
  const offset = Math.max(bar.offset, head.offset);
  const end = Math.min(bar.offset + bar.length, head.offset + head.length);
  return end <= offset ? bar : { ...bar, offset, length: end - offset };
}

// "2022-2023" reads "22-23" on a segment.
const shortYear = (year: string) => year.replace(/\b\d\d(\d\d)\b/g, '$1');

type Banded = (block: Block) => { readonly offset: number; readonly length: number };

function laneOf(
  kind: EntryKind,
  heads: readonly Placed[],
  carriedBy: (head: Dated) => Placed[],
  banded: Banded,
) {
  if (heads.length === 0) return [];
  const groups = heads.map((head) => {
    const children = packRows(carriedBy(head.entry).map((bar) => during(head, bar)));
    // A degree's academic years take one row of their own, under its bar.
    const bands = (head.entry.blocks ?? []).map((block) => ({ block, ...banded(block) }));
    const band = bands.length ? 1 : 0;
    const all = [head, ...bands, ...children];
    const offset = Math.min(...all.map((b) => b.offset));
    const end = Math.max(...all.map((b) => b.offset + b.length));
    const height = 1 + band + (children.length ? Math.max(...children.map((c) => c.row)) + 1 : 0);
    return { head, children, bands, band, offset, length: end - offset, height };
  });
  const packed = packGroups(groups);
  const met = (organisation: string | undefined) =>
    heads.filter((h) => h.entry.organisation === organisation).length;
  const captionOf = ({ organisation, title }: Dated) =>
    organisation && met(organisation) > 1 ? `${organisation} · ${title}` : (organisation ?? title);
  const bars: TimelineBar[] = packed.groups.flatMap((g) => [
    {
      ...g.head,
      key: g.head.entry.id,
      row: g.row,
      depth: 0 as const,
      caption: captionOf(g.head.entry),
      schedule: g.head.entry.schedule,
    },
    ...g.bands.map(({ block, offset, length }) => ({
      entry: g.head.entry,
      offset,
      length,
      key: `${g.head.entry.id}#${block.year}`,
      row: g.row + 1,
      depth: 1 as const,
      caption: [shortYear(block.year), block.label].filter(Boolean).join(' · '),
      block,
      schedule: g.head.entry.schedule,
    })),
    ...g.children.map((c) => ({
      entry: c.entry,
      offset: c.offset,
      length: c.length,
      key: `${g.head.entry.id}>${c.entry.id}`,
      row: g.row + 1 + g.band + c.row,
      depth: 1 as const,
      caption: c.entry.title,
    })),
  ]);
  const outlines = packed.groups
    .filter((g) => g.height > 1)
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
    // To the day: see Period.startsAt / stopsAt.
    offset: entry.period.startsAt() - start,
    length: entry.period.stopsAt(today) - entry.period.startsAt(),
  });

  const banded: Banded = (block) => ({
    offset: block.period.startsAt() - start,
    length: block.period.stopsAt(today) - block.period.startsAt(),
  });

  const hostIds = new Set(dated.filter((e) => HOSTS.includes(e.kind)).map((e) => e.id));
  const carried = dated.filter((e) => CARRIED.includes(e.kind));
  const carriedBy = (head: Dated) => carried.filter((e) => e.related.includes(head.id)).map(place);
  const hosted = (e: Dated) => e.related.some((id) => hostIds.has(id));
  const heads = (kind: EntryKind) => dated.filter((e) => e.kind === kind).map(place);

  const lanes = [
    ...HOSTS.flatMap((kind) => laneOf(kind, heads(kind), carriedBy, banded)),
    ...CARRIED.flatMap((kind) =>
      laneOf(
        kind,
        heads(kind).filter((p) => !hosted(p.entry)),
        () => [],
        banded,
      ),
    ),
  ];

  const years = [];
  for (let year = from.year + 1; year <= to.year; year++) {
    years.push({ year, offset: year * 12 - start });
  }
  return { from, to, months: ordinal(to) - start + 1, years, lanes };
}

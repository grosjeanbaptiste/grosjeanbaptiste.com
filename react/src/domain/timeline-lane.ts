// One lane of the timeline's read model (./timeline): its entries packed into
// rows, each a group — the entry, then what goes under it.
import type { Block, Entry, EntryKind } from './entry';
import type { Dated, TimelineBar } from './timeline';
import { packGroups, packRows } from './timeline-packing';

export type Placed = { readonly entry: Dated; readonly offset: number; readonly length: number };

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

// What a lane is built from, beside its entries: what each carried, where a
// block of a degree falls on the axis, and the course unit an id stands for.
export interface Sources {
  readonly carriedBy: (head: Dated) => Placed[];
  readonly banded: (block: Block) => { readonly offset: number; readonly length: number };
  readonly unitOf: (id: string) => Entry;
}

// An entry with what goes under it: its blocks on one row (a degree's academic
// years), the course units of each block stacked under it, then what the
// entry carried.
function groupOf(head: Placed, { carriedBy, banded, unitOf }: Sources) {
  const children = packRows(carriedBy(head.entry).map((bar) => during(head, bar)));
  const bands = (head.entry.blocks ?? []).map((block) => ({
    block,
    ...banded(block),
    units: block.units.map(unitOf),
  }));
  const band = bands.length ? 1 : 0;
  const units = Math.max(0, ...bands.map((b) => b.units.length));
  const all = [head, ...bands, ...children];
  const offset = Math.min(...all.map((b) => b.offset));
  const end = Math.max(...all.map((b) => b.offset + b.length));
  const height =
    1 + band + units + (children.length ? Math.max(...children.map((c) => c.row)) + 1 : 0);
  return { head, children, bands, band, units, offset, length: end - offset, height };
}

type Group = ReturnType<typeof groupOf> & { readonly row: number };

// What sits under an entry, in rows counted from the entry's own.
function under(g: Group): TimelineBar[] {
  const degree = g.head.entry;
  return [
    ...g.bands.map(({ block, offset, length }) => ({
      entry: degree,
      offset,
      length,
      key: `${degree.id}#${block.year}`,
      row: g.row + 1,
      depth: 1 as const,
      caption: [shortYear(block.year), block.label].filter(Boolean).join(' · '),
      block,
      schedule: degree.schedule,
    })),
    // The units of two blocks share rows: they are never in the same year.
    ...g.bands.flatMap(({ block, offset, length, units }) =>
      units.map((unit, slot) => ({
        entry: degree,
        offset,
        length,
        key: `${degree.id}#${block.year}>${unit.id}`,
        row: g.row + 2 + slot,
        depth: 1 as const,
        caption: unit.title,
        block,
        unit,
      })),
    ),
    ...g.children.map((c) => ({
      entry: c.entry,
      offset: c.offset,
      length: c.length,
      key: `${degree.id}>${c.entry.id}`,
      row: g.row + 1 + g.band + g.units + c.row,
      depth: 1 as const,
      caption: c.entry.title,
    })),
  ];
}

export function laneOf(kind: EntryKind, heads: readonly Placed[], sources: Sources) {
  if (heads.length === 0) return [];
  const packed = packGroups(heads.map((head) => groupOf(head, sources)));
  const met = (organisation: string | undefined) =>
    heads.filter((h) => h.entry.organisation === organisation).length;
  // A degree always reads with its title: the school alone does not say what
  // was studied.
  const captionOf = ({ organisation, title }: Dated) =>
    organisation && title !== organisation && (kind === 'education' || met(organisation) > 1)
      ? `${organisation} · ${title}`
      : (organisation ?? title);
  const bars: TimelineBar[] = packed.groups.flatMap((g) => [
    {
      ...g.head,
      key: g.head.entry.id,
      row: g.row,
      depth: 0 as const,
      caption: captionOf(g.head.entry),
      schedule: g.head.entry.schedule,
    },
    ...under(g),
  ]);
  const outlines = packed.groups
    .filter((g) => g.height > 1)
    .map((g) => ({ offset: g.offset, length: g.length, row: g.row, rows: g.height }));
  return [{ kind, rows: packed.rows, bars, groups: outlines }];
}

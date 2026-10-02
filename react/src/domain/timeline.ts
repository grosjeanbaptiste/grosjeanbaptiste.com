// Query: the read model behind the interactive timeline — one lane per kind
// of entry, bars measured in months from the start, overlaps stacked in rows.
import type { Entry, EntryKind } from './entry';
import { ENTRY_KINDS } from './entry';
import { type Period, type YearMonth, monthOf } from './period';

// An entry that has a period — the only kind a timeline can place.
export type Dated = Entry & { readonly period: Period };

export interface TimelineBar {
  readonly entry: Dated;
  readonly offset: number;
  readonly length: number;
  readonly row: number;
}

export interface TimelineLane {
  readonly kind: EntryKind;
  readonly rows: number;
  readonly bars: readonly TimelineBar[];
}

export interface Timeline {
  readonly from: YearMonth;
  readonly to: YearMonth;
  readonly months: number;
  readonly years: readonly { readonly year: number; readonly offset: number }[];
  readonly lanes: readonly TimelineLane[];
  readonly earliestYear: number;
}

const ordinal = (ym: YearMonth) => ym.year * 12 + ym.month - 1;
const isDated = (e: Entry): e is Dated => e.period !== undefined;

// Greedy interval packing: each bar takes the first row free at its start.
function packRows(bars: readonly Omit<TimelineBar, 'row'>[]): TimelineBar[] {
  const rowEnds: number[] = [];
  return [...bars]
    .sort((a, b) => a.offset - b.offset)
    .map((bar) => {
      let row = rowEnds.findIndex((end) => end <= bar.offset);
      if (row === -1) row = rowEnds.length;
      rowEnds[row] = bar.offset + bar.length;
      return { ...bar, row };
    });
}

// Places an entry in a window starting at month ordinal `start`: cut at the
// left edge, or null when it ended before the window opens.
function place(entry: Dated, start: number, today: Date): Omit<TimelineBar, 'row'> | null {
  const offset = ordinal(entry.period.start) - start;
  const end = offset + entry.period.months(today);
  if (end <= 0) return null;
  return { entry, offset: Math.max(0, offset), length: end - Math.max(0, offset) };
}

// The whole span by default; from January of `sinceYear` when zoomed in.
export function timelineOf(entries: readonly Entry[], today: Date, sinceYear?: number): Timeline {
  const dated = entries.filter((e) => e.kind !== 'course').filter(isDated);
  const to = monthOf(today);
  const earliest = Math.min(...dated.map((e) => ordinal(e.period.start)), ordinal(to));
  const start = sinceYear === undefined ? earliest : Math.max(earliest, sinceYear * 12);
  const from = { year: Math.floor(start / 12), month: (start % 12) + 1 };
  const months = ordinal(to) - start + 1;

  const lanes = ENTRY_KINDS.flatMap((kind) => {
    const placed = dated
      .filter((e) => e.kind === kind)
      .flatMap((e) => place(e, start, today) ?? []);
    const bars = packRows(placed);
    if (bars.length === 0) return [];
    return [{ kind, rows: Math.max(...bars.map((b) => b.row)) + 1, bars }];
  });

  const years = [];
  for (let year = from.year + 1; year <= to.year; year++) {
    years.push({ year, offset: year * 12 - start });
  }
  return { from, to, months, years, lanes, earliestYear: Math.floor(earliest / 12) };
}

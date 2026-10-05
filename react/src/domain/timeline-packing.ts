// Row packing for the timeline: bars that overlap in time go on separate rows,
// and a group — an entry with what it carried underneath — takes a block of
// rows nothing else may cross. Offsets and lengths are whole months.

interface Span {
  readonly offset: number;
  readonly length: number;
}

// Greedy: each bar takes the first row free when it starts. Rows from 0.
export function packRows<T extends Span>(bars: readonly T[]): (T & { row: number })[] {
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

// Each group takes the first block of `height` rows free over its whole span.
export function packGroups<T extends Span & { readonly height: number }>(
  groups: readonly T[],
): { groups: (T & { row: number })[]; rows: number } {
  const rowEnds: number[] = [];
  const free = (row: number, group: T) => (rowEnds[row] ?? 0) <= group.offset;
  const fits = (top: number, group: T) =>
    Array.from({ length: group.height }, (_, i) => top + i).every((row) => free(row, group));
  const placed = [...groups]
    .sort((a, b) => a.offset - b.offset)
    .map((group) => {
      let top = 0;
      while (!fits(top, group)) top += 1;
      for (let i = 0; i < group.height; i += 1) rowEnds[top + i] = group.offset + group.length;
      return { ...group, row: top };
    });
  return { groups: placed, rows: rowEnds.length };
}

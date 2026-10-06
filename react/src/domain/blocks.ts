// Query: what a degree is linked to, read year by year — its course units
// under the block (the academic year) they were taken in, in the order the
// block lists them, and everything else apart.
import type { Block, Entry } from './entry';

export interface BlockGroup {
  readonly block: Block;
  readonly entries: readonly Entry[];
}

export function byBlock(
  entry: Entry,
  related: readonly Entry[],
): { groups: BlockGroup[]; others: readonly Entry[] } {
  const byId = new Map(related.map((e) => [e.id, e]));
  const groups = (entry.blocks ?? [])
    .map((block) => ({
      block,
      entries: block.units.flatMap((id) => byId.get(id) ?? []),
    }))
    .filter((group) => group.entries.length > 0);
  const filed = new Set(groups.flatMap((g) => g.entries.map((e) => e.id)));
  const others = groups.length ? related.filter((e) => !filed.has(e.id)) : related;
  return { groups, others };
}

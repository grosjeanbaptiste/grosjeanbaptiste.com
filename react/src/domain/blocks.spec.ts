// What a degree is linked to, read year by year: the course units under the
// block they were taken in, everything else apart.
import { describe, expect, it } from 'vitest';
import { byBlock } from './blocks';
import type { Entry } from './entry';
import { Period } from './period';

const entry = (id: string, kind: Entry['kind'] = 'course'): Entry => ({
  kind,
  id,
  title: id,
  details: [],
  skills: [],
  related: [],
});
const block = (year: string, units: string[]) => ({
  year,
  period: Period.of(`${year.slice(0, 4)}-09-14`, `${year.slice(5)}-09-13`),
  units,
});
const degree: Entry = {
  ...entry('master', 'education'),
  blocks: [block('2022-2023', ['algo', 'maths']), block('2023-2024', ['networks'])],
};
const related = [entry('networks'), entry('remi', 'project'), entry('algo'), entry('maths')];

describe('byBlock', () => {
  it('files each course unit under the block it was taken in, blocks in order', () => {
    const { groups } = byBlock(degree, related);
    expect(groups.map((g) => [g.block.year, g.entries.map((e) => e.id)])).toEqual([
      ['2022-2023', ['algo', 'maths']],
      ['2023-2024', ['networks']],
    ]);
  });

  it('keeps what belongs to no block apart', () => {
    expect(byBlock(degree, related).others.map((e) => e.id)).toEqual(['remi']);
  });

  it('leaves out a block none of whose units is linked', () => {
    const { groups } = byBlock(degree, [entry('algo')]);
    expect(groups.map((g) => g.block.year)).toEqual(['2022-2023']);
  });

  it('files nothing for an entry without blocks', () => {
    const plain = entry('job', 'work');
    expect(byBlock(plain, related)).toEqual({ groups: [], others: related });
  });
});

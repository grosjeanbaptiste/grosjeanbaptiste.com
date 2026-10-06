// The course units of a degree on the timeline: one bar each, under the block
// — the academic year — they were taken in, leading to the unit's own page.
import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';

const today = new Date('2026-10-01');
const base = aResume();
const studied = {
  ...base,
  projects: [
    ...base.projects,
    { id: 'reseaux', name: 'Réseaux', keywords: [], courseUnit: true },
    { id: 'logique', name: 'Logique', keywords: [], courseUnit: true },
  ],
  education: base.education.map((e) => ({
    ...e,
    blocks: [
      {
        year: '2022-2023',
        startDate: '2022-10-15',
        endDate: '2023-09-13',
        units: ['Algorithmique', 'Réseaux'],
      },
      { year: '2023-2024', startDate: '2023-09-14', endDate: '2026-09-04', units: ['Logique'] },
    ],
  })),
};
const lane = timelineOf(entriesOf(studied), today).lanes.find((l) => l.kind === 'education');
const units = lane?.bars.filter((b) => b.unit) ?? [];
const named = (title: string) => units.find((b) => b.unit?.title === title);
const degree = lane?.bars.find((b) => b.depth === 0);
const band = (year: string) => lane?.bars.find((b) => b.block?.year === year && !b.unit);

describe('the course units of a degree', () => {
  it('are drawn one bar each', () => {
    expect(units.map((b) => b.caption)).toEqual(['Algorithmique', 'Réseaux', 'Logique']);
  });

  it('are as wide as the year they were taken in', () => {
    const algo = named('Algorithmique');
    expect([algo?.offset, algo?.length]).toEqual([
      band('2022-2023')?.offset,
      band('2022-2023')?.length,
    ]);
  });

  it('are stacked under their block', () => {
    const top = (degree?.row ?? 0) + 2;
    expect([named('Algorithmique')?.row, named('Réseaux')?.row]).toEqual([top, top + 1]);
  });

  it('share their rows with the units of another block', () => {
    expect(named('Logique')?.row).toBe(named('Algorithmique')?.row);
  });

  it('push what the degree carried below them', () => {
    const carried = lane?.bars.filter((b) => b.depth === 1 && !b.block) ?? [];
    expect(carried.length).toBeGreaterThan(0);
    expect(carried.every((b) => b.row > (named('Réseaux')?.row ?? 0))).toBe(true);
  });

  it('are inside the outline of their degree', () => {
    const [outline] = lane?.groups ?? [];
    expect((outline?.row ?? 0) + (outline?.rows ?? 0)).toBeGreaterThan(named('Réseaux')?.row ?? 0);
  });

  it('keep the degree as their entry and the block as their year, with a key of their own', () => {
    const algo = named('Algorithmique');
    expect([algo?.entry.id, algo?.block?.year, algo?.key]).toEqual([
      'umons-master',
      '2022-2023',
      'umons-master#2022-2023>algorithmique',
    ]);
  });
});

describe('a degree’s bar', () => {
  it('reads the school once when the degree has no title of its own', () => {
    const untitled = {
      ...base,
      education: [
        { id: 'lycee', institution: 'Lycée', startDate: '2005-09-01', endDate: '2011-06-30' },
      ],
    };
    const bars = timelineOf(entriesOf(untitled), today).lanes.flatMap((l) => l.bars);
    expect(bars.find((b) => b.key === 'lycee')?.caption).toBe('Lycée');
  });

  it('reads the school and the degree', () => {
    expect(degree?.caption).toBe(`${degree?.entry.organisation} · ${degree?.entry.title}`);
  });
});

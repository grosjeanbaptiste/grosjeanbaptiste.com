import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';

const today = new Date('2026-10-01');
const timeline = timelineOf(entriesOf(aResume()), today);
const lane = (kind: string) => timeline.lanes.find((l) => l.kind === kind);

describe('timelineOf', () => {
  it('spans from the earliest start to today', () => {
    expect([timeline.from, timeline.to]).toEqual([
      { year: 2022, month: 10 },
      { year: 2026, month: 10 },
    ]);
  });

  it('gives each kind of entry its own lane', () => {
    expect(timeline.lanes.map((l) => l.kind)).toEqual([
      'work',
      'education',
      'project',
      'volunteer',
    ]);
  });

  it('leaves course units out: they live inside their degree', () => {
    expect(lane('course')).toBeUndefined();
  });

  it('places a bar by its month offset from the start of the timeline', () => {
    const xtrada = lane('work')?.bars.find((b) => b.entry.id === 'xtrada-data-scientist');
    expect(xtrada).toMatchObject({ offset: 3, length: 18 });
  });

  it('runs an ongoing entry up to today', () => {
    const baba = lane('project')?.bars.find((b) => b.entry.id === 'baba');
    expect(baba).toMatchObject({ offset: 45, length: 4 });
  });

  it('stacks overlapping entries of one lane on separate rows', () => {
    const overlapping = entriesOf({
      ...aResume(),
      work: [
        { id: 'a', company: 'A', position: 'P', startDate: '2023-01-01', endDate: '2024-01-01' },
        { id: 'b', company: 'B', position: 'P', startDate: '2023-06-01' },
      ],
    });
    const rows = timelineOf(overlapping, today).lanes[0]?.bars.map((b) => b.row);
    expect(rows).toEqual([0, 1]);
  });

  it('reports one year mark per January it spans', () => {
    expect(timeline.years.map((y) => y.year)).toEqual([2023, 2024, 2025, 2026]);
  });
});

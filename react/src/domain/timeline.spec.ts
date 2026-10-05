import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';

const today = new Date('2026-10-01');
const timeline = timelineOf(entriesOf(aResume()), today);
const lane = (kind: string, of = timeline) => of.lanes.find((l) => l.kind === kind);
const bar = (kind: string, id: string, of = timeline) =>
  lane(kind, of)?.bars.find((b) => b.entry.id === id);

// A resume with a hackathon, and a project built there.
const withHackathon = () =>
  timelineOf(
    entriesOf({
      ...aResume(),
      projects: [
        ...aResume().projects,
        {
          id: 'educraft',
          name: 'EduCraft',
          startDate: '2024-03-29',
          endDate: '2024-03-31',
          courseUnit: false,
        },
      ],
      competitions: [
        {
          id: 'hackathon-2024',
          title: 'Hackathon 2024',
          date: '2024-03-17',
          projects: ['EduCraft'],
        },
      ],
    }),
    today,
  );

describe('timelineOf', () => {
  it('spans from the earliest start to today', () => {
    expect([timeline.from, timeline.to]).toEqual([
      { year: 2022, month: 10 },
      { year: 2026, month: 10 },
    ]);
  });

  // Projects and volunteering are not lanes of their own: each sits inside the
  // experience or the degree that carried it. Baba, which nothing references,
  // is the only project left with a lane.
  it('has a lane for the experiences, one for the degrees, one for unhosted projects', () => {
    expect(timeline.lanes.map((l) => l.kind)).toEqual(['work', 'education', 'project']);
  });

  it('draws a project under the experience that references it', () => {
    const [host, child] = [bar('work', 'acteble-founder'), bar('work', 'acteble')];
    expect([host?.depth, child?.depth, child?.row]).toEqual([0, 1, (host?.row ?? 0) + 1]);
  });

  it('draws volunteering under the degree of its organisation', () => {
    expect(bar('education', 'umons-rep')).toMatchObject({ depth: 1 });
  });

  it('keeps a lane for a project nothing references', () => {
    expect(lane('project')?.bars.map((b) => b.entry.id)).toEqual(['baba']);
  });

  it('gives a competition a lane, with the project built there under it', () => {
    const hackathon = withHackathon();
    expect(hackathon.lanes.map((l) => l.kind)).toEqual([
      'work',
      'education',
      'competition',
      'project',
    ]);
    expect(bar('competition', 'educraft', hackathon)).toMatchObject({ depth: 1 });
  });

  it('leaves course units out: they live inside their degree', () => {
    const ids = timeline.lanes.flatMap((l) => l.bars.map((b) => b.entry.id));
    expect(ids).not.toContain('algorithmique');
  });

  it('tells apart the bars of one entry drawn under two hosts', () => {
    const shared = timelineOf(
      entriesOf({
        ...aResume(),
        education: [
          { ...(aResume().education[0] ?? { id: 'x', institution: 'X' }), projects: ['Acteble'] },
        ],
      }),
      today,
    );
    const keys = shared.lanes
      .flatMap((l) => l.bars)
      .filter((b) => b.entry.id === 'acteble')
      .map((b) => b.key);
    expect(new Set(keys).size).toBe(2);
  });

  it('outlines an entry that carried something, over all its rows', () => {
    expect(lane('work')?.groups).toEqual([
      expect.objectContaining({ row: bar('work', 'acteble-founder')?.row, rows: 2 }),
    ]);
  });

  it('places a bar by its month offset from the start of the timeline', () => {
    expect(bar('work', 'xtrada-data-scientist')).toMatchObject({ offset: 3, length: 18 });
  });

  it('runs an ongoing entry up to today', () => {
    expect(bar('project', 'baba')).toMatchObject({ offset: 45, length: 4 });
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

  it('puts the next entry below a group, never through it', () => {
    const crowded = entriesOf({
      ...aResume(),
      work: [
        { id: 'a', company: 'A', position: 'P', startDate: '2025-07-01', projects: ['Acteble'] },
        { id: 'b', company: 'B', position: 'P', startDate: '2025-09-01' },
      ],
    });
    const rows = Object.fromEntries(
      (timelineOf(crowded, today).lanes[0]?.bars ?? []).map((b) => [b.entry.id, b.row]),
    );
    expect(rows).toEqual({ a: 0, acteble: 1, b: 2 });
  });

  it('reports one year mark per January it spans', () => {
    expect(timeline.years.map((y) => y.year)).toEqual([2023, 2024, 2025, 2026]);
  });
});

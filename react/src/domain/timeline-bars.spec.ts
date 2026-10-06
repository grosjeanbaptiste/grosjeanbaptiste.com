// What a bar of the timeline reads, and where it is placed — to the day.
import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';

const today = new Date('2026-10-01');
const timeline = timelineOf(entriesOf(aResume()), today);

// What a bar reads. An employer met twice gives two bars of one name: the
// position is then what tells them apart.
describe('a bar’s caption', () => {
  const work = aResume().work;
  const second = {
    id: 'xtrada-crafter',
    company: 'Xtrada',
    position: 'Crafter',
    startDate: '2022-01-01',
    endDate: '2022-12-31',
  };
  const twice = timelineOf(entriesOf({ ...aResume(), work: [...work, second] }), today);
  const captionOf = (t: typeof twice, id: string) =>
    t.lanes.flatMap((l) => l.bars).find((b) => b.key === id)?.caption;

  it('is the organisation when no other entry of the lane shares it', () => {
    expect(captionOf(timeline, 'xtrada-data-scientist')).toBe('Xtrada');
  });

  it('adds the title when two entries of the lane share an organisation', () => {
    expect(captionOf(twice, 'xtrada-data-scientist')).toBe('Xtrada · Data Scientist');
    expect(captionOf(twice, 'xtrada-crafter')).toBe('Xtrada · Crafter');
  });

  it('is the title of what an entry carried', () => {
    expect(captionOf(timeline, 'acteble-founder>acteble')).toBe('Acteble');
  });
});

// Bars are placed to the day. A degree that ends the day the next one begins
// used to claim that whole month, as did the next: the two overlapped and the
// second was pushed onto a row of its own.
describe('entries that hand over on one day', () => {
  const handover = {
    ...aResume(),
    work: [],
    projects: [],
    volunteer: [],
    education: [
      {
        id: 'ephec',
        institution: 'EPHEC',
        studyType: 'Bachelor',
        startDate: '2018-09-30',
        endDate: '2022-10-15',
      },
      {
        id: 'umons',
        institution: 'UMons',
        studyType: 'Master',
        startDate: '2022-10-15',
        endDate: '2026-09-04',
      },
    ],
  };
  const [lane] = timelineOf(entriesOf(handover), today).lanes;
  const bar = (id: string) => lane?.bars.find((b) => b.key === id);

  it('follow one another on the same row', () => {
    expect([bar('ephec')?.row, bar('umons')?.row]).toEqual([0, 0]);
  });

  it('meet exactly: one stops where the next starts', () => {
    const ephec = bar('ephec');
    expect((ephec?.offset ?? 0) + (ephec?.length ?? 0)).toBeCloseTo(bar('umons')?.offset ?? -1, 9);
  });

  it('start on their day, not with their month', () => {
    // 30 September: 29 of the month's 30 days in, on an axis that starts with September.
    expect(bar('ephec')?.offset).toBeCloseTo(29 / 30, 9);
  });
});

// A degree is followed year by year: its academic years — its blocks — are one
// row of segments right under its bar.
describe('the blocks of a degree', () => {
  const base = aResume();
  const studied = {
    ...base,
    education: base.education.map((e) => ({
      ...e,
      blocks: [
        {
          year: '2022-2023',
          label: 'Bridging block',
          startDate: '2022-10-15',
          endDate: '2023-09-13',
          units: ['Algorithmique'],
        },
        { year: '2023-2024', startDate: '2023-09-14', endDate: '2026-09-04', units: [] },
      ],
    })),
  };
  const lane = timelineOf(entriesOf(studied), today).lanes.find((l) => l.kind === 'education');
  const bands = lane?.bars.filter((b) => b.block && !b.unit) ?? [];
  const degree = lane?.bars.find((b) => b.depth === 0);

  it('are drawn one segment each', () => {
    expect(bands.map((b) => b.caption)).toEqual(['22-23 · Bridging block', '23-24']);
  });

  it('share the row right under the degree', () => {
    expect(bands.map((b) => b.row)).toEqual([(degree?.row ?? 0) + 1, (degree?.row ?? 0) + 1]);
  });

  it('push what the degree carried below them', () => {
    const carried = lane?.bars.filter((b) => b.depth === 1 && !b.block) ?? [];
    expect(carried.length).toBeGreaterThan(0);
    expect(carried.every((b) => b.row > (degree?.row ?? 0) + 1)).toBe(true);
  });

  it('lead to their degree, each with a key of its own', () => {
    expect(bands.map((b) => [b.entry.id, b.key])).toEqual([
      ['umons-master', 'umons-master#2022-2023'],
      ['umons-master', 'umons-master#2023-2024'],
    ]);
  });

  it('are none for a degree the CV does not divide', () => {
    expect(timeline.lanes.flatMap((l) => l.bars).some((b) => b.block)).toBe(false);
  });
});

// A degree is followed by day or on an evening schedule ("horaire décalé"):
// the timeline marks the evening ones, and their blocks, to tell them apart.
describe('the schedule of a degree', () => {
  const base = aResume();
  const evening = {
    ...base,
    education: base.education.map((e) => ({
      ...e,
      schedule: 'evening' as const,
      blocks: [{ year: '2022-2023', startDate: '2022-10-15', endDate: '2026-09-04', units: [] }],
    })),
  };
  const barsOf = (resume: typeof base) =>
    timelineOf(entriesOf(resume), today).lanes.flatMap((l) => l.bars);

  it('marks a degree followed in the evening', () => {
    expect(barsOf(evening).find((b) => b.key === 'umons-master')?.schedule).toBe('evening');
  });

  it('marks its blocks with it', () => {
    expect(barsOf(evening).find((b) => b.block)?.schedule).toBe('evening');
  });

  it('leaves a degree followed by day unmarked', () => {
    expect(barsOf(base).find((b) => b.key === 'umons-master')?.schedule).toBeUndefined();
  });

  it('gives what the degree carried no schedule of its own', () => {
    const carried = barsOf(evening).filter((b) => b.depth === 1 && !b.block);
    expect(carried.every((b) => b.schedule === undefined)).toBe(true);
  });
});

// What an entry carried is drawn for as long as the entry carried it: a
// project that outlives its degree (a dissertation that became a company)
// stops under the degree when the degree was obtained.
describe('what an entry carried, within its dates', () => {
  const base = aResume();
  const lasting = {
    ...base,
    education: base.education.map((e) => ({ ...e, projects: ['Algorithmique', 'Acteble'] })),
  };
  const lanes = timelineOf(entriesOf(lasting), today).lanes;
  const end = (key: string) => {
    const bar = lanes.flatMap((l) => l.bars).find((b) => b.key === key);
    return (bar?.offset ?? 0) + (bar?.length ?? 0);
  };

  it('stops, under a degree, when the degree was obtained', () => {
    expect(end('umons-master>acteble')).toBeCloseTo(end('umons-master'), 9);
  });

  it('runs on under the experience that goes on with it', () => {
    expect(end('acteble-founder>acteble')).toBeGreaterThan(end('umons-master'));
  });

  it('keeps the outline of the degree to the degree', () => {
    const outline = lanes.find((l) => l.kind === 'education')?.groups[0];
    expect((outline?.offset ?? 0) + (outline?.length ?? 0)).toBeCloseTo(end('umons-master'), 9);
  });
});

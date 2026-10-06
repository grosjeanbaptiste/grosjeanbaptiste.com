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

import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';
import { neighbour } from './timeline-navigation';

// Experiences: Xtrada, then Acteble with its project under it. Degrees: the
// master, with a volunteering role under it. Projects: Baba, alone.
const timeline = timelineOf(entriesOf(aResume()), new Date('2026-10-01'));
const PROJECT_UNDER_ACTEBLE = 'acteble-founder>acteble';
const ROLE_UNDER_MASTER = 'umons-master>umons-rep';

describe('neighbour', () => {
  it('moves to the next bar of the same lane, in time order', () => {
    expect(neighbour(timeline, 'xtrada-data-scientist', 'next')).toBe('acteble-founder');
  });

  it('moves back to the previous bar of the same lane', () => {
    expect(neighbour(timeline, 'acteble-founder', 'previous')).toBe('xtrada-data-scientist');
  });

  it('stops at the end of a lane rather than wrapping around', () => {
    expect(neighbour(timeline, 'xtrada-data-scientist', 'previous')).toBeUndefined();
  });

  it('moves down from an entry to what it carried', () => {
    expect(neighbour(timeline, 'acteble-founder', 'down')).toBe(PROJECT_UNDER_ACTEBLE);
  });

  it('moves back up from what an entry carried to the entry', () => {
    expect(neighbour(timeline, PROJECT_UNDER_ACTEBLE, 'up')).toBe('acteble-founder');
  });

  it('moves down from the last row of a lane to the first row of the lane below', () => {
    expect(neighbour(timeline, PROJECT_UNDER_ACTEBLE, 'down')).toBe('umons-master');
  });

  it('moves up from the first row of a lane to the last row of the lane above', () => {
    expect(neighbour(timeline, 'baba', 'up')).toBe(ROLE_UNDER_MASTER);
  });

  it('stops at the top of the timeline', () => {
    expect(neighbour(timeline, 'xtrada-data-scientist', 'up')).toBeUndefined();
  });

  it('fails loudly on a bar that is not on the timeline', () => {
    expect(() => neighbour(timeline, 'algorithmique', 'next')).toThrow(/algorithmique/);
  });
});

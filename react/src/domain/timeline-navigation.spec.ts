import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { timelineOf } from './timeline';
import { neighbour } from './timeline-navigation';

const timeline = timelineOf(entriesOf(aResume()), new Date('2026-10-01'));

describe('neighbour', () => {
  it('moves to the next entry of the same lane, in time order', () => {
    expect(neighbour(timeline, 'xtrada-data-scientist', 'next')).toBe('acteble-founder');
  });

  it('moves back to the previous entry of the same lane', () => {
    expect(neighbour(timeline, 'acteble-founder', 'previous')).toBe('xtrada-data-scientist');
  });

  it('stops at the end of a lane rather than wrapping around', () => {
    expect(neighbour(timeline, 'xtrada-data-scientist', 'previous')).toBeUndefined();
  });

  it('moves down to the closest entry in time of the lane below', () => {
    expect(neighbour(timeline, 'acteble-founder', 'down')).toBe('umons-master');
  });

  it('moves up to the closest entry in time of the lane above', () => {
    expect(neighbour(timeline, 'baba', 'up')).toBe('umons-master');
  });

  it('stops at the top lane', () => {
    expect(neighbour(timeline, 'acteble-founder', 'up')).toBeUndefined();
  });

  it('fails loudly on an entry that is not on the timeline', () => {
    expect(() => neighbour(timeline, 'algorithmique', 'next')).toThrow(/algorithmique/);
  });
});

// A project on the timeline tells more than its name: its bar reads what kind
// of project it is, and at a glance it tells that kind and the parts taken in it.
import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { natureOf } from './project-reading';
import { timelineOf } from './timeline';

const today = new Date('2026-10-01');
const base = aResume();
const told = {
  ...base,
  projects: base.projects.map((p) =>
    p.id === 'baba'
      ? { ...p, roles: ['Author', 'Maintainer'] }
      : { ...p, type: 'Platform', roles: ['Founder'] },
  ),
};
const entries = entriesOf(told);
const bars = (resume: typeof base) =>
  timelineOf(entriesOf(resume), today).lanes.flatMap((l) => l.bars);
const captionOf = (resume: typeof base, id: string) =>
  bars(resume).find((b) => b.entry.id === id)?.caption;
const entry = (id: string) => {
  const found = entries.find((e) => e.id === id);
  if (!found) throw new Error(`no entry ${id}`);
  return found;
};

describe('what a project reads on its bar', () => {
  it('is its name, then what kind of project it is, under its host', () => {
    expect(captionOf(told, 'acteble')).toBe('Acteble · Platform');
  });

  it('is the same when it stands alone', () => {
    expect(captionOf(base, 'baba')).toBe('Baba · CLI');
  });

  it('is its name alone when it states no kind', () => {
    expect(captionOf(base, 'acteble')).toBe('Acteble');
  });
});

describe('what a project tells at a glance', () => {
  it('is its kind, then the parts taken in it', () => {
    expect(natureOf(entry('baba'))).toBe('CLI · Author · Maintainer');
  });

  it('is nothing for a project that states neither', () => {
    const plain = entriesOf(base).find((e) => e.id === 'acteble');
    expect(plain && natureOf(plain)).toBe('');
  });

  it('is nothing for an experience: its highlights are not a kind', () => {
    expect(natureOf(entry('acteble-founder'))).toBe('');
  });
});

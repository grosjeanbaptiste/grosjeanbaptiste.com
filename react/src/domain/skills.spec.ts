import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import type { Resume } from './resume';
import { entriesUsing, skillUsage } from './skills';

const withProjectSkills = (keywords: string[]): Resume => {
  const resume = aResume();
  const extra = { id: 'x', name: 'X', keywords, courseUnit: false };
  return { ...resume, projects: [...resume.projects, extra] };
};

const entries = entriesOf(aResume());

describe('skillUsage', () => {
  it('counts how many entries use each skill', () => {
    expect(skillUsage(entries).find((s) => s.skill === 'Rust')?.uses).toBe(2);
  });

  it('puts the most used skills first', () => {
    const uses = skillUsage(entries).map((s) => s.uses);
    expect(uses).toEqual([...uses].sort((a, b) => b - a));
  });

  it('breaks ties alphabetically so the order is stable', () => {
    const once = skillUsage(entries)
      .filter((s) => s.uses === 1)
      .map((s) => s.skill);
    expect(once).toEqual([...once].sort((a, b) => a.localeCompare(b)));
  });

  it('keeps skills whose names only differ by symbols apart', () => {
    const cs = entriesOf(withProjectSkills(['C', 'C#', 'C++']));
    expect(skillUsage(cs).map((s) => s.skill)).toEqual(expect.arrayContaining(['C', 'C#', 'C++']));
  });
});

describe('entriesUsing', () => {
  it('returns the entries that list the skill', () => {
    expect(entriesUsing(entries, 'Rust').map((e) => e.id)).toEqual(['acteble-founder', 'baba']);
  });

  it('matches the skill name exactly, so C does not pull in C#', () => {
    const cs = entriesOf(withProjectSkills(['C#']));
    expect(entriesUsing(cs, 'C')).toEqual([]);
  });
});

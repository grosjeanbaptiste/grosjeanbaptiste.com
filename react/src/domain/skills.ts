// Queries over the skills the entries list. Skills are compared by exact
// name: "C", "C#" and "C++" are three different skills.
import type { Entry } from './entry';

export interface SkillUsage {
  readonly skill: string;
  readonly uses: number;
}

export function skillUsage(entries: readonly Entry[]): SkillUsage[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const skill of new Set(entry.skills)) counts.set(skill, (counts.get(skill) ?? 0) + 1);
  }
  return [...counts]
    .map(([skill, uses]) => ({ skill, uses }))
    .sort((a, b) => b.uses - a.uses || a.skill.localeCompare(b.skill));
}

export function entriesUsing(entries: readonly Entry[], skill: string): Entry[] {
  return entries.filter((entry) => entry.skills.includes(skill));
}

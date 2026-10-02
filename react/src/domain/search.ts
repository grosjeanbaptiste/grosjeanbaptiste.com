// Query: free-text search across entries and skills, as the command palette
// asks it. Every word must match; matches are weighted by where they land.
import type { Entry } from './entry';
import { skillUsage } from './skills';
import { fold } from './text';

export type SearchHit =
  | { readonly type: 'entry'; readonly entry: Entry; readonly score: number }
  | {
      readonly type: 'skill';
      readonly skill: string;
      readonly uses: number;
      readonly score: number;
    };

const WORD_START_BONUS = 2;
const SKILL_EXACT = 10;
const SKILL_PARTIAL = 4;

// Score of one query word against one field: 0 when absent, doubled at a word start.
function wordScore(word: string, field: string, weight: number): number {
  const at = field.indexOf(word);
  if (at === -1) return 0;
  const startsWord = at === 0 || !/[a-z0-9]/.test(field.charAt(at - 1));
  return startsWord ? weight * WORD_START_BONUS : weight;
}

function fieldsOf(entry: Entry): [string, number][] {
  return [
    [fold(entry.title), 4],
    [fold(entry.organisation ?? ''), 3],
    [fold(entry.skills.join(' · ')), 2],
    [fold(entry.subtitle ?? ''), 1.5],
    [fold(entry.summary ?? ''), 1],
  ];
}

function entryScore(entry: Entry, words: readonly string[]): number {
  const fields = fieldsOf(entry);
  let total = 0;
  for (const word of words) {
    const best = Math.max(...fields.map(([field, weight]) => wordScore(word, field, weight)));
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

function skillScore(skill: string, words: readonly string[]): number {
  const name = fold(skill);
  if (name === words.join(' ')) return SKILL_EXACT;
  return words.every((word) => name.includes(word)) ? SKILL_PARTIAL : 0;
}

export function search(entries: readonly Entry[], query: string): SearchHit[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const entryHits: SearchHit[] = entries
    .map((entry) => ({ type: 'entry' as const, entry, score: entryScore(entry, words) }))
    .filter((hit) => hit.score > 0);
  const skillHits: SearchHit[] = skillUsage(entries)
    .map(({ skill, uses }) => ({
      type: 'skill' as const,
      skill,
      uses,
      score: skillScore(skill, words),
    }))
    .filter((hit) => hit.score > 0);
  return [...skillHits, ...entryHits].sort((a, b) => b.score - a.score);
}

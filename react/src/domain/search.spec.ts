import { describe, expect, it } from 'vitest';
import { entriesOf } from './entries';
import { aResume } from './fixtures';
import { search } from './search';

const entries = entriesOf(aResume());
const ids = (query: string) =>
  search(entries, query).map((hit) => (hit.type === 'entry' ? hit.entry.id : `skill:${hit.skill}`));

describe('search', () => {
  it('finds nothing for a blank query', () => {
    expect(search(entries, '   ')).toEqual([]);
  });

  it('finds an entry by its title, ignoring case', () => {
    expect(ids('baba')).toContain('baba');
  });

  it('finds an entry by its organisation', () => {
    expect(ids('xtrada')).toEqual(['xtrada-data-scientist']);
  });

  it('ignores accents on both sides', () => {
    expect(ids('ALGORÎTHMIQUE')).toContain('algorithmique');
  });

  it('requires every word of the query to match somewhere in the entry', () => {
    expect(ids('founder acteble')).toEqual(['acteble-founder']);
  });

  it('offers a skill as a hit of its own, with the number of entries using it', () => {
    expect(search(entries, 'prolog')).toContainEqual(
      expect.objectContaining({ type: 'skill', skill: 'Prolog', uses: 1 }),
    );
  });

  it('ranks a title match above a skill-only match', () => {
    // "Rust" is Baba's keyword and Acteble's skill, but no entry is titled Rust:
    // the skill itself comes first.
    expect(ids('rust')[0]).toBe('skill:Rust');
  });

  it('ranks a word-start match above a match inside a word', () => {
    expect(ids('act')[0]).toMatch(/^acteble/);
  });
});

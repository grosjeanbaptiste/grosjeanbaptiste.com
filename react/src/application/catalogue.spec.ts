import { describe, expect, it } from 'vitest';
import { aResume } from '../domain/fixtures';
import { Catalogue } from './catalogue';

const catalogue = Catalogue.from({ lang: 'fr', ui: { projects: 'Projets' }, resume: aResume() });

describe('Catalogue', () => {
  it('finds an entry by id', () => {
    expect(catalogue.entry('baba')?.title).toBe('Baba');
  });

  it('answers undefined for an unknown id rather than a placeholder entry', () => {
    expect(catalogue.entry('nope')).toBeUndefined();
  });

  it('resolves related ids into entries', () => {
    expect(catalogue.relatedTo('acteble-founder').map((e) => e.id)).toEqual(['acteble']);
  });

  it('reads a UI string of the exported language', () => {
    expect(catalogue.text('projects')).toBe('Projets');
  });

  it('fails loudly on a UI string the export does not carry', () => {
    expect(() => catalogue.text('missing')).toThrow(/missing.*fr/);
  });

  it('lists the entries of one kind, newest first', () => {
    expect(catalogue.ofKind('work').map((e) => e.id)).toEqual([
      'acteble-founder',
      'xtrada-data-scientist',
    ]);
  });
});

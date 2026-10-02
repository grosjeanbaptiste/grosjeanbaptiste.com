import { describe, expect, it } from 'vitest';
import { slugOf } from './slug';

describe('slugOf', () => {
  it('lowercases and hyphenates words', () => {
    expect(slugOf('Emvi App')).toBe('emvi-app');
  });

  it('drops accents so French names stay readable in a URL', () => {
    expect(slugOf('Éthique et droit de l’informatique')).toBe('ethique-et-droit-de-l-informatique');
  });

  it('keeps dots meaningful in technology names', () => {
    expect(slugOf('.NET')).toBe('net');
  });

  it('collapses runs of separators and trims them', () => {
    expect(slugOf('  VhAuctions — NER  ')).toBe('vhauctions-ner');
  });
});

import { describe, expect, it } from 'vitest';
import { isLang, preferredLang } from './lang';

describe('preferredLang', () => {
  it('picks the first browser language the CV is written in', () => {
    expect(preferredLang(['ja-JP', 'nl-BE', 'fr'])).toBe('nl');
  });

  it('falls back to English when none matches', () => {
    expect(preferredLang(['ja-JP'])).toBe('en');
  });

  it('reads Chinese variants as zh', () => {
    expect(preferredLang(['zh-Hant-TW'])).toBe('zh');
  });
});

describe('isLang', () => {
  it('accepts the six languages of the CV only', () => {
    expect([isLang('de'), isLang('it')]).toEqual([true, false]);
  });
});

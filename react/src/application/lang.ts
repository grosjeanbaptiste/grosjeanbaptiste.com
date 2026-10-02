// The six languages the CV is written in — same list as scripts/lib/config.js.
export const LANGS = ['en', 'fr', 'nl', 'es', 'de', 'zh'] as const;

export type Lang = (typeof LANGS)[number];

export const isLang = (value: string | undefined): value is Lang =>
  (LANGS as readonly string[]).includes(value ?? '');

// First of the visitor's languages (navigator.languages) the CV exists in.
export function preferredLang(browserLanguages: readonly string[]): Lang {
  for (const tag of browserLanguages) {
    const primary = tag.toLowerCase().split('-')[0];
    if (isLang(primary)) return primary;
  }
  return 'en';
}

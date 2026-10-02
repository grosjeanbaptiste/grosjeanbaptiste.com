import type { Lang } from '../application/lang';
import type { Entry } from '../domain/entry';

export const homePath = (lang: Lang) => `/${lang}`;

export const entryPath = (lang: Lang, entry: Entry) => `/${lang}/${entry.kind}/${entry.id}`;

export const skillPath = (lang: Lang, skill: string) =>
  `/${lang}?${new URLSearchParams({ skill }).toString()}`;

// Same page, other language: swap the first path segment, keep the rest.
export const withLang = (pathname: string, search: string, lang: Lang) =>
  `${pathname.replace(/^\/[^/]+/, `/${lang}`)}${search}`;

// The static site's page for a language: / for English, /fr/ for French…
export const classicPath = (lang: Lang) => (lang === 'en' ? '/' : `/${lang}/`);

export const pdfPath = (lang: Lang) => `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`;

export const LANG_NAMES: Readonly<Record<Lang, string>> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
};

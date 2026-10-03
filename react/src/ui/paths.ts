import type { Lang } from '../application/lang';
import type { Entry } from '../domain/entry';

export const homePath = (lang: Lang) => `/${lang}`;

export const entryPath = (lang: Lang, entry: Entry) => `/${lang}/${entry.kind}/${entry.id}`;

export const skillPath = (lang: Lang, skill: string) =>
  `/${lang}?${new URLSearchParams({ skill }).toString()}`;

// Same page, other language: swap the first path segment, keep the rest.
export const withLang = (pathname: string, search: string, lang: Lang) =>
  `${pathname.replace(/^\/[^/]+/, `/${lang}`)}${search}`;

export const pdfPath = (lang: Lang) => `/assets/cv/cv_grosjean_baptiste_${lang}.pdf`;

// The second LaTeX PDF: the timeline alone, on a landscape page — over the
// whole career (null), or the last five or two years.
export type TimelineSpan = 2 | 5 | null;
export const timelinePdfPath = (lang: Lang, span: TimelineSpan = null) =>
  `/assets/cv/cv_grosjean_baptiste_timeline${span === null ? '' : `_${span}y`}_${lang}.pdf`;

export const LANG_NAMES: Readonly<Record<Lang, string>> = {
  en: 'English',
  fr: 'Français',
  nl: 'Nederlands',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
};

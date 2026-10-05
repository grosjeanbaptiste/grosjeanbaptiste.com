import { createContext, useContext } from 'react';
import type { Catalogue } from '../application/catalogue';
import type { Lang } from '../application/lang';
import type { EntryKind } from '../domain/entry';
import type { Strings } from './strings';
import type { Theme } from './theme';

export interface Reading {
  readonly lang: Lang;
  readonly catalogue: Catalogue;
  readonly strings: Strings;
  readonly today: Date;
  readonly theme: Theme;
  readonly toggleTheme: () => void;
}

const ReadingContext = createContext<Reading | null>(null);

export const ReadingProvider = ReadingContext.Provider;

// The language being read, its CV and its strings. Only valid under LangShell.
export function useReading(): Reading {
  const reading = useContext(ReadingContext);
  if (!reading) throw new Error('useReading() called outside a loaded language');
  return reading;
}

// Section titles come from the static site's translations, so both views agree.
const KIND_LABEL_KEYS: Readonly<Record<EntryKind, string>> = {
  work: 'experience',
  education: 'education',
  competition: 'competitions',
  project: 'projects',
  course: 'courseUnits',
  volunteer: 'volunteer',
};

export function useKindLabel(): (kind: EntryKind) => string {
  const { catalogue } = useReading();
  return (kind) => catalogue.text(KIND_LABEL_KEYS[kind]);
}

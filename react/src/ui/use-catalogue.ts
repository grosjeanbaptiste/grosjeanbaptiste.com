import { useEffect, useState } from 'react';
import { Catalogue } from '../application/catalogue';
import type { Lang } from '../application/lang';
import type { ResumeDocument } from '../domain/resume';
import type { ResumeSource } from '../domain/resume-source';

export type Loading =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly catalogue: Catalogue }
  | { readonly status: 'failed'; readonly error: Error };

// Loads one language's CV. A failure is logged and surfaced as a state the
// shell renders as an alert — never swallowed into an empty page.
// `initial`: that language's data, already in hand (a page drawn at build
// time, or the live app taking over from it) — the CV then shows in the very
// first render and nothing is fetched. It only counts for its own language.
export function useCatalogue(source: ResumeSource, lang: Lang, initial?: ResumeDocument): Loading {
  const handed = initial?.lang === lang ? initial : undefined;
  const [state, setState] = useState<Loading>(() =>
    handed ? { status: 'ready', catalogue: Catalogue.from(handed) } : { status: 'loading' },
  );

  useEffect(() => {
    if (handed) {
      setState({ status: 'ready', catalogue: Catalogue.from(handed) });
      return;
    }
    let current = true;
    setState({ status: 'loading' });
    source
      .load(lang)
      .then((document) => Catalogue.from(document))
      .then((catalogue) => {
        if (current) setState({ status: 'ready', catalogue });
      })
      .catch((cause: unknown) => {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        console.error(`Loading the ${lang} CV failed:`, error);
        if (current) setState({ status: 'failed', error });
      });
    return () => {
      current = false;
    };
  }, [source, lang, handed]);

  return state;
}

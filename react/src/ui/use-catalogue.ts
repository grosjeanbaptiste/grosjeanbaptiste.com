import { useEffect, useState } from 'react';
import { Catalogue } from '../application/catalogue';
import type { Lang } from '../application/lang';
import type { ResumeSource } from '../domain/resume-source';

export type Loading =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly catalogue: Catalogue }
  | { readonly status: 'failed'; readonly error: Error };

// Loads one language's CV. A failure is logged and surfaced as a state the
// shell renders as an alert — never swallowed into an empty page.
export function useCatalogue(source: ResumeSource, lang: Lang): Loading {
  const [state, setState] = useState<Loading>({ status: 'loading' });

  useEffect(() => {
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
  }, [source, lang]);

  return state;
}

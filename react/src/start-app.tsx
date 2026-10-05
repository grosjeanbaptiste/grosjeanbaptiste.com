// Starts the app in a container. A page drawn at build time (src/prerender.tsx)
// already shows the CV: the drawing stays until the app has that language's
// data, then the live app renders over it in one go — the same data, so the
// swap is not seen. A page that was not drawn starts at once and shows its own
// loading state.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { isLang } from './application/lang';
import type { ResumeDocument } from './domain/resume';
import { App, type AppProps } from './ui/App';
import { APP_BASE } from './ui/paths';

type Deps = Omit<AppProps, 'initial'>;

// The language a path of the app is in: "/app/fr/pdf" → "fr".
const langOf = (pathname: string) => pathname.slice(APP_BASE.length).split('/')[1];

export async function startApp(container: HTMLElement, deps: Deps): Promise<void> {
  const render = (initial?: ResumeDocument) =>
    createRoot(container).render(
      <StrictMode>
        <BrowserRouter basename={APP_BASE}>
          <App {...deps} initial={initial} />
        </BrowserRouter>
      </StrictMode>,
    );

  const lang = langOf(window.location.pathname);
  if (!container.hasChildNodes() || !isLang(lang)) return render();
  try {
    render(await deps.source.load(lang));
  } catch (error) {
    // The app loads it again itself and shows the failure it then gets.
    console.error(`Fetching the ${lang} CV before taking over the page failed:`, error);
    render();
  }
}

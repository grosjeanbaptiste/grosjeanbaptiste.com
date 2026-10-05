// A page of the app as HTML, drawn at build time (scripts/route-pages.mjs puts
// it inside #root): what a visitor sees before the JavaScript has arrived.
// main.tsx then renders the live app over it — a replacement, not a
// hydration, so nothing has to match node for node. Runs in Node: effects do
// not run, no data is fetched, no PDF engine is touched.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import type { ResumeDocument } from './domain/resume';
import type { ResumeSource } from './domain/resume-source';
import { App } from './ui/App';
import { APP_BASE } from './ui/paths';
import type { PdfRenderer } from './ui/pdf/pdf-renderer';

const unused = (what: string) => () =>
  Promise.reject(new Error(`${what} is not available while a page is drawn at build time`));

// Never called: the page is handed its data and effects do not run here.
const noSource: ResumeSource = { load: unused('Loading a CV') };
const noPdf: PdfRenderer = {
  open: unused('The PDF engine'),
  prepare: unused('The PDF engine'),
  prefetch: unused('Fetching a PDF'),
};

// `path`: the route inside the app, e.g. "/fr/pdf". `today` sets the
// timeline's right edge; the live app redraws with the visitor's own.
export function prerender(path: string, document: ResumeDocument, today: Date): string {
  return renderToString(
    <StaticRouter basename={APP_BASE} location={`${APP_BASE}${path}`}>
      <App source={noSource} pdf={noPdf} browserLanguages={[]} today={today} initial={document} />
    </StaticRouter>,
  );
}

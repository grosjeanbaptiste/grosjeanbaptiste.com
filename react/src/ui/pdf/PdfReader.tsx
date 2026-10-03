// The PDF displays: one of the two LaTeX PDFs of the language being read (the
// CV, or the landscape timeline), drawn inside the site by the PDF engine
// behind the PdfRenderer port, with a reader toolbar (pages, zoom, download,
// the raw file). A failure is logged and shown.
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Lang } from '../../application/lang';
import { useReading } from '../context';
import { LangMenu } from '../header/LangMenu';
import { type TimelineSpan, pdfPath, timelinePdfPath } from '../paths';
import { TimelineSpans, spanOf } from './TimelineSpans';
import type { PdfRenderer, PdfView } from './pdf-renderer';
import { PDF_STRINGS, type PdfStrings } from './pdf-strings';

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly view: PdfView }
  | { readonly status: 'failed' };

// What each of the two PDFs reads as: its file, its title, its download label.
const DOCUMENTS = {
  cv: {
    file: (lang: Lang, _: TimelineSpan) => pdfPath(lang),
    title: (_: PdfStrings) => 'CV (PDF)',
    download: 'downloadCV',
  },
  timeline: {
    file: timelinePdfPath,
    title: (s: PdfStrings) => s.timelineTitle,
    download: 'downloadTimeline',
  },
} as const;

interface Props {
  readonly renderer: PdfRenderer;
  readonly document?: keyof typeof DOCUMENTS;
}

export function PdfReader({ renderer, document: shown = 'cv' }: Props) {
  const { lang, catalogue, theme, toggleTheme } = useReading();
  const strings = PDF_STRINGS[lang];
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: 'loading' });
  const [params] = useSearchParams();
  const spec = DOCUMENTS[shown];
  const file = spec.file(lang, shown === 'timeline' ? spanOf(params) : null);
  const title = spec.title(strings);

  useEffect(() => {
    document.title = `${title} — ${catalogue.basics.name}`;
    const target = container.current;
    if (!target) return;
    let opened: PdfView | undefined;
    let current = true;
    setState({ status: 'loading' });
    renderer
      .open(file, target)
      .then((view) => {
        opened = view;
        if (current) setState({ status: 'ready', view });
        else view.destroy();
      })
      .catch((error: unknown) => {
        console.error(`Displaying ${file} failed:`, error);
        if (current) setState({ status: 'failed' });
      });
    return () => {
      current = false;
      opened?.destroy();
    };
  }, [renderer, file, title, catalogue]);

  const view = state.status === 'ready' ? state.view : undefined;
  return (
    <div className="pdf-reader">
      <div className="pdf-toolbar">
        <span className="pdf-pages">
          {view ? strings.pages(view.pages) : state.status === 'loading' ? strings.pdfLoading : ''}
        </span>
        {shown === 'timeline' && <TimelineSpans />}
        <div className="pdf-zoom">
          <button
            type="button"
            aria-label={strings.zoomOut}
            disabled={!view}
            onClick={() => view?.zoomOut()}
          >
            −
          </button>
          <button
            type="button"
            aria-label={strings.zoomIn}
            disabled={!view}
            onClick={() => view?.zoomIn()}
          >
            +
          </button>
          <button type="button" disabled={!view} onClick={() => view?.fitWidth()}>
            {strings.fitWidth}
          </button>
        </div>
        <a className="pdf-download" href={file} download>
          {catalogue.text(spec.download)}
        </a>
        <a className="pdf-open" href={file} target="_blank" rel="noopener noreferrer">
          {strings.openFile}
        </a>
        <LangMenu />
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-label={catalogue.text('themeLabel')}
          aria-pressed={theme === 'dark'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
        </button>
      </div>
      {state.status === 'failed' && (
        <p className="pdf-failed" role="alert">
          {strings.pdfFailed} <a href={file}>{strings.openFile}</a>
        </p>
      )}
      <div className="pdf-frame">
        <div ref={container} className="pdf-container">
          <div className="pdfViewer" />
        </div>
      </div>
    </div>
  );
}

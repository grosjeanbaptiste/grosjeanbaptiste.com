// The PDF display: the LaTeX CV of the language being read, drawn inside the
// site by the PDF engine behind the PdfRenderer port, with a reader toolbar
// (pages, zoom, download, the raw file). A failure is logged and shown.
import { useEffect, useRef, useState } from 'react';
import { useReading } from '../context';
import { LangMenu } from '../header/LangMenu';
import { pdfPath } from '../paths';
import type { PdfRenderer, PdfView } from './pdf-renderer';
import { PDF_STRINGS } from './pdf-strings';

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly view: PdfView }
  | { readonly status: 'failed' };

export function PdfReader({ renderer }: { renderer: PdfRenderer }) {
  const { lang, catalogue, theme, toggleTheme } = useReading();
  const strings = PDF_STRINGS[lang];
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: 'loading' });
  const file = pdfPath(lang);

  useEffect(() => {
    document.title = `CV (PDF) — ${catalogue.basics.name}`;
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
  }, [renderer, file, catalogue]);

  const view = state.status === 'ready' ? state.view : undefined;
  return (
    <div className="pdf-reader">
      <div className="pdf-toolbar">
        <span className="pdf-pages">
          {view ? strings.pages(view.pages) : state.status === 'loading' ? strings.pdfLoading : ''}
        </span>
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
          {catalogue.text('downloadCV')}
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

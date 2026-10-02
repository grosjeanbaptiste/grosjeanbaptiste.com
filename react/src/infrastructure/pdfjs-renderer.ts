// Adapter: PDF.js behind the PdfRenderer port. Loaded on demand, so only the
// PDF reader pays for it. Its own viewer draws the pages with their text layer
// (selectable, searchable) and annotation layer (the CV's links stay links).
import type { PdfRenderer, PdfView } from '../ui/pdf/pdf-renderer';

const STEPS = 1;

export class PdfJsRenderer implements PdfRenderer {
  async open(url: string, container: HTMLDivElement): Promise<PdfView> {
    // The core first: the viewer module reads it from globalThis.pdfjsLib, which
    // only the core defines — loading both at once fails at random.
    const pdfjs = await import('pdfjs-dist');
    const [viewer, worker] = await Promise.all([
      import('pdfjs-dist/web/pdf_viewer.mjs'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      import('pdfjs-dist/web/pdf_viewer.css'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

    const eventBus = new viewer.EventBus();
    const linkService = new viewer.PDFLinkService({ eventBus, externalLinkTarget: 2 });
    const pdfViewer = new viewer.PDFViewer({ container, eventBus, linkService });
    linkService.setViewer(pdfViewer);
    eventBus.on('pagesinit', () => {
      pdfViewer.currentScaleValue = 'page-width';
    });

    const task = pdfjs.getDocument({ url });
    const document = await task.promise;
    pdfViewer.setDocument(document);
    linkService.setDocument(document);

    return {
      pages: document.numPages,
      zoomIn: () => pdfViewer.increaseScale({ steps: STEPS }),
      zoomOut: () => pdfViewer.decreaseScale({ steps: STEPS }),
      fitWidth: () => {
        pdfViewer.currentScaleValue = 'page-width';
      },
      // Destroying the loading task destroys the document and its worker.
      destroy: () => {
        void task.destroy().catch((error: unknown) => {
          console.warn(`Closing ${url} failed:`, error);
        });
      },
    };
  }
}

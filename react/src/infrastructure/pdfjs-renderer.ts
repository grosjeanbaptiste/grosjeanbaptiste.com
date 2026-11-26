// Adapter: PDF.js behind the PdfRenderer port. Loaded on demand, so only the
// PDF displays pay for it — or ahead, through prepare(), while the visitor is
// elsewhere. Its own viewer draws the pages with their text layer (selectable,
// searchable) and annotation layer (the CV's links stay links). The file itself
// comes from PdfBytes: one cacheable GET, kept for the life of the page.
import type { PdfRenderer, PdfView } from '../ui/pdf/pdf-renderer';
import { PdfBytes } from './pdf-bytes';

const STEPS = 1;

// The core first: the viewer module reads it from globalThis.pdfjsLib, which
// only the core defines — loading both at once fails at random.
async function loadEngine() {
  const pdfjs = await import('pdfjs-dist');
  const [viewer, worker] = await Promise.all([
    import('pdfjs-dist/web/pdf_viewer.mjs'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    import('pdfjs-dist/web/pdf_viewer.css'),
  ]);
  // One worker for the life of the page, started now and handed to every
  // document: the worker script is fetched once, by the worker itself (a
  // separate fetch ahead of it was downloaded twice when the reader opened
  // before it finished), and opening a PDF skips the worker's start-up. Given
  // explicitly, it outlives each document's destroy() — PDF.js only tears down
  // the workers it created itself.
  const port = new Worker(worker.default, { type: 'module' });
  port.addEventListener('error', (event) => {
    console.error('The PDF.js worker failed to start:', event.message || event);
  });
  const pdfWorker = pdfjs.PDFWorker.create({ port });
  return { pdfjs, viewer, pdfWorker };
}

export class PdfJsRenderer implements PdfRenderer {
  private engine: ReturnType<typeof loadEngine> | undefined;

  constructor(private readonly bytes = new PdfBytes()) {}

  // Once per page; a failure is not remembered, the next call tries again.
  private load() {
    if (!this.engine) {
      this.engine = loadEngine();
      this.engine.catch(() => {
        this.engine = undefined;
      });
    }
    return this.engine;
  }

  async prepare(): Promise<void> {
    await this.load();
  }

  async prefetch(url: string): Promise<void> {
    await this.bytes.get(url);
  }

  async open(url: string, container: HTMLDivElement): Promise<PdfView> {
    const [{ pdfjs, viewer, pdfWorker }, data] = await Promise.all([
      this.load(),
      this.bytes.get(url),
    ]);
    const eventBus = new viewer.EventBus();
    const linkService = new viewer.PDFLinkService({ eventBus, externalLinkTarget: 2 });
    const pdfViewer = new viewer.PDFViewer({ container, eventBus, linkService });
    linkService.setViewer(pdfViewer);
    // The wheel moves the pages sideways, the only way they scroll; at either
    // end, or when nothing overflows, it goes on to the page of the site.
    container.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        const max = container.scrollWidth - container.clientWidth;
        const next = Math.min(max, Math.max(0, container.scrollLeft + event.deltaY));
        if (max <= 0 || next === container.scrollLeft) return;
        container.scrollLeft = next;
        event.preventDefault();
      },
      { passive: false },
    );
    // The recto and the verso side by side; the reader scrolls sideways and never
    // up or down. The pages' height is fitted to the frame, and a zoom grows the
    // frame (and the reader that holds it) with the pages, so that it is the page
    // of the site that scrolls, not the reader.
    pdfViewer.scrollMode = viewer.ScrollMode.HORIZONTAL;
    const frame = container.parentElement;
    const reader = frame?.parentElement;
    const rem = () =>
      Number.parseFloat(getComputedStyle(globalThis.document.documentElement).fontSize);
    const grow = (on: boolean) => {
      if (!frame || !reader) return;
      const height = container.querySelector('.pdfViewer')?.getBoundingClientRect().height ?? 0;
      frame.style.flex = on ? 'none' : '';
      frame.style.height = on ? `${height / rem()}rem` : '';
      reader.style.height = on ? 'auto' : '';
    };
    let zoomed = false;
    const follow = () => requestAnimationFrame(() => grow(zoomed));
    eventBus.on('pagesinit', () => {
      zoomed = false;
      grow(false);
      pdfViewer.currentScaleValue = 'page-height';
    });
    eventBus.on('scalechanging', follow);
    // The reader shows a picture of each page until the first one is drawn.
    const drawn = new Promise<void>((resolve) => {
      eventBus.on('pagerendered', (event: { pageNumber: number; error?: unknown }) => {
        if (event.pageNumber !== 1) return;
        if (event.error) console.error(`Drawing page 1 of ${url} failed:`, event.error);
        resolve();
      });
    });

    const task = pdfjs.getDocument({ data, worker: pdfWorker });
    const document = await task.promise;
    pdfViewer.setDocument(document);
    linkService.setDocument(document);

    return {
      pages: document.numPages,
      drawn,
      zoomIn: () => {
        zoomed = true;
        pdfViewer.increaseScale({ steps: STEPS });
      },
      zoomOut: () => {
        zoomed = true;
        pdfViewer.decreaseScale({ steps: STEPS });
      },
      // Back to the pages fitted to the frame's height.
      fitWidth: () => {
        zoomed = false;
        grow(false);
        pdfViewer.currentScaleValue = 'page-height';
      },
      // Destroying the loading task destroys the document; the shared worker stays.
      destroy: () => {
        void task.destroy().catch((error: unknown) => {
          console.warn(`Closing ${url} failed:`, error);
        });
      },
    };
  }
}

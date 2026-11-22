// The PDF reader of the XSLT themes, drawn the way the interactive view draws
// it: PDF.js with its text and link layers, zoom buttons, fit-to-width. Loaded
// by both themes; each panel (details[data-file]) is drawn the first time it is
// opened, so a visitor who never opens one pays nothing. Without this script
// the panel keeps the browser's own <object>.
(() => {
  const section = document.getElementById('pdf');
  if (!section) return;
  const base = section.dataset.pdfjs;
  let engine;

  // The core first: the viewer reads globalThis.pdfjsLib, which only the core
  // defines. The worker is started once and handed to every document.
  function load() {
    if (!engine) {
      engine = (async () => {
        const pdfjs = await import(`${base}pdf.min.mjs`);
        const viewer = await import(`${base}pdf_viewer.mjs`);
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = `${base}pdf_viewer.css`;
        document.head.appendChild(css);
        const worker = new Worker(`${base}pdf.worker.min.mjs`, { type: 'module' });
        return { pdfjs, viewer, pdfWorker: pdfjs.PDFWorker.create({ port: worker }) };
      })();
      engine.catch(() => {
        engine = undefined;
      });
    }
    return engine;
  }

  async function draw(panel) {
    const toolbar = panel.querySelector('.pdf-toolbar');
    const failed = panel.querySelector('.pdf-failed');
    try {
      const { pdfjs, viewer, pdfWorker } = await load();
      // PDF.js wants its scrolling container absolutely positioned: a frame of
      // a set height holds it.
      const frame = document.createElement('div');
      frame.className = 'pdf-frame';
      frame.innerHTML = '<div class="pdf-container"><div class="pdfViewer"></div></div>';
      const container = frame.firstChild;
      panel.insertBefore(frame, panel.querySelector('object'));

      const eventBus = new viewer.EventBus();
      const linkService = new viewer.PDFLinkService({ eventBus, externalLinkTarget: 2 });
      const pdfViewer = new viewer.PDFViewer({ container, eventBus, linkService });
      linkService.setViewer(pdfViewer);
      eventBus.on('pagesinit', () => {
        pdfViewer.currentScaleValue = 'page-width';
      });
      eventBus.on('pagerendered', (event) => {
        if (event.pageNumber === 1) panel.dataset.drawn = '';
      });
      const doc = await pdfjs.getDocument({ url: panel.dataset.file, worker: pdfWorker }).promise;
      pdfViewer.setDocument(doc);
      linkService.setDocument(doc);

      const act = {
        in: () => pdfViewer.increaseScale({ steps: 1 }),
        out: () => pdfViewer.decreaseScale({ steps: 1 }),
        fit: () => {
          pdfViewer.currentScaleValue = 'page-width';
        },
      };
      toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-pdf]');
        if (button) act[button.dataset.pdf]();
      });
      toolbar.hidden = false;
    } catch (error) {
      console.error(`Displaying ${panel.dataset.file} failed:`, error);
      if (failed) failed.hidden = false;
    }
  }

  for (const panel of section.querySelectorAll('details[data-file]')) {
    let started = false;
    const start = () => {
      if (started || !panel.open) return;
      started = true;
      draw(panel);
    };
    panel.addEventListener('toggle', start);
    start();
  }
})();

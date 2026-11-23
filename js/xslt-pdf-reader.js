// The PDF reader of the XSLT themes, drawn the way the interactive view draws
// it: PDF.js with its text and link layers, zoom buttons, fit-to-width. Loaded
// by both themes; the one reader (.pdf-reader, told its file by data-file)
// is drawn by itself as it nears the screen, so a visitor who never scrolls to
// it pays nothing, and its choice (buttons) swaps the PDF it shows. Without this script
// the reader keeps the browser's own <object> and a list of links.
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

  // One reader, told which PDF to show: the first time it is opened it is drawn
  // with the CV; its choice then swaps the document in the same viewer.
  async function draw(panel) {
    const toolbar = panel.querySelector('.pdf-toolbar');
    const failed = panel.querySelector('.pdf-failed');
    const count = toolbar.querySelector('.pdf-pages');
    const choice = toolbar.querySelector('.pdf-choice');
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

      let current;
      const show = async (file, download) => {
        failed.hidden = true;
        panel.dataset.file = file;
        for (const a of toolbar.querySelectorAll('.pdf-download, .pdf-open')) a.href = file;
        toolbar.querySelector('.pdf-download').textContent = download;
        try {
          const task = pdfjs.getDocument({ url: file, worker: pdfWorker });
          const doc = await task.promise;
          pdfViewer.setDocument(doc);
          linkService.setDocument(doc);
          // The shared worker outlives the document it served.
          if (current) current.destroy();
          current = task;
          const n = doc.numPages;
          count.textContent = `${n} ${n === 1 ? count.dataset.one : count.dataset.many}`;
        } catch (error) {
          console.error(`Displaying ${file} failed:`, error);
          failed.hidden = false;
        }
      };
      const pick = (button) => {
        for (const b of choice.children) b.setAttribute('aria-pressed', String(b === button));
        return show(button.dataset.file, button.dataset.download);
      };
      choice.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-file]');
        if (button) pick(button);
      });
      await pick(
        choice.querySelector(`button[data-file="${panel.dataset.file}"]`) ||
          choice.firstElementChild,
      );

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

  // Drawn by itself, no button to open it: as the reader comes near the screen,
  // so that a visitor who never scrolls down does not pay for PDF.js.
  const panel = section.querySelector('.pdf-reader');
  if ('IntersectionObserver' in window) {
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        watch.disconnect();
        draw(panel);
      },
      { rootMargin: '600px' },
    );
    watch.observe(panel);
  } else {
    draw(panel);
  }
})();

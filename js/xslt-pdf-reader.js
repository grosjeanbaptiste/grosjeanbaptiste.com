// The PDF reader of the XSLT themes, drawn the way the interactive view draws
// it: PDF.js with its text and link layers, zoom buttons, fit-to-width. Loaded
// by both themes; the one reader (details.pdf-reader, told its file by
// data-file) is drawn the first time it is opened, so a visitor who never opens
// it pays nothing, and its choice swaps the PDF it shows. Without this script
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
      choice.addEventListener('change', () => {
        const option = choice.selectedOptions[0];
        show(option.value, option.dataset.download);
      });
      const first = [...choice.options].find((o) => o.value === panel.dataset.file);
      await show(panel.dataset.file, first ? first.dataset.download : '');

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

  const panel = section.querySelector('details.pdf-reader');
  let started = false;
  const start = () => {
    if (started || !panel.open) return;
    started = true;
    draw(panel);
  };
  panel.addEventListener('toggle', start);
  start();
})();

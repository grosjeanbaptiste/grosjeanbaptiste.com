// The PDF reader of the XSLT themes, drawn the way the interactive view draws
// it: PDF.js with its text and link layers, zoom buttons, the width fitted by itself. Loaded
// by both themes; the one reader (.pdf-reader, told its file by data-file)
// is drawn by itself as it nears the screen, so a visitor who never scrolls to
// it pays nothing, and its choice (buttons) swaps the PDF it shows. Without this script
// the reader keeps the browser's own <object> and a list of links.
import { apart, fetchBytes, links, pages, sheet, sideways } from '/js/xslt-pdf-parts.js';

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
    try {
      fetchBytes(panel.dataset.file).catch(() => {});
      const { pdfjs, viewer, pdfWorker } = await load();
      // PDF.js wants its scrolling container absolutely positioned: a frame of
      // a set height holds it.
      const frame = document.createElement('div');
      frame.className = 'pdf-frame';
      frame.innerHTML = '<div class="pdf-container"><div class="pdfViewer"></div></div>';
      const container = frame.firstChild;
      const preview = panel.querySelector('.pdf-preview');
      if (preview) frame.appendChild(preview);
      panel.insertBefore(frame, panel.querySelector('.pdf-files'));

      const eventBus = new viewer.EventBus();
      const linkService = new viewer.PDFLinkService({ eventBus, externalLinkTarget: 2 });
      const pdfViewer = new viewer.PDFViewer({ container, eventBus, linkService });
      linkService.setViewer(pdfViewer);
      sideways(container);
      // The recto and the verso side by side, the frame scrolling sideways and
      // never up or down: the page's height is fitted to the frame, and a zoom
      // by hand grows the frame with the pages, so that it is the page of the
      // site that scrolls, not the reader.
      pdfViewer.scrollMode = viewer.ScrollMode.HORIZONTAL;
      const fitted = () => 'page-height';
      let zoomedByHand = false;
      const rem = () => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const follow = () => {
        frame.style.height = zoomedByHand
          ? `${container.querySelector('.pdfViewer').offsetHeight / rem()}rem`
          : '';
      };
      eventBus.on('pagesinit', () => {
        // A new document resets the viewer to vertical scrolling: set it again.
        pdfViewer.scrollMode = viewer.ScrollMode.HORIZONTAL;
        zoomedByHand = false;
        follow();
        pdfViewer.currentScaleValue = fitted();
      });
      eventBus.on('scalechanging', () => requestAnimationFrame(follow));
      eventBus.on('pagerendered', (event) => {
        if (event.pageNumber === 1) panel.dataset.drawn = '';
      });

      // Each side of the sheet shows one page of one PDF, chosen with its own
      // buttons. The two pages are put together into one two-page PDF in the
      // page (pdf-lib), shown in the viewer and handed over by the download and
      // open buttons; the CV as shipped (its recto, its verso) is shown as is.
      const sides = ['recto', 'verso'].map((side) =>
        toolbar.querySelector(`.pdf-choice[data-side="${side}"]`),
      );
      const chosen = (group) => group.querySelector('button[aria-pressed="true"]');
      const assemble = async (picks) => {
        const [a, b] = picks.map((button) => ({
          file: button.dataset.file,
          page: Number(button.dataset.page),
        }));
        // The CV as shipped needs no putting together.
        if (a.file === b.file && a.page === 1 && b.page === 2) return undefined;
        return sheet([a, b], section.dataset.pdflib);
      };
      // What the choice comes to: the bytes to show, and whether they were put together.
      const prepare = async (picks) => {
        const built = await assemble(picks);
        const file = picks[0].dataset.file;
        const data = built || new Uint8Array((await fetchBytes(file)).slice(0));
        return { built, file, data };
      };
      let current;
      let blob;
      let ticket = 0;
      const show = async () => {
        const mine = ++ticket;
        failed.hidden = true;
        const picks = sides.map(chosen);
        toolbar.querySelector('.pdf-download').textContent = picks[0].dataset.download;
        try {
          const { built, file, data } = await prepare(picks);
          // A later choice overtook this one: leave the links to it.
          if (mine !== ticket) return;
          blob = links(toolbar, built, file, blob);
          const task = pdfjs.getDocument({ data: data.slice(0), worker: pdfWorker });
          const doc = await task.promise;
          if (mine !== ticket) return void task.destroy();
          pdfViewer.setDocument(doc);
          linkService.setDocument(doc);
          // The shared worker outlives the document it served.
          if (current) current.destroy();
          current = task;
          pages(count, doc.numPages);
        } catch (error) {
          console.error('Displaying the chosen pages failed:', error);
          failed.hidden = mine !== ticket;
        }
      };
      const ahead = (event) => {
        const button = event.target.closest('button[data-file]');
        if (button) fetchBytes(button.dataset.file).catch(() => {});
      };
      for (const group of sides) {
        group.addEventListener('pointerover', ahead);
        group.addEventListener('focusin', ahead);
        group.addEventListener('click', (event) => {
          const button = event.target.closest('button[data-file]');
          if (!button) return;
          for (const b of group.querySelectorAll('button[data-file]'))
            b.setAttribute('aria-pressed', String(b === button));
          apart(sides);
          show();
        });
      }
      apart(sides);
      await show();

      const act = {
        in: () => pdfViewer.increaseScale({ steps: 1 }),
        out: () => pdfViewer.decreaseScale({ steps: 1 }),
      };
      // The size is set by itself, on each document and when the window
      // changes, until the reader zooms by hand.
      new ResizeObserver(() => {
        if (!zoomedByHand) pdfViewer.currentScaleValue = fitted();
      }).observe(container);
      toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-pdf]');
        if (!button) return;
        zoomedByHand = true;
        act[button.dataset.pdf]();
      });
      toolbar.hidden = false;
    } catch (error) {
      console.error(`Displaying ${panel.dataset.file} failed:`, error);
      if (failed) failed.hidden = false;
      // The links to the file are still there to use.
      toolbar.hidden = false;
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

// The PDF reader of the XSLT themes, drawn the way the interactive view draws
// it: PDF.js with its text and link layers, zoom buttons, the width fitted by itself. Loaded
// by both themes; the one reader (.pdf-reader, told its file by data-file)
// is drawn by itself as it nears the screen, so a visitor who never scrolls to
// it pays nothing, and its choice (buttons) swaps the PDF it shows. Without this script
// the reader keeps the browser's own <object> and a list of links.
(() => {
  const section = document.getElementById('pdf');
  if (!section) return;
  const base = section.dataset.pdfjs;
  let engine;

  // One plain GET per file, kept for the page's life and started in parallel
  // with the engine (or as a pointer reaches a choice), so the bytes are there
  // when PDF.js is. The worker takes ownership of what it is given: a copy.
  const bytes = new Map();
  const fetchBytes = (file) => {
    if (!bytes.has(file)) {
      const got = fetch(file).then((response) => {
        if (!response.ok) throw new Error(`${response.status} ${file}`);
        return response.arrayBuffer();
      });
      got.catch(() => bytes.delete(file));
      bytes.set(file, got);
    }
    return bytes.get(file);
  };

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
      // The wheel moves the pages sideways, the only way they scroll; at either
      // end, or when nothing overflows, it goes on to the page of the site.
      container.addEventListener(
        'wheel',
        (event) => {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          // The container reads right to left: scrollLeft runs from 0 down to -max.
          const max = container.scrollWidth - container.clientWidth;
          const next = Math.min(0, Math.max(-max, container.scrollLeft - event.deltaY));
          if (max <= 0 || next === container.scrollLeft) return;
          container.scrollLeft = next;
          event.preventDefault();
        },
        { passive: false },
      );
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
        zoomedByHand = false;
        follow();
        pdfViewer.currentScaleValue = fitted();
      });
      eventBus.on('scalechanging', () => requestAnimationFrame(follow));
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
          const data = new Uint8Array((await fetchBytes(file)).slice(0));
          const task = pdfjs.getDocument({ data, worker: pdfWorker });
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
      const ahead = (event) => {
        const button = event.target.closest('button[data-file]');
        if (button) fetchBytes(button.dataset.file).catch(() => {});
      };
      choice.addEventListener('pointerover', ahead);
      choice.addEventListener('focusin', ahead);
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

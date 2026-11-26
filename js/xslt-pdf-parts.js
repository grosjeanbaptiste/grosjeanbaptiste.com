// What the reader of the XSLT themes (js/xslt-pdf-reader.js) does that is not
// about drawing: fetching a PDF's bytes once, moving the pages with the wheel,
// and putting two pages of two PDFs together into one (pdf-lib, loaded on the
// first such choice).

// One plain GET per file, kept for the page's life and started in parallel
// with the engine (or as a pointer reaches a choice), so the bytes are there
// when PDF.js is. The worker takes ownership of what it is given: a copy.
const bytes = new Map();
export const fetchBytes = (file) => {
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

// The wheel moves the pages sideways, the only way they scroll; at either end,
// or when nothing overflows, it goes on to the page of the site.
export function sideways(container) {
  container.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const max = container.scrollWidth - container.clientWidth;
      const next = Math.min(max, Math.max(0, container.scrollLeft + event.deltaY));
      if (max <= 0 || next === container.scrollLeft) return;
      container.scrollLeft = next;
      event.preventDefault();
    },
    { passive: false },
  );
}

let lib;

// pages: [{ file, page }, …], page counting from 1; url is where pdf-lib is
// served. Resolves to the new PDF's bytes.
export async function sheet(pages, url) {
  lib ??= import(url);
  const { PDFDocument } = await lib;
  const out = await PDFDocument.create();
  for (const { file, page } of pages) {
    const source = await PDFDocument.load(await fetchBytes(file));
    const [copy] = await out.copyPages(source, [page - 1]);
    out.addPage(copy);
  }
  return out.save();
}

// The download and open buttons lead to the file shown, or to the pages put
// together (built: their bytes) as a file of their own; old is the previous
// such file's address, which goes. Returns the new address, if any.
export function links(toolbar, built, file, old) {
  if (old) URL.revokeObjectURL(old);
  const blob = built && URL.createObjectURL(new Blob([built], { type: 'application/pdf' }));
  for (const a of toolbar.querySelectorAll('.pdf-download, .pdf-open')) a.href = blob || file;
  toolbar.querySelector('.pdf-download').download = built
    ? `cv_grosjean_baptiste_${document.documentElement.lang || 'en'}_custom.pdf`
    : '';
  return blob;
}

// The page count, worded as the toolbar's span says it ("2 pages").
export function pages(span, n) {
  span.textContent = `${n} ${n === 1 ? span.dataset.one : span.dataset.many}`;
}

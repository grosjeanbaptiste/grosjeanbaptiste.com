// The PDF engine as the build named it: the chunks the reader imports once it
// has booted, read from Vite's manifest so the reader pages can start on them
// with their own HTML (route-pages-lib.mjs). A part the manifest no longer
// holds is a build that changed shape — it throws rather than preload nothing.
const PDFJS = 'node_modules/pdfjs-dist/';
const BASE = '/app/';

export function engineOf(manifest) {
  const file = (key) => {
    const chunk = manifest[`${PDFJS}${key}`];
    if (!chunk?.file) throw new Error(`The build manifest has no ${PDFJS}${key}`);
    return `${BASE}${chunk.file}`;
  };
  return {
    modules: [
      file('build/pdf.mjs'),
      file('web/pdf_viewer.mjs'),
      file('build/pdf.worker.min.mjs?url'),
    ],
    styles: [file('web/pdf_viewer.css')],
    worker: file('build/pdf.worker.min.mjs'),
  };
}

import { describe, expect, it } from 'vitest';
import { engineOf } from './engine-lib.mjs';

const manifest = {
  'index.html': { file: 'assets/index-a.js', isEntry: true },
  'node_modules/pdfjs-dist/build/pdf.mjs': { file: 'assets/pdf-b.js' },
  'node_modules/pdfjs-dist/web/pdf_viewer.mjs': { file: 'assets/pdf_viewer-c.js' },
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs?url': { file: 'assets/pdf.worker.min-d.js' },
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs': { file: 'assets/pdf.worker.min-e.mjs' },
  'node_modules/pdfjs-dist/web/pdf_viewer.css': { file: 'assets/pdf_viewer-f.css' },
};

describe('engineOf', () => {
  it('names the PDF engine’s modules as the site serves them', () => {
    expect(engineOf(manifest).modules).toEqual([
      '/app/assets/pdf-b.js',
      '/app/assets/pdf_viewer-c.js',
      '/app/assets/pdf.worker.min-d.js',
    ]);
  });

  it('names its stylesheet', () => {
    expect(engineOf(manifest).styles).toEqual(['/app/assets/pdf_viewer-f.css']);
  });

  it('names its worker script', () => {
    expect(engineOf(manifest).worker).toBe('/app/assets/pdf.worker.min-e.mjs');
  });

  it('fails when the build no longer holds a part of the engine', () => {
    const { 'node_modules/pdfjs-dist/web/pdf_viewer.mjs': _, ...without } = manifest;
    expect(() => engineOf(without)).toThrow(/pdf_viewer\.mjs/);
  });
});

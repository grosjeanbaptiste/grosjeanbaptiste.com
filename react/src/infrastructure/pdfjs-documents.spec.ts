// @vitest-environment node
// Contract test: the engine behind the PDF reader (PDF.js, its Node build here)
// opens every CV the site ships, and finds the two pages the LaTeX build
// promises. A PDF it cannot parse would leave the reader showing an error.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { LANGS } from '../application/lang';

const cv = (lang: string) =>
  new Uint8Array(
    readFileSync(join(process.cwd(), '..', 'assets/cv', `cv_grosjean_baptiste_${lang}.pdf`)),
  );

describe.each(LANGS)('the shipped %s CV', (lang) => {
  it('opens in the reader’s engine, on two pages', async () => {
    const task = getDocument({ data: cv(lang) });
    try {
      expect((await task.promise).numPages).toBe(2);
    } finally {
      await task.destroy();
    }
  });
});

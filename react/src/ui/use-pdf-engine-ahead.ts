// Loads the PDF engine (~600 kB of PDF.js) while the interactive view sits
// idle, so a PDF display opens without that wait. Not when the visitor's
// browser asks to save data, nor on 2G: they may never open a PDF, and on a
// slow link the download would hold up whatever they do open next.
import { useEffect } from 'react';
import type { PdfRenderer } from './pdf/pdf-renderer';

type Idle = (run: () => void) => () => void;

// requestIdleCallback where the browser has it (Safari does not), else a timeout.
const whenIdle: Idle = (run) => {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(run, 1500);
  return () => window.clearTimeout(handle);
};

type Connection = { readonly saveData?: boolean; readonly effectiveType?: string };

const sparing = () => {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return connection?.saveData === true || /2g$/.test(connection?.effectiveType ?? '');
};

export function usePdfEngineAhead(pdf: PdfRenderer) {
  useEffect(() => {
    if (sparing()) return;
    return whenIdle(() => {
      pdf.prepare().catch((error: unknown) => {
        console.warn('Loading the PDF engine ahead failed; it will load when a PDF opens:', error);
      });
    });
  }, [pdf]);
}

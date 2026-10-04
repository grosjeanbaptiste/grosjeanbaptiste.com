// Port: what the PDF reader needs from a PDF engine. The UI owns it because it
// hands the engine a DOM container to draw into; src/infrastructure/
// pdfjs-renderer.ts adapts PDF.js to it, tests use an in-memory fake.

export interface PdfView {
  readonly pages: number;
  // Settles once the first page is on screen.
  readonly drawn: Promise<void>;
  zoomIn(): void;
  zoomOut(): void;
  fitWidth(): void;
  destroy(): void;
}

export interface PdfRenderer {
  // Rejects when the file cannot be fetched or parsed — never resolves empty.
  open(url: string, container: HTMLDivElement): Promise<PdfView>;
  // Loads the engine ahead of any PDF, so the reader opens without the wait.
  prepare(): Promise<void>;
  // Fetches a file ahead of its reader; open() then finds it already there.
  prefetch(url: string): Promise<void>;
}

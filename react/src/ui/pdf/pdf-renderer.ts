// Port: what the PDF reader needs from a PDF engine. The UI owns it because it
// hands the engine a DOM container to draw into; src/infrastructure/
// pdfjs-renderer.ts adapts PDF.js to it, tests use an in-memory fake.

export interface PdfView {
  readonly pages: number;
  zoomIn(): void;
  zoomOut(): void;
  fitWidth(): void;
  destroy(): void;
}

export interface PdfRenderer {
  // Rejects when the file cannot be fetched or parsed — never resolves empty.
  open(url: string, container: HTMLDivElement): Promise<PdfView>;
}

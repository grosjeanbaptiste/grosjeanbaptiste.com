// The PDF reader's bytes, fetched by one ordinary GET per file and kept for the
// life of the page. PDF.js fetching the file itself used range requests, which
// the browser's HTTP cache never served again: every visit to the reader
// downloaded the PDF anew, sometimes twice. A plain fetch is cached like any
// other file, and reopening a PDF in the same page costs nothing at all.

type Fetcher = (url: string) => Promise<Response>;

export class PdfBytes {
  private readonly files = new Map<string, Promise<ArrayBuffer>>();

  constructor(private readonly fetcher: Fetcher = (url) => fetch(url)) {}

  // A copy each time: PDF.js transfers what it is given to its worker.
  async get(url: string): Promise<Uint8Array> {
    return new Uint8Array((await this.load(url)).slice(0));
  }

  private load(url: string): Promise<ArrayBuffer> {
    const known = this.files.get(url);
    if (known) return known;
    const loading = this.fetcher(url).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${url}`);
      return response.arrayBuffer();
    });
    // A failure is not remembered: the next ask fetches again.
    loading.catch(() => this.files.delete(url));
    this.files.set(url, loading);
    return loading;
  }
}

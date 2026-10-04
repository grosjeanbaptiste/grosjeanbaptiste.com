// The PDF reader's bytes: fetched by an ordinary GET the browser's HTTP cache
// keeps (PDF.js's own range requests never came back from it), and fetched
// once per page life, however many times the reader opens the same file.
import { describe, expect, it, vi } from 'vitest';
import { PdfBytes } from './pdf-bytes';

const ok = (text: string) => new Response(text, { status: 200 });

describe('the PDF bytes', () => {
  it('are fetched with one ordinary request for the whole file', async () => {
    const fetcher = vi.fn(async (_url: string, _init?: RequestInit) => ok('%PDF'));
    await new PdfBytes(fetcher).get('/cv.pdf');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[1]?.headers).toBeUndefined();
  });

  it('come back as the file holds them', async () => {
    const bytes = await new PdfBytes(async () => ok('%PDF-1.4')).get('/cv.pdf');
    expect(new TextDecoder().decode(bytes)).toBe('%PDF-1.4');
  });

  it('are fetched once however often the same file is asked for', async () => {
    const fetcher = vi.fn(async () => ok('%PDF'));
    const bytes = new PdfBytes(fetcher);
    await Promise.all([bytes.get('/cv.pdf'), bytes.get('/cv.pdf')]);
    await bytes.get('/cv.pdf');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('come back as a fresh copy each time, since PDF.js takes ownership of what it is given', async () => {
    const bytes = new PdfBytes(async () => ok('%PDF'));
    const first = await bytes.get('/cv.pdf');
    const second = await bytes.get('/cv.pdf');
    expect(second).not.toBe(first);
    expect(new TextDecoder().decode(second)).toBe('%PDF');
  });

  it('fail on an HTTP error, naming the status and the file', async () => {
    const bytes = new PdfBytes(async () => new Response('', { status: 404 }));
    await expect(bytes.get('/cv.pdf')).rejects.toThrow(/HTTP 404.*\/cv\.pdf/);
  });

  it('are asked for again after a failure, rather than failing forever', async () => {
    const fetcher = vi
      .fn<(url: string) => Promise<Response>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(ok('%PDF'));
    const bytes = new PdfBytes(fetcher);
    await expect(bytes.get('/cv.pdf')).rejects.toThrow('offline');
    await expect(bytes.get('/cv.pdf')).resolves.toBeInstanceOf(Uint8Array);
  });
});

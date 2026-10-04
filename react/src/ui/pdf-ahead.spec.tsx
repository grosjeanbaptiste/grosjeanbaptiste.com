// Getting the PDF displays ready before they are asked for: the engine (about
// 600 kB of PDF.js) while the interactive view sits idle, and a PDF file as
// soon as the pointer or a finger reaches its link in the views bar.
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakePdfRenderer, renderApp } from './app-harness';

// Past both idle paths (requestIdleCallback's 4 s timeout is not reached in
// jsdom, the 1.5 s fallback is): an engine not prepared by then never will be.
const IDLE_DONE = 1700;

const bar = async () => screen.findByRole('navigation', { name: 'Views' });

afterEach(() => {
  vi.unstubAllGlobals();
  for (const link of document.head.querySelectorAll('link[rel="preload"]')) link.remove();
});

describe('getting the PDF displays ready ahead', () => {
  it('prepares the PDF engine once the interactive view is idle', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    await waitFor(() => expect(pdf.prepared).toBe(1));
  });

  it('leaves the engine alone when the visitor asks to save data', async () => {
    vi.stubGlobal('navigator', { ...navigator, connection: { saveData: true } });
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    await bar();
    await new Promise((resolve) => setTimeout(resolve, IDLE_DONE));
    expect(pdf.prepared).toBe(0);
  });

  it('leaves the engine alone on a 2G connection', async () => {
    vi.stubGlobal('navigator', { ...navigator, connection: { effectiveType: '2g' } });
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    await bar();
    await new Promise((resolve) => setTimeout(resolve, IDLE_DONE));
    expect(pdf.prepared).toBe(0);
  });

  it('fetches the CV ahead when the pointer reaches its link', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    fireEvent.pointerEnter(within(await bar()).getByRole('link', { name: 'PDF' }));
    expect(pdf.prefetched).toEqual(['/assets/cv/cv_grosjean_baptiste_en.pdf']);
  });

  it('fetches the timeline ahead when a finger reaches its link', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    fireEvent.touchStart(within(await bar()).getByRole('link', { name: 'Timeline (PDF)' }));
    expect(pdf.prefetched).toEqual(['/assets/cv/cv_grosjean_baptiste_timeline_en.pdf']);
  });

  it('fetches the picture of the first page ahead too, once', async () => {
    renderApp('/en', undefined, new FakePdfRenderer());
    const link = within(await bar()).getByRole('link', { name: 'PDF' });
    fireEvent.pointerEnter(link);
    fireEvent.pointerEnter(link);
    const preloads = [...document.head.querySelectorAll('link[rel="preload"][as="image"]')];
    expect(preloads.map((l) => l.getAttribute('href'))).toEqual(['/cv_en-1.webp']);
  });

  it('fetches nothing ahead for a display that is not a PDF', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/en', undefined, pdf);
    fireEvent.pointerEnter(within(await bar()).getByRole('link', { name: 'Classic' }));
    expect(pdf.prefetched).toEqual([]);
  });

  it('reports a failed head start instead of swallowing it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderApp('/en', undefined, new FakePdfRenderer(false, true));
    fireEvent.pointerEnter(within(await bar()).getByRole('link', { name: 'PDF' }));
    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('ahead'), expect.any(Error)),
    );
  });
});

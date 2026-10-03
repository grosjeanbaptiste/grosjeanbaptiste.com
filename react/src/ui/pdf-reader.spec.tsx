// The PDF display: the LaTeX CV shown inside the site, under the same views
// bar as every display, with its own reader toolbar.
import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FakePdfRenderer, renderApp } from './app-harness';

describe('the PDF reader', () => {
  it('marks the PDF display as current in the views bar', async () => {
    renderApp('/en/pdf');
    const bar = await screen.findByRole('navigation', { name: 'Views' });
    expect(within(bar).getByRole('link', { current: 'page' })).toHaveTextContent('PDF');
  });

  it('opens the PDF of the language being read', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/fr/pdf', undefined, pdf);
    await screen.findByText('2 pages');
    expect(pdf.opened).toEqual(['/assets/cv/cv_grosjean_baptiste_fr.pdf']);
  });

  it('is a reader, not the interactive view: no search box', async () => {
    renderApp('/en/pdf');
    await screen.findByText('2 pages');
    expect(screen.queryByRole('button', { name: /Search/ })).not.toBeInTheDocument();
  });

  it('zooms in, out and back to the page width', async () => {
    const pdf = new FakePdfRenderer();
    const { user } = renderApp('/en/pdf', undefined, pdf);
    await user.click(await screen.findByRole('button', { name: 'Zoom in' }));
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    await user.click(screen.getByRole('button', { name: 'Fit width' }));
    expect(pdf.calls).toEqual(['zoomIn', 'zoomOut', 'fitWidth']);
  });

  it('offers the file itself for download', async () => {
    renderApp('/en/pdf');
    const link = await screen.findByRole('link', { name: 'Download CV' });
    expect(link).toHaveAttribute('href', '/assets/cv/cv_grosjean_baptiste_en.pdf');
    expect(link).toHaveAttribute('download');
  });

  it('says so, visibly, when the PDF cannot be shown', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp('/en/pdf', undefined, new FakePdfRenderer(true));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be displayed');
    expect(console.error).toHaveBeenCalled();
    expect(screen.queryByText('Loading the PDF…')).not.toBeInTheDocument();
  });

  it('closes the document when the reader goes away', async () => {
    const pdf = new FakePdfRenderer();
    const { unmount } = renderApp('/en/pdf', undefined, pdf);
    await screen.findByText('2 pages');
    unmount();
    expect(pdf.calls).toContain('destroy');
  });
});

describe('the timeline reader', () => {
  it('marks the timeline display as current in the views bar', async () => {
    renderApp('/en/pdf/timeline');
    const bar = await screen.findByRole('navigation', { name: 'Views' });
    expect(within(bar).getByRole('link', { current: 'page' })).toHaveTextContent('Timeline (PDF)');
  });

  it('opens the timeline PDF of the language being read', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/fr/pdf/timeline', undefined, pdf);
    await screen.findByText('2 pages');
    expect(pdf.opened).toEqual(['/assets/cv/cv_grosjean_baptiste_timeline_fr.pdf']);
  });

  it('offers the timeline file for download', async () => {
    renderApp('/en/pdf/timeline');
    const link = await screen.findByRole('link', { name: 'Download the timeline' });
    expect(link).toHaveAttribute('href', '/assets/cv/cv_grosjean_baptiste_timeline_en.pdf');
    expect(link).toHaveAttribute('download');
  });
});

// The PDF display: the LaTeX CV shown inside the site, under the same views
// bar as every display, with its own reader toolbar.
import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FakePdfRenderer, currentLocation, renderApp } from './app-harness';

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

describe('the timeline reader’s spans', () => {
  const spans = async () => screen.findByRole('group', { name: 'Timeline' });

  it('offers two years, five years and the whole career', async () => {
    renderApp('/en/pdf/timeline');
    const buttons = within(await spans()).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['2 years', '5 years', 'All']);
  });

  it('opens on the whole career', async () => {
    renderApp('/en/pdf/timeline');
    const all = within(await spans()).getByRole('button', { name: 'All' });
    expect(all).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the five-year PDF when five years are chosen', async () => {
    const pdf = new FakePdfRenderer();
    const { user } = renderApp('/en/pdf/timeline', undefined, pdf);
    await user.click(within(await spans()).getByRole('button', { name: '5 years' }));
    await waitFor(() =>
      expect(pdf.opened.at(-1)).toBe('/assets/cv/cv_grosjean_baptiste_timeline_5y_en.pdf'),
    );
  });

  it('puts the chosen span in the URL, so it can be shared', async () => {
    const { user } = renderApp('/en/pdf/timeline');
    await user.click(within(await spans()).getByRole('button', { name: '2 years' }));
    expect(currentLocation()).toBe('/en/pdf/timeline?span=2');
  });

  it('opens the span a shared URL names', async () => {
    const pdf = new FakePdfRenderer();
    renderApp('/fr/pdf/timeline?span=2', undefined, pdf);
    await screen.findByText('2 pages');
    expect(pdf.opened).toEqual(['/assets/cv/cv_grosjean_baptiste_timeline_2y_fr.pdf']);
  });

  it('downloads the span on screen', async () => {
    renderApp('/en/pdf/timeline?span=5');
    const link = await screen.findByRole('link', { name: 'Download the timeline' });
    expect(link).toHaveAttribute('href', '/assets/cv/cv_grosjean_baptiste_timeline_5y_en.pdf');
  });

  it('says so when a URL names a span it does not know, and shows the whole career', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const pdf = new FakePdfRenderer();
    renderApp('/en/pdf/timeline?span=7', undefined, pdf);
    await screen.findByText('2 pages');
    expect(pdf.opened).toEqual(['/assets/cv/cv_grosjean_baptiste_timeline_en.pdf']);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('"7"'));
  });

  it('offers no span on the vertical CV', async () => {
    renderApp('/en/pdf');
    await screen.findByText('2 pages');
    expect(screen.queryByRole('group', { name: 'Timeline' })).not.toBeInTheDocument();
  });
});

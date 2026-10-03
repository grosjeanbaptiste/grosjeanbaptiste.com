import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './app-harness';

// True when `first` comes before `second` in the page.
const precedes = (first: HTMLElement, second: HTMLElement) =>
  Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('the interactive CV, centred on its timeline', () => {
  it('shows the timeline before the skill filter', async () => {
    renderApp('/en');
    const timeline = await screen.findByRole('region', { name: 'Timeline' });
    expect(precedes(timeline, screen.getByRole('region', { name: 'Filter by skill' }))).toBe(true);
  });

  it('shows the timeline before the summary', async () => {
    renderApp('/en');
    const timeline = await screen.findByRole('region', { name: 'Timeline' });
    expect(precedes(timeline, screen.getByRole('region', { name: 'About' }))).toBe(true);
  });

  it('keeps the summary, under its own heading', async () => {
    renderApp('/en');
    const about = await screen.findByRole('region', { name: 'About' });
    expect(about).toHaveTextContent('Builds software with care.');
  });

  it('opens an entry right under the timeline, above the skill filter', async () => {
    renderApp('/en/project/baba');
    const panel = await screen.findByRole('region', { name: /Baba/ });
    expect(precedes(panel, screen.getByRole('region', { name: 'Filter by skill' }))).toBe(true);
  });
});

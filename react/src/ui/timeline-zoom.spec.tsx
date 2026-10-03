import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './app-harness';

const timeline = async () => screen.findByRole('region', { name: 'Timeline' });
// The timeline's drawn width, in percent of its frame.
const width = (region: HTMLElement) =>
  Number.parseFloat((region.querySelector('.timeline-grid') as HTMLElement).style.width);
const bars = (region: HTMLElement) => within(region).getAllByRole('link').length;

describe('zooming the timeline', () => {
  it('offers two years, five years and the whole career', async () => {
    renderApp('/en');
    const zoom = within(await timeline()).getByRole('group');
    expect(
      within(zoom)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['2 years', '5 years', 'All']);
  });

  it('opens on five years per screen', async () => {
    renderApp('/en');
    const zoom = within(await timeline()).getByRole('button', { name: '5 years' });
    expect(zoom).toHaveAttribute('aria-pressed', 'true');
  });

  it('zooms in by drawing the career wider than its frame', async () => {
    const { user } = renderApp('/en');
    const region = await timeline();
    await user.click(within(region).getByRole('button', { name: '2 years' }));
    expect(width(region)).toBeGreaterThan(100);
  });

  it('keeps every entry on the timeline whatever the zoom', async () => {
    const { user } = renderApp('/en');
    const region = await timeline();
    const before = bars(region);
    await user.click(within(region).getByRole('button', { name: '2 years' }));
    expect(bars(region)).toBe(before);
  });

  it('fits the whole career in its frame on "All"', async () => {
    const { user } = renderApp('/en');
    const region = await timeline();
    await user.click(within(region).getByRole('button', { name: 'All' }));
    expect(width(region)).toBe(100);
  });
});

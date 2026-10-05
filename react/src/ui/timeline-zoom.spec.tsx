import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './app-harness';
import { stretchOf } from './home/TimelineZoom';

const timeline = async () => screen.findByRole('region', { name: 'Timeline' });
// How far the zoom stretches the time axis (1: the whole career in the frame).
const stretch = (region: HTMLElement) =>
  Number(
    (region.querySelector('.timeline-grid') as HTMLElement).style.getPropertyValue('--stretch'),
  );
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
    expect(stretch(region)).toBeGreaterThan(1);
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
    expect(stretch(region)).toBe(1);
  });
});

// The buttons used to show less than they say (1.8 years for "2 years"): the
// zoom sized the whole grid, lane titles included.
describe('how far a zoom stretches the time axis', () => {
  it('shows exactly the years asked for: the career over those years', () => {
    expect(stretchOf(2, 48)).toBe(2);
  });

  it('never shrinks a career shorter than the zoom', () => {
    expect(stretchOf(5, 30)).toBe(1);
  });

  it('leaves the whole career as it is', () => {
    expect(stretchOf(null, 200)).toBe(1);
  });
});

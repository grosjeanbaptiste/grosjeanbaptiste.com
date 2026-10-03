import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from './app-harness';

// The work bars the filter leaves lit, by title.
const litWork = () =>
  within(screen.getByRole('region', { name: 'Timeline' }))
    .getAllByRole('link')
    .filter((a) => a.closest('[data-kind="work"]') && a.getAttribute('data-dimmed') !== 'true')
    .map((a) => a.getAttribute('aria-label')?.split(' — ')[0]);

describe('filtering the CV by skill', () => {
  it('puts the chosen skill in the URL so the view can be shared', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /^Python/ }));
    expect(currentLocation()).toBe('/en?skill=Python');
  });

  it('keeps only the entries that use the skill', async () => {
    renderApp('/en?skill=Python');
    await screen.findByRole('heading', { level: 1 });
    expect(litWork()).toEqual(['Data Scientist']);
  });

  it('announces how many entries use it', async () => {
    renderApp('/en?skill=Rust');
    expect(await screen.findByRole('status')).toHaveTextContent('2 entries use Rust');
  });

  it('marks the chosen skill as pressed', async () => {
    renderApp('/en?skill=Rust');
    expect(await screen.findByRole('button', { name: /^Rust/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('clears back to the whole CV', async () => {
    const { user } = renderApp('/en?skill=Python');
    await user.click(await screen.findByRole('button', { name: 'Clear filter' }));
    expect(litWork()).toEqual(['Data Scientist', 'Founder']);
  });

  it('dims the timeline bars that do not use the skill', async () => {
    renderApp('/en?skill=Python');
    const timeline = await screen.findByRole('region', { name: 'Timeline' });
    const founder = within(timeline).getByRole('link', { name: /Founder/ });
    expect(founder).toHaveAttribute('data-dimmed', 'true');
  });
});

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from './app-harness';

describe('an entry panel', () => {
  it('is titled by the entry', async () => {
    renderApp('/en/work/acteble-founder');
    expect(await screen.findByRole('heading', { level: 2, name: 'Founder' })).toBeVisible();
  });

  it('shows when it happened', async () => {
    renderApp('/en/work/xtrada-data-scientist');
    expect(await screen.findByText('Jan 2023 – Jun 2024')).toBeVisible();
  });

  it('links each skill to the CV filtered by it', async () => {
    const { user } = renderApp('/en/project/baba');
    await user.click(await screen.findByRole('link', { name: 'Prolog' }));
    expect(currentLocation()).toBe('/en?skill=Prolog');
  });

  it('links to the entries it is related to', async () => {
    const { user } = renderApp('/en/work/acteble-founder');
    await user.click(await screen.findByRole('link', { name: /Acteble.*Projects/ }));
    expect(currentLocation()).toBe('/en/project/acteble');
  });

  it('is not found when the id does not exist', async () => {
    renderApp('/en/project/ghost');
    expect(await screen.findByText('This page does not exist.')).toBeVisible();
  });

  it('is not found when the kind in the URL is not the entry’s', async () => {
    renderApp('/en/work/baba');
    expect(await screen.findByText('This page does not exist.')).toBeVisible();
  });
});

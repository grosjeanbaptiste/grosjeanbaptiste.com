import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InMemorySource, currentLocation, renderApp } from './app-harness';

describe('the app shell', () => {
  it('sends a visitor at the root to their browser language', async () => {
    renderApp('/');
    await waitFor(() => expect(currentLocation()).toBe('/nl'));
  });

  it('shows the CV owner once the language is loaded', async () => {
    renderApp('/en');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Baptiste Grosjean' }),
    ).toBeVisible();
  });

  it('says so, visibly, when the CV cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp('/en', new InMemorySource(true));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(console.error).toHaveBeenCalled();
  });

  it('answers an unknown language with a not-found page', async () => {
    renderApp('/it');
    expect(await screen.findByText('This page does not exist.')).toBeVisible();
  });

  it('keeps the page when switching language', async () => {
    const { user } = renderApp('/en/project/baba');
    await user.click(await screen.findByRole('link', { name: /Français/ }));
    expect(currentLocation()).toBe('/fr/project/baba');
  });

  it('marks the document with the language being read', async () => {
    renderApp('/de');
    await screen.findByRole('heading', { level: 1 });
    expect(document.documentElement.lang).toBe('de');
  });
});

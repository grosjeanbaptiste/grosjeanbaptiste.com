// Handed its data, the app shows the CV in its very first render: that is what
// lets a page be drawn at build time, and lets the live app take over from
// that drawing without a "loading" flash in between.
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InMemorySource, renderApp } from './app-harness';

const documentOf = (lang: string) => new InMemorySource().load(lang);

describe('the app handed its data', () => {
  it('shows the CV in its first render', async () => {
    renderApp('/en', new InMemorySource(), undefined, await documentOf('en'));
    expect(screen.getByRole('heading', { level: 1, name: 'Baptiste Grosjean' })).toBeVisible();
  });

  it('does not ask for the data it was handed', async () => {
    const source = new InMemorySource();
    renderApp('/en', source, undefined, await documentOf('en'));
    await screen.findByRole('region', { name: 'Timeline' });
    expect(source.requested).toEqual([]);
  });

  it('still loads another language when the visitor switches', async () => {
    const source = new InMemorySource();
    const { user } = renderApp('/en', source, undefined, await documentOf('en'));
    await user.click(screen.getByRole('link', { name: /Français/ }));
    await waitFor(() => expect(source.requested).toEqual(['fr']));
  });

  it('ignores data that is not the language of the page', async () => {
    const source = new InMemorySource();
    renderApp('/fr', source, undefined, await documentOf('en'));
    await waitFor(() => expect(source.requested).toEqual(['fr']));
  });
});

// Starting the app in the browser. On a page drawn at build time the drawing
// stays on screen until the app has its data, then the live app replaces it —
// never a blank page or a "loading" message in between.
import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ResumeDocument } from './domain/resume';
import type { ResumeSource } from './domain/resume-source';
import { startApp } from './start-app';
import { FakePdfRenderer, InMemorySource } from './ui/app-harness';

// A source whose answer the test releases, or refuses, when it chooses.
function heldSource() {
  let release: (document: ResumeDocument) => void = () => {};
  let refuse: (error: Error) => void = () => {};
  const requested: string[] = [];
  const source: ResumeSource = {
    load: (lang) => {
      requested.push(lang);
      return new Promise((resolve, reject) => {
        release = resolve;
        refuse = reject;
      });
    },
  };
  return {
    source,
    requested,
    release: (d: ResumeDocument) => release(d),
    refuse: (e: Error) => refuse(e),
  };
}

function page(drawn: boolean) {
  const container = document.createElement('div');
  if (drawn) container.innerHTML = '<p data-testid="drawn">drawn at build time</p>';
  document.body.append(container);
  window.history.pushState(null, '', '/app/en');
  return container;
}
const deps = (source: ResumeSource) => ({
  source,
  pdf: new FakePdfRenderer(),
  browserLanguages: ['en'],
  today: new Date('2026-10-01'),
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('starting the app', () => {
  it('keeps a drawn page on screen while its data is on the way', async () => {
    const held = heldSource();
    await act(async () => void startApp(page(true), deps(held.source)));
    expect(screen.getByTestId('drawn')).toBeVisible();
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
  });

  it('asks for the data of the page’s language', async () => {
    const held = heldSource();
    await act(async () => void startApp(page(true), deps(held.source)));
    expect(held.requested).toEqual(['en']);
  });

  it('replaces the drawing with the live app once the data is in', async () => {
    const held = heldSource();
    await act(async () => void startApp(page(true), deps(held.source)));
    await act(async () => held.release(await new InMemorySource().load('en')));
    expect(await screen.findByRole('region', { name: 'Timeline' })).toBeVisible();
    expect(screen.queryByTestId('drawn')).not.toBeInTheDocument();
  });

  it('says so and lets the app report the failure when the data cannot be fetched', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => void startApp(page(true), deps(new InMemorySource(true))));
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(error).toHaveBeenCalled();
  });

  it('starts at once on a page that was not drawn', async () => {
    const source = new InMemorySource();
    await act(async () => void startApp(page(false), deps(source)));
    await waitFor(() => expect(screen.getByRole('region', { name: 'Timeline' })).toBeVisible());
  });
});

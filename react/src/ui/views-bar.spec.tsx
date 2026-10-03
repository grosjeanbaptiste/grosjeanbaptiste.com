// The views bar on the React side: the same buttons as the classic site and
// the XSLT themes (scripts/lib/views.test.js), from the exported registry.
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from './app-harness';

const bar = async () => screen.findByRole('navigation', { name: 'Views' });

describe('the views bar', () => {
  it('lists every display of the CV, in the registry’s order', async () => {
    renderApp('/en');
    const links = within(await bar()).getAllByRole('link');
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Classic', '/'],
      ['Interactive', '/app/en/'],
      ['XSLT (rich)', '/assets/data/resume-en.xml'],
      ['XSLT (minimal)', '/assets/data/resume-en-minimal.xml'],
      ['PDF', '/app/en/pdf/'],
    ]);
  });

  it('marks the interactive display as the current one', async () => {
    renderApp('/en');
    const current = within(await bar()).getByRole('link', { current: 'page' });
    expect(current).toHaveTextContent('Interactive');
  });

  it('uses the shared markup the views-bar sheet styles', async () => {
    renderApp('/en');
    expect(await bar()).toHaveClass('views-bar');
  });

  it('replaces the header’s own link to the classic site', async () => {
    renderApp('/en');
    await bar();
    expect(screen.queryByRole('link', { name: 'Classic site' })).not.toBeInTheDocument();
  });

  it('offers the other displays in the command palette', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('minimal');
    expect(await screen.findByRole('option', { name: /XSLT \(minimal\)/ })).toBeVisible();
  });

  it('follows the language being read', async () => {
    renderApp('/fr');
    expect(await screen.findByRole('navigation', { name: 'Affichages' })).toBeVisible();
    expect(currentLocation()).toBe('/fr');
  });
});

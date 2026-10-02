import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from './app-harness';

describe('the command palette', () => {
  it('opens with Ctrl+K', async () => {
    const { user } = renderApp('/en');
    await screen.findByRole('heading', { level: 1 });
    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeVisible();
  });

  it('opens from the search button in the header', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    expect(await screen.findByRole('combobox')).toHaveFocus();
  });

  it('goes to the entry picked with the keyboard', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('xtrada{Enter}');
    expect(currentLocation()).toBe('/en/work/xtrada-data-scientist');
  });

  it('applies a skill picked from the results as a filter', async () => {
    const { user } = renderApp('/en/project/baba');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('prolog');
    await user.click(await screen.findByRole('option', { name: /Prolog/ }));
    expect(currentLocation()).toBe('/en?skill=Prolog');
  });

  it('lists the skills first when a skill is the best match', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('rust');
    const [first] = await screen.findAllByRole('option');
    expect(first).toHaveTextContent(/^Rust/);
  });

  it('closes once something is picked', async () => {
    const { user } = renderApp('/en');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('xtrada{Enter}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches language from an action', async () => {
    const { user } = renderApp('/en/project/baba');
    await user.click(await screen.findByRole('button', { name: /Search/ }));
    await user.keyboard('deutsch');
    await user.click(await screen.findByRole('option', { name: /Deutsch/ }));
    expect(currentLocation()).toBe('/de/project/baba');
  });
});

import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './app-harness';

const timeline = async () => screen.findByRole('region', { name: 'Timeline' });

describe('zooming the timeline', () => {
  it('opens on the last five years', async () => {
    renderApp('/en');
    const zoom = within(await timeline()).getByRole('button', { name: '5 years' });
    expect(zoom).toHaveAttribute('aria-pressed', 'true');
  });

  it('zooms in to the last three years, cutting what started before', async () => {
    const { user } = renderApp('/en');
    const region = await timeline();
    await user.click(within(region).getByRole('button', { name: '3 years' }));
    expect(within(region).queryByText('2024')).not.toBeInTheDocument();
    expect(within(region).getByText('2025')).toBeVisible();
  });

  it('zooms out to the whole career', async () => {
    const { user } = renderApp('/en');
    const region = await timeline();
    await user.click(within(region).getByRole('button', { name: 'All' }));
    expect(within(region).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

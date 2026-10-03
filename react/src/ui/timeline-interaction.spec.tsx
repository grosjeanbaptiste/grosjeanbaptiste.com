// The timeline is how the CV is browsed: no lists of cards below it; a bar
// opens its entry in a panel under the timeline, the keyboard walks the bars.
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { currentLocation, renderApp } from './app-harness';

const timeline = () => screen.findByRole('region', { name: 'Timeline' });
const bar = async (name: RegExp) => within(await timeline()).getByRole('link', { name });

describe('browsing the CV through the timeline', () => {
  it('lists no entry cards under the timeline any more', async () => {
    renderApp('/en');
    await timeline();
    expect(screen.queryByRole('region', { name: 'Work Experience' })).not.toBeInTheDocument();
  });

  it('opens an entry in a panel under the timeline when its bar is clicked', async () => {
    const { user } = renderApp('/en');
    await user.click(await bar(/Data Scientist/));
    expect(currentLocation()).toBe('/en/work/xtrada-data-scientist');
    const panel = await screen.findByRole('region', { name: 'Data Scientist' });
    expect(within(panel).getByText('Jan 2023 – Jun 2024')).toBeVisible();
  });

  it('keeps the timeline on screen while an entry is open', async () => {
    renderApp('/en/work/xtrada-data-scientist');
    await screen.findByRole('region', { name: 'Data Scientist' });
    expect(await timeline()).toBeVisible();
  });

  it('marks the open entry’s bar as the current one', async () => {
    renderApp('/en/work/xtrada-data-scientist');
    expect(await bar(/Data Scientist/)).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the skill filter when an entry is opened', async () => {
    const { user } = renderApp('/en?skill=Python');
    await user.click(await bar(/Data Scientist/));
    expect(currentLocation()).toBe('/en/work/xtrada-data-scientist?skill=Python');
  });

  it('closes the panel with its close button, keeping the filter', async () => {
    const { user } = renderApp('/en/work/xtrada-data-scientist?skill=Python');
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    expect(currentLocation()).toBe('/en?skill=Python');
  });

  it('closes the panel with Escape', async () => {
    const { user } = renderApp('/en/work/xtrada-data-scientist');
    await screen.findByRole('region', { name: 'Data Scientist' });
    await user.keyboard('{Escape}');
    expect(currentLocation()).toBe('/en');
  });

  it('walks to the next bar of the lane with the right arrow', async () => {
    const { user } = renderApp('/en');
    (await bar(/Data Scientist/)).focus();
    await user.keyboard('{ArrowRight}');
    expect(await bar(/Founder/)).toHaveFocus();
  });

  it('walks to the lane below with the down arrow', async () => {
    const { user } = renderApp('/en');
    (await bar(/Founder/)).focus();
    await user.keyboard('{ArrowDown}');
    expect(await bar(/Master/)).toHaveFocus();
  });

  it('previews an entry while its bar is hovered', async () => {
    renderApp('/en');
    fireEvent.mouseEnter(await bar(/Baba/));
    const preview = await screen.findByRole('tooltip');
    expect(preview).toHaveTextContent('Baba');
    expect(preview).toHaveTextContent('Prolog');
  });

  it('lists a degree’s course units in its panel', async () => {
    renderApp('/en/education/umons-master');
    const panel = await screen.findByRole('region', { name: 'Master' });
    expect(within(panel).getByRole('link', { name: /Algorithmique/ })).toBeVisible();
  });
});

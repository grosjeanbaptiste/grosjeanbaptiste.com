// The legend of the timeline: what the hatching of a bar means. Shown only
// when a degree of the career was followed on an evening schedule.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { entriesOf } from '../domain/entries';
import { aResume } from '../domain/fixtures';
import { timelineOf } from '../domain/timeline';
import { TimelineLegend } from './home/TimelineLegend';

const today = new Date('2026-10-01');
const base = aResume();
const evening = {
  ...base,
  education: base.education.map((e) => ({ ...e, schedule: 'evening' as const })),
};
const legend = (resume: typeof base) =>
  render(
    <TimelineLegend
      timeline={timelineOf(entriesOf(resume), today)}
      day="de jour"
      evening="horaire décalé"
    />,
  );

describe('the legend of the timeline', () => {
  it('names both schedules when a degree was followed in the evening', () => {
    legend(evening);
    expect(screen.getByText('de jour')).toBeVisible();
    expect(screen.getByText('horaire décalé')).toBeVisible();
  });

  it('is absent when every degree was followed by day', () => {
    const { container } = legend(base);
    expect(container).toBeEmptyDOMElement();
  });
});

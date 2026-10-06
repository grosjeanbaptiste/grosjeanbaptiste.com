// What the hatching of a bar means: a degree followed by day is plain, one
// followed on an evening schedule ("horaire décalé") is hatched. Shown only
// when the career has one.
import type { Timeline } from '../../domain/timeline';

interface Props {
  readonly timeline: Timeline;
  readonly day: string;
  readonly evening: string;
}

export function TimelineLegend({ timeline, day, evening }: Props) {
  const hatched = timeline.lanes.some((lane) => lane.bars.some((b) => b.schedule === 'evening'));
  if (!hatched) return null;
  return (
    <p className="timeline-legend">
      <span className="timeline-swatch" aria-hidden="true" />
      <span>{day}</span>
      <span className="timeline-swatch" data-schedule="evening" aria-hidden="true" />
      <span>{evening}</span>
    </p>
  );
}

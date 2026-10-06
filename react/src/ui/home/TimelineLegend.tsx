// What the crescent moon before a degree's name means: the degree was followed
// on an evening schedule ("horaire décalé"). Shown only when the career has one.
import type { Timeline } from '../../domain/timeline';

interface Props {
  readonly timeline: Timeline;
  readonly evening: string;
}

export function TimelineLegend({ timeline, evening }: Props) {
  const marked = timeline.lanes.some((lane) => lane.bars.some((b) => b.schedule === 'evening'));
  if (!marked) return null;
  return (
    <p className="timeline-legend">
      <span className="timeline-moon" aria-hidden="true" />
      <span>{evening}</span>
    </p>
  );
}

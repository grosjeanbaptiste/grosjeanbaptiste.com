// A glance at an entry while its bar is hovered or focused: what, where, when
// and its main skills — enough to decide whether to open it.
import type { CSSProperties } from 'react';
import type { TimelineBar } from '../../domain/timeline';
import { useReading } from '../context';
import { formatPeriod } from '../format';

const MAX_SKILLS = 5;

interface Props {
  readonly bar: TimelineBar;
  readonly months: number;
  // Shown above the bar rather than below it (the last lane).
  readonly above: boolean;
}

export function TimelinePreview({ bar, months, above }: Props) {
  const { lang, strings } = useReading();
  const { entry } = bar;
  // Anchored on the bar's middle, kept inside the track at both ends.
  const middle = ((bar.offset + bar.length / 2) / months) * 100;
  const style = {
    left: `clamp(0%, ${middle}%, 100%)`,
    '--row': bar.row,
    '--shift': middle > 70 ? '-100%' : middle < 30 ? '0%' : '-50%',
  } as CSSProperties;

  return (
    <div
      id="timeline-preview"
      role="tooltip"
      className="timeline-preview"
      data-place={above ? 'above' : 'below'}
      style={style}
    >
      <strong>{entry.title}</strong>
      {entry.organisation && <span>{entry.organisation}</span>}
      <span className="timeline-preview-period">
        {formatPeriod(entry.period, lang, strings.ongoing)}
      </span>
      {entry.skills.length > 0 && (
        <span className="timeline-preview-skills">
          {entry.skills.slice(0, MAX_SKILLS).join(' · ')}
        </span>
      )}
    </div>
  );
}

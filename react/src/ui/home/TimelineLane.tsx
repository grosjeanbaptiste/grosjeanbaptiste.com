// One lane of the timeline: its label, then a link per entry, placed in
// percent of the whole career. The open entry is aria-current; with a skill
// filter on, the entries that do not use it fade back.
import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import type { TimelineLane as Lane } from '../../domain/timeline';
import { useKindLabel, useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath } from '../paths';
import { TimelinePreview } from './TimelinePreview';

const percent = (part: number, whole: number) => `${(part / whole) * 100}%`;

interface Props {
  readonly lane: Lane;
  readonly months: number;
  readonly selectedId: string | undefined;
  readonly previewId: string | undefined;
  readonly highlight: ReadonlySet<string> | null;
  readonly onPreview: (id: string | undefined) => void;
  readonly last: boolean;
}

export function TimelineLane(props: Props) {
  const { lane, months, selectedId, previewId, highlight, onPreview, last } = props;
  const { lang, strings } = useReading();
  const label = useKindLabel();
  const { search } = useLocation();
  const previewed = lane.bars.find((b) => b.entry.id === previewId);

  return (
    <div className="timeline-lane" data-kind={lane.kind}>
      <span className="timeline-lane-label">{label(lane.kind)}</span>
      <div className="timeline-track" style={{ '--rows': lane.rows } as CSSProperties}>
        {lane.bars.map(({ entry, offset, length, row }) => {
          const period = formatPeriod(entry.period, lang, strings.ongoing);
          const name = [entry.title, entry.organisation, period].filter(Boolean).join(' — ');
          return (
            <Link
              key={entry.id}
              to={`${entryPath(lang, entry)}${search}`}
              preventScrollReset
              className="timeline-bar"
              data-entry-id={entry.id}
              aria-label={name}
              aria-current={entry.id === selectedId ? 'page' : undefined}
              aria-describedby={entry.id === previewId ? 'timeline-preview' : undefined}
              data-dimmed={highlight ? !highlight.has(entry.id) : undefined}
              onMouseEnter={() => onPreview(entry.id)}
              onMouseLeave={() => onPreview(undefined)}
              onFocus={() => onPreview(entry.id)}
              onBlur={() => onPreview(undefined)}
              style={
                {
                  left: percent(offset, months),
                  width: percent(length, months),
                  '--row': row,
                } as CSSProperties
              }
            >
              <span>{entry.organisation ?? entry.title}</span>
            </Link>
          );
        })}
        {previewed && <TimelinePreview bar={previewed} months={months} above={last} />}
      </div>
    </div>
  );
}

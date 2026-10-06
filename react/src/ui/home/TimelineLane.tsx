// One lane of the timeline: its label, then a link per entry, placed in
// percent of the whole career — an entry's projects and volunteering drawn
// under it, inside its outline. The open entry is aria-current; with a skill
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
  // The key of the bar being previewed (an entry may have two bars).
  readonly previewKey: string | undefined;
  readonly highlight: ReadonlySet<string> | null;
  readonly onPreview: (id: string | undefined) => void;
  readonly last: boolean;
}

export function TimelineLane(props: Props) {
  const { lane, months, selectedId, previewKey, highlight, onPreview, last } = props;
  const { lang, strings } = useReading();
  const label = useKindLabel();
  const { search } = useLocation();
  const previewed = lane.bars.find((b) => b.key === previewKey);

  return (
    <div className="timeline-lane" data-kind={lane.kind}>
      <span className="timeline-lane-label">{label(lane.kind)}</span>
      <div className="timeline-track" style={{ '--rows': lane.rows } as CSSProperties}>
        {/* Behind the bars: the outline of each entry that carried something. */}
        {lane.groups.map((group) => (
          <span
            key={`${group.row}:${group.offset}`}
            className="timeline-group"
            aria-hidden="true"
            style={
              {
                left: percent(group.offset, months),
                width: percent(group.length, months),
                '--row': group.row,
                '--group-rows': group.rows,
              } as CSSProperties
            }
          />
        ))}
        {lane.bars.map(({ key, entry, offset, length, row, depth, caption, block, schedule }) => {
          // A segment of a degree's blocks is named by its academic year; it
          // leads to the degree.
          const period = formatPeriod(block?.period ?? entry.period, lang, strings.ongoing);
          // Said aloud too: a degree followed on an evening schedule.
          const evening = schedule === 'evening' ? strings.scheduleEvening : undefined;
          const name = [block ? caption : entry.title, entry.organisation, period, evening]
            .filter(Boolean)
            .join(' — ');
          return (
            <Link
              key={key}
              to={`${entryPath(lang, entry)}${search}`}
              preventScrollReset
              className="timeline-bar"
              data-bar-key={key}
              data-entry-id={entry.id}
              data-kind={block ? 'block' : entry.kind}
              data-depth={depth}
              data-schedule={schedule}
              aria-label={name}
              aria-current={entry.id === selectedId && !block ? 'page' : undefined}
              aria-describedby={key === previewKey ? 'timeline-preview' : undefined}
              data-dimmed={highlight ? !highlight.has(entry.id) : undefined}
              onMouseEnter={() => onPreview(key)}
              onMouseLeave={() => onPreview(undefined)}
              onFocus={() => onPreview(key)}
              onBlur={() => onPreview(undefined)}
              style={
                {
                  left: percent(offset, months),
                  width: percent(length, months),
                  '--row': row,
                } as CSSProperties
              }
            >
              <span>{caption}</span>
            </Link>
          );
        })}
        {previewed && <TimelinePreview bar={previewed} months={months} above={last} />}
      </div>
    </div>
  );
}

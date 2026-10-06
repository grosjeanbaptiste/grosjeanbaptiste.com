// One lane of the timeline: its label, then a link per entry, placed in
// percent of the whole career — an entry's projects and volunteering drawn
// under it, inside its outline. The open entry is aria-current; with a skill
// filter on, the entries that do not use it fade back.
import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router';
import type { TimelineLane as Lane, TimelineBar } from '../../domain/timeline';
import { useKindLabel, useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath } from '../paths';
import { TimelinePreview } from './TimelinePreview';

const percent = (part: number, whole: number) => `${(part / whole) * 100}%`;

// Where a bar leads and what it is: a segment of a degree's blocks is named by
// its academic year and leads to the degree; a course unit under it leads to
// the unit; any other bar to its own entry.
function leadOf({ entry, block, unit }: TimelineBar) {
  if (unit) return { target: unit, kind: 'unit' };
  return { target: entry, kind: block ? 'block' : entry.kind };
}

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
        {lane.bars.map((bar) => {
          const { key, entry, block, schedule } = bar;
          const { target, kind } = leadOf(bar);
          const period = formatPeriod(block?.period ?? entry.period, lang, strings.ongoing);
          // Said aloud too: a degree followed on an evening schedule.
          const evening = schedule === 'evening' ? strings.scheduleEvening : undefined;
          const name = [block ? bar.caption : entry.title, entry.organisation, period, evening]
            .filter(Boolean)
            .join(' — ');
          return (
            <Link
              key={key}
              to={`${entryPath(lang, target)}${search}`}
              preventScrollReset
              className="timeline-bar"
              data-bar-key={key}
              data-entry-id={target.id}
              data-kind={kind}
              data-depth={bar.depth}
              data-schedule={schedule}
              aria-label={name}
              aria-current={target.id === selectedId && kind !== 'block' ? 'page' : undefined}
              aria-describedby={key === previewKey ? 'timeline-preview' : undefined}
              data-dimmed={highlight ? !highlight.has(target.id) : undefined}
              onMouseEnter={() => onPreview(key)}
              onMouseLeave={() => onPreview(undefined)}
              onFocus={() => onPreview(key)}
              onBlur={() => onPreview(undefined)}
              style={
                {
                  left: percent(bar.offset, months),
                  width: percent(bar.length, months),
                  '--row': bar.row,
                } as CSSProperties
              }
            >
              <span>{bar.caption}</span>
            </Link>
          );
        })}
        {previewed && <TimelinePreview bar={previewed} months={months} above={last} />}
      </div>
    </div>
  );
}

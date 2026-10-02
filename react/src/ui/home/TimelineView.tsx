// Interactive timeline: one lane per kind, a bar per entry, positioned in
// percent of the whole span. Every bar is a link to its entry page; with a
// skill filter on, the bars that do not use it fade back.
import { type CSSProperties, useState } from 'react';
import { Link } from 'react-router';
import { timelineOf } from '../../domain/timeline';
import { useKindLabel, useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath } from '../paths';
import { DEFAULT_ZOOM, TimelineZoom, type Zoom, sinceYearOf } from './TimelineZoom';

const percent = (part: number, whole: number) => `${(part / whole) * 100}%`;

export function TimelineView({ highlight }: { highlight: ReadonlySet<string> | null }) {
  const { lang, catalogue, strings, today } = useReading();
  const label = useKindLabel();
  const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
  const timeline = timelineOf(catalogue.entries, today, sinceYearOf(zoom, today));

  return (
    <section className="timeline" aria-labelledby="timeline-title">
      <div className="timeline-head">
        <h2 id="timeline-title">{strings.timeline}</h2>
        <TimelineZoom zoom={zoom} onZoom={setZoom} />
      </div>
      <div className="timeline-scroll">
        <div className="timeline-grid">
          <div className="timeline-years" aria-hidden="true">
            {timeline.years.map(({ year, offset }) => (
              <span key={year} style={{ left: percent(offset, timeline.months) }}>
                {year}
              </span>
            ))}
          </div>
          {timeline.lanes.map((lane) => (
            <div key={lane.kind} className="timeline-lane" data-kind={lane.kind}>
              <span className="timeline-lane-label">{label(lane.kind)}</span>
              <div className="timeline-track" style={{ '--rows': lane.rows } as CSSProperties}>
                {lane.bars.map(({ entry, offset, length, row }) => {
                  const period = formatPeriod(entry.period, lang, strings.ongoing);
                  const name = [entry.title, entry.organisation, period]
                    .filter(Boolean)
                    .join(' — ');
                  return (
                    <Link
                      key={entry.id}
                      to={entryPath(lang, entry)}
                      className="timeline-bar"
                      aria-label={name}
                      title={name}
                      data-dimmed={highlight ? !highlight.has(entry.id) : undefined}
                      viewTransition
                      style={
                        {
                          left: percent(offset, timeline.months),
                          width: percent(length, timeline.months),
                          '--row': row,
                        } as CSSProperties
                      }
                    >
                      <span>{entry.organisation ?? entry.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// The timeline is how the CV is browsed: one lane per kind of entry, a bar
// per entry. Clicking a bar opens it under the timeline; the arrow keys walk
// from bar to bar; hovering previews. Zooming changes the scale, never what is
// shown: the whole career is always there, scrolled to today.
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { timelineOf } from '../../domain/timeline';
import { type Direction, neighbour } from '../../domain/timeline-navigation';
import { useReading } from '../context';
import { TimelineLane } from './TimelineLane';
import { DEFAULT_ZOOM, TimelineZoom, type Zoom, widthOf } from './TimelineZoom';

const KEYS: Readonly<Record<string, Direction>> = {
  ArrowRight: 'next',
  ArrowLeft: 'previous',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

// Entry ids are slugs ([a-z0-9-]), safe inside an attribute selector as is.
const barIn = (frame: HTMLElement | null, id: string) =>
  frame?.querySelector<HTMLElement>(`[data-entry-id="${id}"]`);

interface Props {
  readonly highlight: ReadonlySet<string> | null;
  readonly selectedId: string | undefined;
}

export function TimelineView({ highlight, selectedId }: Props) {
  const { catalogue, strings, today } = useReading();
  const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
  const [previewId, setPreviewId] = useState<string>();
  const frame = useRef<HTMLDivElement>(null);
  const timeline = timelineOf(catalogue.entries, today);

  // On a new scale, show the open entry — or today, when none is open.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new zoom must re-scroll, though the body never reads it
  useEffect(() => {
    const scroller = frame.current;
    if (!scroller) return;
    const selected = selectedId ? barIn(scroller, selectedId) : undefined;
    if (selected) selected.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    else scroller.scrollLeft = scroller.scrollWidth;
  }, [zoom, selectedId]);

  const walk = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = KEYS[event.key];
    const from = (event.target as HTMLElement).dataset.entryId;
    if (!direction || !from) return;
    event.preventDefault();
    const to = neighbour(timeline, from, direction);
    if (to) barIn(frame.current, to)?.focus();
  };

  return (
    <section className="timeline" aria-labelledby="timeline-title">
      <div className="timeline-head">
        <h2 id="timeline-title">{strings.timeline}</h2>
        <TimelineZoom zoom={zoom} onZoom={setZoom} />
      </div>
      <div className="timeline-scroll" ref={frame}>
        {/* The arrow keys move between the bars, which are the links: the grid only listens. */}
        <div
          className="timeline-grid"
          style={{ width: `${widthOf(zoom, timeline.months)}%` }}
          onKeyDown={walk}
        >
          <div className="timeline-years" aria-hidden="true">
            {timeline.years.map(({ year, offset }) => (
              <span key={year} style={{ left: `${(offset / timeline.months) * 100}%` }}>
                {year}
              </span>
            ))}
          </div>
          {timeline.lanes.map((lane, index) => (
            <TimelineLane
              key={lane.kind}
              lane={lane}
              months={timeline.months}
              selectedId={selectedId}
              previewId={previewId}
              highlight={highlight}
              onPreview={setPreviewId}
              last={index === timeline.lanes.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

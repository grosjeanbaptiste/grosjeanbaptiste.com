import { useReading } from '../context';

export const ZOOMS = [3, 5, null] as const; // years shown; null = the whole career
export type Zoom = (typeof ZOOMS)[number];
export const DEFAULT_ZOOM: Zoom = 5;

// First year a zoom shows: the last `years` calendar years, this one included.
export const sinceYearOf = (zoom: Zoom, today: Date) =>
  zoom === null ? undefined : today.getUTCFullYear() - zoom + 1;

export function TimelineZoom({ zoom, onZoom }: { zoom: Zoom; onZoom: (zoom: Zoom) => void }) {
  const { strings } = useReading();
  return (
    <fieldset className="timeline-zoom" aria-label={strings.timeline}>
      {ZOOMS.map((option) => (
        <button
          key={option ?? 'all'}
          type="button"
          aria-pressed={option === zoom}
          onClick={() => onZoom(option)}
        >
          {option === null ? strings.wholeCareer : strings.lastYears(option)}
        </button>
      ))}
    </fieldset>
  );
}

import { useReading } from '../context';

export const ZOOMS = [2, 5, null] as const; // years per screen; null = the whole career
export type Zoom = (typeof ZOOMS)[number];
export const DEFAULT_ZOOM: Zoom = 5;

// How far the time axis is stretched: 1 fits the whole career in the frame,
// more shows exactly `zoom` years of it (the frame scrolls), never less than 1.
// styles/timeline.css keeps the lane titles' column out of the sum.
export const stretchOf = (zoom: Zoom, months: number) =>
  zoom === null ? 1 : Math.max(1, months / (zoom * 12));

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

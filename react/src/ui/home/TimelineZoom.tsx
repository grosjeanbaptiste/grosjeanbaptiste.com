import { useReading } from '../context';

export const ZOOMS = [2, 5, null] as const; // years per screen; null = the whole career
export type Zoom = (typeof ZOOMS)[number];
export const DEFAULT_ZOOM: Zoom = 5;

// Width of the drawn career, in percent of its frame: wider than the frame
// when zoomed in (the frame scrolls), never narrower.
export const widthOf = (zoom: Zoom, months: number) =>
  zoom === null ? 100 : Math.max(100, (months / (zoom * 12)) * 100);

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

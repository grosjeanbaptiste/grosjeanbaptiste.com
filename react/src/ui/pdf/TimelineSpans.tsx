// The timeline reader's choice of span — the interactive view's zoom options:
// two years, five years, the whole career. Kept in the URL (?span=2) so a
// shared link opens the same PDF.
import { useSearchParams } from 'react-router';
import { useReading } from '../context';
import type { TimelineSpan } from '../paths';

export const SPANS: readonly TimelineSpan[] = [2, 5, null];

// The span a URL names; anything else is the whole career, said out loud.
export function spanOf(params: URLSearchParams): TimelineSpan {
  const raw = params.get('span');
  if (raw === null) return null;
  const span = SPANS.find((s) => s !== null && String(s) === raw);
  if (span === undefined) console.warn(`Unknown timeline span "${raw}": showing the whole career`);
  return span ?? null;
}

export function TimelineSpans() {
  const { strings } = useReading();
  const [params, setParams] = useSearchParams();
  const current = spanOf(params);
  return (
    <fieldset className="timeline-zoom" aria-label={strings.timeline}>
      {SPANS.map((span) => (
        <button
          key={span ?? 'all'}
          type="button"
          aria-pressed={span === current}
          onClick={() => setParams(span === null ? {} : { span: String(span) })}
        >
          {span === null ? strings.wholeCareer : strings.lastYears(span)}
        </button>
      ))}
    </fieldset>
  );
}

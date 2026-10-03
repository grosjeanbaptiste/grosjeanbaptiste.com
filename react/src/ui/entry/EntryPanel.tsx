// The open entry, shown under the timeline: what the bar stands for, its
// skills (each a filter) and the entries it is linked to (a degree lists its
// course units here). Escape or the close button go back to the timeline.
import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { Entry } from '../../domain/entry';
import { useKindLabel, useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath, homePath, skillPath } from '../paths';
import { EntryFacts } from './EntryFacts';

export function EntryPanel({ entry }: { entry: Entry }) {
  const { lang, catalogue, strings } = useReading();
  const label = useKindLabel();
  const navigate = useNavigate();
  const { search } = useLocation();
  const panel = useRef<HTMLElement>(null);
  const close = () => navigate(`${homePath(lang)}${search}`, { preventScrollReset: true });
  const related = catalogue.relatedTo(entry.id);

  useEffect(() => {
    document.title = `${entry.title} — ${catalogue.basics.name}`;
    panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [entry, catalogue]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Escape inside the ⌘K palette closes the palette, not the entry.
      const inDialog = event.target instanceof Element && event.target.closest('[role="dialog"]');
      if (event.key === 'Escape' && !event.defaultPrevented && !inDialog) close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <section ref={panel} className="entry-panel" aria-labelledby="entry-title">
      <button type="button" className="entry-close" onClick={close} aria-label={strings.close}>
        ×
      </button>
      <p className="entry-kind">{label(entry.kind)}</p>
      <h2 id="entry-title">{entry.title}</h2>
      {entry.subtitle && <p className="entry-subtitle">{entry.subtitle}</p>}
      <EntryFacts
        entry={entry}
        period={entry.period && formatPeriod(entry.period, lang, strings.ongoing)}
      />
      {entry.skills.length > 0 && (
        <ul className="chips" aria-label={strings.skills}>
          {entry.skills.map((skill) => (
            <li key={skill}>
              <Link to={skillPath(lang, skill)} className="chip" preventScrollReset>
                {skill}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {related.length > 0 && (
        <div className="entry-related">
          <h3>{strings.related}</h3>
          <ul className="related">
            {related.map((other) => (
              <li key={other.id}>
                <Link
                  to={`${entryPath(lang, other)}${search}`}
                  className="related-link"
                  preventScrollReset
                >
                  <strong>{other.title}</strong>
                  <span>{label(other.kind)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

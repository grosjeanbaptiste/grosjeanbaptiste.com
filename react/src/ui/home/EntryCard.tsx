import { Link } from 'react-router';
import type { Entry } from '../../domain/entry';
import { useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath } from '../paths';

const MAX_TAGS = 6;

export function EntryCard({ entry, compact = false }: { entry: Entry; compact?: boolean }) {
  const { lang, strings } = useReading();
  const extra = entry.skills.length - MAX_TAGS;

  return (
    <article className={compact ? 'card card-compact' : 'card'}>
      <h3 className="card-title">
        <Link to={entryPath(lang, entry)} className="card-link" viewTransition>
          {entry.title}
        </Link>
      </h3>
      {entry.organisation && <p className="card-org">{entry.organisation}</p>}
      {entry.period && (
        <p className="card-period">{formatPeriod(entry.period, lang, strings.ongoing)}</p>
      )}
      {!compact && entry.subtitle && <p className="card-subtitle">{entry.subtitle}</p>}
      {!compact && entry.skills.length > 0 && (
        <ul className="tags" aria-label={strings.skills}>
          {entry.skills.slice(0, MAX_TAGS).map((skill) => (
            <li key={skill} className="tag">
              {skill}
            </li>
          ))}
          {extra > 0 && <li className="tag tag-more">+{extra}</li>}
        </ul>
      )}
    </article>
  );
}

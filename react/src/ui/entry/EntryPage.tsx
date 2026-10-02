import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { NotFound } from '../NotFound';
import { useKindLabel, useReading } from '../context';
import { formatPeriod } from '../format';
import { entryPath, homePath, skillPath } from '../paths';

export function EntryPage() {
  const { kind, id = '' } = useParams();
  const { lang, catalogue, strings } = useReading();
  const label = useKindLabel();
  const entry = catalogue.entry(id);

  useEffect(() => {
    if (entry) document.title = `${entry.title} — ${catalogue.basics.name}`;
    window.scrollTo?.({ top: 0 });
  }, [entry, catalogue]);

  if (!entry || entry.kind !== kind) return <NotFound strings={strings} />;
  const related = catalogue.relatedTo(entry.id);

  return (
    <article className="entry-page">
      <Link to={homePath(lang)} className="back-link" viewTransition>
        ← {strings.back}
      </Link>
      <p className="entry-kind">{label(entry.kind)}</p>
      <h1>{entry.title}</h1>
      {entry.subtitle && <p className="entry-subtitle">{entry.subtitle}</p>}
      <p className="entry-meta">
        {entry.organisation &&
          (entry.url ? (
            <a href={entry.url} target="_blank" rel="noopener noreferrer">
              {entry.organisation}
            </a>
          ) : (
            <span>{entry.organisation}</span>
          ))}
        {entry.period && <span>{formatPeriod(entry.period, lang, strings.ongoing)}</span>}
        {entry.location && <span>{entry.location}</span>}
      </p>
      {entry.summary && <p className="entry-summary">{entry.summary}</p>}
      {entry.details.length > 0 && (
        <ul className="entry-details">
          {entry.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
      {entry.skills.length > 0 && (
        <section aria-labelledby="entry-skills">
          <h2 id="entry-skills">{strings.skills}</h2>
          <ul className="chips">
            {entry.skills.map((skill) => (
              <li key={skill}>
                <Link to={skillPath(lang, skill)} className="chip" viewTransition>
                  {skill}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {related.length > 0 && (
        <section aria-labelledby="entry-related">
          <h2 id="entry-related">{strings.related}</h2>
          <ul className="related">
            {related.map((other) => (
              <li key={other.id}>
                <Link to={entryPath(lang, other)} className="related-link" viewTransition>
                  <strong>{other.title}</strong>
                  <span>{label(other.kind)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

import type { Entry } from '../../domain/entry';

// Where and when, then what: organisation (linked when it has a site), period,
// place, summary and the remaining details (grade, roles, project type).
export function EntryFacts({ entry, period }: { entry: Entry; period?: string }) {
  return (
    <>
      <p className="entry-meta">
        {entry.organisation &&
          (entry.url ? (
            <a href={entry.url} target="_blank" rel="noopener noreferrer">
              {entry.organisation}
            </a>
          ) : (
            <span>{entry.organisation}</span>
          ))}
        {period && <span>{period}</span>}
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
    </>
  );
}

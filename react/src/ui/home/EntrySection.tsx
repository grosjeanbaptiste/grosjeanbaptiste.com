import type { Entry, EntryKind } from '../../domain/entry';
import { useKindLabel, useReading } from '../context';
import { EntryCard } from './EntryCard';

interface Props {
  readonly kind: EntryKind;
  readonly entries: readonly Entry[];
  // Course units, folded under the degrees they belong to.
  readonly courses?: readonly Entry[];
}

export function EntrySection({ kind, entries, courses = [] }: Props) {
  const { strings } = useReading();
  const label = useKindLabel();
  if (entries.length === 0 && courses.length === 0) return null;
  const titleId = `section-${kind}`;

  return (
    <section className="entry-section" aria-labelledby={titleId}>
      <h2 id={titleId}>{label(kind)}</h2>
      <div className="cards">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      {courses.length > 0 && (
        <details className="courses">
          <summary>{strings.showCourses(courses.length)}</summary>
          <div className="cards cards-compact">
            {courses.map((entry) => (
              <EntryCard key={entry.id} entry={entry} compact />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

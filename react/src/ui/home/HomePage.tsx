// The CV: who, a skill filter, and the timeline to browse it. Under
// /:lang/:kind/:id the same page opens that entry under the timeline.
import { useParams, useSearchParams } from 'react-router';
import { entriesUsing } from '../../domain/skills';
import { NotFound } from '../NotFound';
import { useReading } from '../context';
import { EntryPanel } from '../entry/EntryPanel';
import { Hero } from './Hero';
import { SkillFilter } from './SkillFilter';
import { TimelineView } from './TimelineView';

export function HomePage() {
  const { catalogue, strings } = useReading();
  const { kind, id } = useParams();
  const [params] = useSearchParams();
  const skill = params.get('skill');
  const entry = id ? catalogue.entry(id) : undefined;
  if (id && (!entry || entry.kind !== kind)) return <NotFound strings={strings} />;

  const visible = new Set(
    (skill ? entriesUsing(catalogue.entries, skill) : catalogue.entries).map((e) => e.id),
  );
  return (
    <>
      <Hero />
      <SkillFilter selected={skill} matches={skill ? visible.size : 0} />
      <TimelineView highlight={skill ? visible : null} selectedId={entry?.id} />
      {entry && <EntryPanel entry={entry} />}
    </>
  );
}

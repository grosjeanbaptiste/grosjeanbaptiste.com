import { useSearchParams } from 'react-router';
import { entriesUsing } from '../../domain/skills';
import { useReading } from '../context';
import { EntrySection } from './EntrySection';
import { Hero } from './Hero';
import { SkillFilter } from './SkillFilter';
import { TimelineView } from './TimelineView';

const SECTION_KINDS = ['work', 'project', 'education', 'volunteer'] as const;

export function HomePage() {
  const { catalogue } = useReading();
  const [params] = useSearchParams();
  const skill = params.get('skill');
  const visible = new Set(
    (skill ? entriesUsing(catalogue.entries, skill) : catalogue.entries).map((e) => e.id),
  );

  return (
    <>
      <Hero />
      <SkillFilter selected={skill} matches={skill ? visible.size : 0} />
      <TimelineView highlight={skill ? visible : null} />
      {SECTION_KINDS.map((kind) => (
        <EntrySection
          key={kind}
          kind={kind}
          entries={catalogue.ofKind(kind).filter((e) => visible.has(e.id))}
          courses={
            kind === 'education'
              ? catalogue.ofKind('course').filter((e) => visible.has(e.id))
              : undefined
          }
        />
      ))}
    </>
  );
}

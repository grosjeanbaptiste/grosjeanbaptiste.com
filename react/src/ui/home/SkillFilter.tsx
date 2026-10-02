import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { skillUsage } from '../../domain/skills';
import { useReading } from '../context';

const SHORTLIST = 18;

export function SkillFilter({ selected, matches }: { selected: string | null; matches: number }) {
  const { catalogue, strings } = useReading();
  const [, setParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);
  const usage = skillUsage(catalogue.entries);
  const shown = expanded ? usage : usage.slice(0, SHORTLIST);
  // A skill chosen from the palette may sit outside the shortlist: keep it visible.
  const list =
    selected && !shown.some((s) => s.skill === selected)
      ? [...shown, ...usage.filter((s) => s.skill === selected)]
      : shown;

  const choose = (skill: string | null) =>
    setParams(skill && skill !== selected ? { skill } : {}, { preventScrollReset: true });

  return (
    <section className="skill-filter" aria-labelledby="skill-filter-title">
      <h2 id="skill-filter-title">{strings.filterBySkill}</h2>
      <ul className="chips">
        {list.map(({ skill, uses }) => (
          <li key={skill}>
            <button
              type="button"
              className="chip"
              aria-pressed={skill === selected}
              onClick={() => choose(skill)}
            >
              {skill} <span className="chip-count">{uses}</span>
            </button>
          </li>
        ))}
        {usage.length > SHORTLIST && (
          <li>
            <button type="button" className="chip chip-more" onClick={() => setExpanded(!expanded)}>
              {expanded ? strings.fewerSkills : `${strings.allSkills} (${usage.length})`}
            </button>
          </li>
        )}
      </ul>
      {selected && (
        <p className="skill-filter-status">
          <output>{strings.matching(matches, selected)}</output>
          <button type="button" className="link-button" onClick={() => choose(null)}>
            {strings.clearFilter}
          </button>
        </p>
      )}
    </section>
  );
}

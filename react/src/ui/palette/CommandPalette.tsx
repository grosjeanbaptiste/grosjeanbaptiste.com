// ⌘K palette: one box to reach any entry, filter by any skill, or act
// (language, theme, PDF). Ranking is the domain's search; cmdk only renders.
import { Command } from 'cmdk';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { search } from '../../domain/search';
import { skillUsage } from '../../domain/skills';
import { fold } from '../../domain/text';
import { useKindLabel, useReading } from '../context';
import { entryPath, skillPath } from '../paths';
import { usePaletteActions } from './actions';
import { usePaletteShortcut } from './use-shortcut';

const MAX_SKILLS = 6;
const MAX_ENTRIES = 20;

interface Props {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const { lang, catalogue, strings } = useReading();
  const label = useKindLabel();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  usePaletteShortcut(open, onOpenChange);

  const hits = search(catalogue.entries, query);
  const skills = query
    ? hits.flatMap((h) => (h.type === 'skill' ? [h] : [])).slice(0, MAX_SKILLS)
    : skillUsage(catalogue.entries).slice(0, MAX_SKILLS);
  const entries = hits.flatMap((h) => (h.type === 'entry' ? [h.entry] : [])).slice(0, MAX_ENTRIES);
  const actions = usePaletteActions().filter((a) => fold(a.label).includes(fold(query.trim())));

  const pick = (run: () => void) => () => {
    onOpenChange(false);
    setQuery('');
    run();
  };

  const entryGroup = entries.length > 0 && (
    <Command.Group heading={strings.entries}>
      {entries.map((entry) => (
        <Command.Item
          key={entry.id}
          value={`entry:${entry.id}`}
          onSelect={pick(() => navigate(entryPath(lang, entry), { viewTransition: true }))}
        >
          <span className="palette-title">{entry.title}</span>
          <span className="palette-hint">
            {[entry.organisation, label(entry.kind)].filter(Boolean).join(' · ')}
          </span>
        </Command.Item>
      ))}
    </Command.Group>
  );
  const skillGroup = skills.length > 0 && (
    <Command.Group heading={strings.skills}>
      {skills.map(({ skill, uses }) => (
        <Command.Item
          key={skill}
          value={`skill:${skill}`}
          onSelect={pick(() => navigate(skillPath(lang, skill), { viewTransition: true }))}
        >
          <span className="palette-title">{skill}</span>
          <span className="palette-hint">{strings.matching(uses, skill)}</span>
        </Command.Item>
      ))}
    </Command.Group>
  );
  // An exact skill name outranks every entry: show the skill group first then.
  const skillsFirst = hits[0]?.type === 'skill';

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={strings.search}
      shouldFilter={false}
      loop
      overlayClassName="palette-overlay"
      contentClassName="palette"
    >
      <Command.Input
        value={query}
        onValueChange={setQuery}
        placeholder={strings.searchPlaceholder}
      />
      <Command.List>
        <Command.Empty>{strings.noResults}</Command.Empty>
        {skillsFirst ? skillGroup : entryGroup}
        {skillsFirst ? entryGroup : skillGroup}
        {actions.length > 0 && (
          <Command.Group heading={strings.actions}>
            {actions.map((action) => (
              <Command.Item key={action.id} value={action.id} onSelect={pick(action.run)}>
                <span className="palette-title">{action.label}</span>
                {action.hint && <span className="palette-hint">{action.hint}</span>}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}

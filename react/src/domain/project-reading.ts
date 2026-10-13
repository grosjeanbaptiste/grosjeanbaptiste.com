// What a project tells beyond its name: what kind of project it is ("API",
// "Mobile Application") and the parts taken in it ("Founder"). The timeline
// reads the kind on the bar and both in the preview.
import type { Entry } from './entry';

const SEPARATOR = ' · ';

// What a bar reads when the entry's title is all it has to go by: a project's
// kind tells two bars of one product apart ("Acteble API · API").
export const readingOf = (entry: Entry): string =>
  entry.type ? `${entry.title}${SEPARATOR}${entry.type}` : entry.title;

// At a glance: the kind of the project, then the parts taken in it. Nothing
// for any other entry — an experience's details are its highlights.
export function natureOf(entry: Entry): string {
  if (entry.kind !== 'project') return '';
  const roles = entry.details.filter((detail) => detail !== entry.type);
  return [entry.type, ...roles].filter(Boolean).join(SEPARATOR);
}

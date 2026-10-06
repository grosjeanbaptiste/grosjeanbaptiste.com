// Factory: normalises the five CV sections into entries and resolves the
// cross-references between them. A dangling reference is a data bug — it throws.
import type { Entry } from './entry';
import { Period, periodOf } from './period';
import { degreePeriods, links } from './relations';
import type {
  CompetitionRecord,
  EducationRecord,
  ProjectRecord,
  Resume,
  VolunteerRecord,
  WorkRecord,
} from './resume';

const fromWork = (w: WorkRecord): Entry => ({
  kind: 'work',
  id: w.id,
  title: w.position,
  organisation: w.company,
  location: w.location,
  period: periodOf(w),
  summary: w.summary,
  details: w.highlights ?? [],
  skills: w.skills ?? [],
  url: w.url,
  related: [],
});

// A block names its units as the CV names them; the entries go by id.
const blocksOf = (e: EducationRecord, idOf: (name: string) => string) =>
  e.blocks?.map((b) => ({
    year: b.year,
    label: b.label,
    period: Period.of(b.startDate, b.endDate),
    units: b.units.map(idOf),
  }));

const fromEducation = (e: EducationRecord, idOf: (name: string) => string): Entry => ({
  kind: 'education',
  id: e.id,
  title: e.studyType ?? e.institution,
  subtitle: e.area,
  organisation: e.institution,
  period: periodOf(e),
  summary: e.summary,
  details: e.gpa ? [e.gpa] : [],
  skills: e.skills ?? [],
  url: e.url,
  related: [],
  blocks: blocksOf(e, idOf),
});

const fromProject = (p: ProjectRecord, inherited?: Period): Entry => ({
  kind: p.courseUnit ? 'course' : 'project',
  id: p.id,
  title: p.name,
  subtitle: p.description,
  organisation: p.entity,
  period: periodOf(p) ?? inherited,
  summary: p.summary,
  details: [...(p.roles ?? []), ...(p.type && !p.courseUnit ? [p.type] : [])],
  skills: p.keywords ?? [],
  url: p.url,
  related: [],
});

const fromVolunteer = (v: VolunteerRecord): Entry => ({
  kind: 'volunteer',
  id: v.id,
  title: v.position,
  organisation: v.organization,
  period: periodOf(v),
  summary: v.summary,
  details: [],
  skills: [],
  url: v.url,
  related: [],
});

// Held on a day; on a time axis it shows as its month — a day would be a
// hairline.
const fromCompetition = (c: CompetitionRecord): Entry => ({
  kind: 'competition',
  id: c.id,
  title: c.title,
  organisation: c.organizer,
  period: Period.of(c.date.slice(0, 7), c.date.slice(0, 7)),
  summary: c.summary,
  details: [],
  skills: [],
  url: c.url,
  related: [],
});

export function entriesOf(resume: Resume): Entry[] {
  const graph = links(resume);
  const inherited = degreePeriods(resume);
  const ids = new Map(resume.projects.map((p) => [p.name, p.id]));
  const idOf = (name: string) => {
    const id = ids.get(name);
    if (!id) throw new Error(`A block names an unknown course unit "${name}"`);
    return id;
  };
  const entries = [
    ...resume.work.map(fromWork),
    ...resume.education.map((e) => fromEducation(e, idOf)),
    ...(resume.competitions ?? []).map(fromCompetition),
    ...resume.projects.map((p) => fromProject(p, inherited.get(p.name))),
    ...resume.volunteer.map(fromVolunteer),
  ];
  return entries.map((e) => ({ ...e, related: [...(graph.get(e.id) ?? [])] }));
}

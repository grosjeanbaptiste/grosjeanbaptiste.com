// Factory: normalises the five CV sections into entries and resolves the
// cross-references between them. A dangling reference is a data bug — it throws.
import type { Entry } from './entry';
import { type Period, periodOf } from './period';
import { degreePeriods, links } from './relations';
import type { EducationRecord, ProjectRecord, Resume, VolunteerRecord, WorkRecord } from './resume';

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

const fromEducation = (e: EducationRecord): Entry => ({
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

export function entriesOf(resume: Resume): Entry[] {
  const graph = links(resume);
  const inherited = degreePeriods(resume);
  const entries = [
    ...resume.work.map(fromWork),
    ...resume.education.map(fromEducation),
    ...resume.projects.map((p) => fromProject(p, inherited.get(p.name))),
    ...resume.volunteer.map(fromVolunteer),
  ];
  return entries.map((e) => ({ ...e, related: [...(graph.get(e.id) ?? [])] }));
}

// Cross-references between sections: jobs and degrees name the projects and
// course units they produced. Names resolve to ids; an unknown name throws.
import { type Period, periodOf } from './period';
import type { Resume } from './resume';

type Referrer = { readonly id: string; readonly projects?: readonly string[] };

export function links(resume: Resume): Map<string, Set<string>> {
  const idByName = new Map(resume.projects.map((p) => [p.name, p.id]));
  const graph = new Map<string, Set<string>>();
  const connect = (a: string, b: string) => {
    graph.set(a, (graph.get(a) ?? new Set()).add(b));
    graph.set(b, (graph.get(b) ?? new Set()).add(a));
  };
  for (const referrer of [...resume.work, ...resume.education] as Referrer[]) {
    for (const name of referrer.projects ?? []) {
      const target = idByName.get(name);
      if (!target) throw new Error(`${referrer.id} names an unknown project "${name}"`);
      connect(referrer.id, target);
    }
  }
  return graph;
}

// A course unit carries no dates of its own: it lasts as long as its degree.
export function degreePeriods(resume: Resume): Map<string, Period> {
  const out = new Map<string, Period>();
  for (const degree of resume.education) {
    const period = periodOf(degree);
    if (!period) continue;
    for (const name of degree.projects ?? []) out.set(name, period);
  }
  return out;
}

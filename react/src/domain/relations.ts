// Cross-references between sections: jobs, degrees and competitions name the
// projects and course units they produced (names resolve to ids; an unknown
// name throws), and a volunteering role belongs to the job or degree of its
// organisation.
import { type Period, periodOf } from './period';
import type { Resume } from './resume';

type Referrer = { readonly id: string; readonly projects?: readonly string[] };

// The classic page embeds a role under the entry whose name holds the first
// word of its organisation ("EPHEC …" under "… (EPHEC-EPS)"): same rule. Gives
// [role id, host id] pairs.
function hostedRoles(resume: Resume): [string, string][] {
  const hosts = [
    ...resume.work.map((w) => ({ id: w.id, name: w.company })),
    ...resume.education.map((e) => ({ id: e.id, name: e.institution })),
  ];
  return resume.volunteer.flatMap((role) => {
    const word = role.organization.split(/\s+/)[0];
    if (!word) return [];
    return hosts
      .filter((host) => host.name?.includes(word))
      .map((host): [string, string] => [role.id, host.id]);
  });
}

export function links(resume: Resume): Map<string, Set<string>> {
  const idByName = new Map(resume.projects.map((p) => [p.name, p.id]));
  const graph = new Map<string, Set<string>>();
  const connect = (a: string, b: string) => {
    graph.set(a, (graph.get(a) ?? new Set()).add(b));
    graph.set(b, (graph.get(b) ?? new Set()).add(a));
  };
  const referrers = [...resume.work, ...resume.education, ...(resume.competitions ?? [])];
  for (const referrer of referrers as Referrer[]) {
    for (const name of referrer.projects ?? []) {
      const target = idByName.get(name);
      if (!target) throw new Error(`${referrer.id} names an unknown project "${name}"`);
      connect(referrer.id, target);
    }
  }
  for (const [role, host] of hostedRoles(resume)) connect(role, host);
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

// Cross-references between sections: jobs, degrees and competitions name the
// projects they produced, and a degree the course units it carried — apart
// from its projects (names resolve to ids; an unknown name throws). A
// volunteering role belongs to the job or degree of its organisation.
import { type Period, periodOf } from './period';
import type { Resume } from './resume';

type Referrer = {
  readonly id: string;
  readonly projects?: readonly string[];
  readonly courses?: readonly string[];
};
type Named = { readonly name: string; readonly id: string };

// What a referrer names in one section, as ids.
function named(referrer: Referrer, names: readonly string[], pool: readonly Named[], what: string) {
  return names.map((name) => {
    const target = pool.find((entry) => entry.name === name);
    if (!target) throw new Error(`${referrer.id} names an unknown ${what} "${name}"`);
    return target.id;
  });
}

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
  const graph = new Map<string, Set<string>>();
  const connect = (a: string, b: string) => {
    graph.set(a, (graph.get(a) ?? new Set()).add(b));
    graph.set(b, (graph.get(b) ?? new Set()).add(a));
  };
  const referrers = [...resume.work, ...resume.education, ...(resume.competitions ?? [])];
  for (const referrer of referrers as Referrer[]) {
    const targets = [
      ...named(referrer, referrer.projects ?? [], resume.projects, 'project'),
      ...named(referrer, referrer.courses ?? [], resume.courses, 'course'),
    ];
    for (const target of targets) connect(referrer.id, target);
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
    for (const name of degree.courses ?? []) out.set(name, period);
  }
  return out;
}

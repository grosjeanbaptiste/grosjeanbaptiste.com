// Read model of one language's CV: the entries, indexed for the pages and
// the palette, plus the UI strings the static site already translates.
import { entriesOf } from '../domain/entries';
import type { Entry, EntryKind } from '../domain/entry';
import { Period } from '../domain/period';
import type { Basics, Resume, ResumeDocument } from '../domain/resume';

const newestFirst = (a: Entry, b: Entry) =>
  a.period && b.period ? Period.newestFirst(a.period, b.period) : 0;

export class Catalogue {
  private readonly byId: ReadonlyMap<string, Entry>;

  private constructor(
    readonly lang: string,
    private readonly ui: Readonly<Record<string, unknown>>,
    readonly resume: Resume,
    readonly entries: readonly Entry[],
  ) {
    this.byId = new Map(entries.map((e) => [e.id, e]));
  }

  static from(document: ResumeDocument): Catalogue {
    return new Catalogue(document.lang, document.ui, document.resume, entriesOf(document.resume));
  }

  get basics(): Basics {
    return this.resume.basics;
  }

  entry(id: string): Entry | undefined {
    return this.byId.get(id);
  }

  ofKind(kind: EntryKind): Entry[] {
    return this.entries.filter((e) => e.kind === kind).sort(newestFirst);
  }

  relatedTo(id: string): Entry[] {
    return (this.byId.get(id)?.related ?? []).flatMap((rid) => this.byId.get(rid) ?? []);
  }

  text(key: string): string {
    const value = this.ui[key];
    if (typeof value !== 'string')
      throw new Error(`No UI string "${key}" in the ${this.lang} export`);
    return value;
  }
}

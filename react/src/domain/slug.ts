// Explicit .ts: scripts/export-data.mjs runs this file under plain Node.
import { stripMarks } from './text.ts';

// URL-safe, language-stable identifier for an entry or a skill.
export function slugOf(text: string): string {
  return stripMarks(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

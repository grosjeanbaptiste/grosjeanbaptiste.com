import type { Period } from './period';

export type EntryKind = 'work' | 'education' | 'competition' | 'project' | 'course' | 'volunteer';

export const ENTRY_KINDS: readonly EntryKind[] = [
  'work',
  'education',
  'competition',
  'project',
  'course',
  'volunteer',
];

// One academic year of a degree, with the ids of the course units taken then.
export interface Block {
  readonly year: string;
  readonly label?: string;
  readonly period: Period;
  readonly units: readonly string[];
}

// One thing the CV tells: a job, a degree, a competition, a project, a course
// unit or a volunteering role. Search, the skill filter, the timeline and the detail
// pages all speak in entries, whatever section they came from.
export interface Entry {
  readonly kind: EntryKind;
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly organisation?: string;
  readonly location?: string;
  readonly period?: Period;
  readonly summary?: string;
  readonly details: readonly string[];
  readonly skills: readonly string[];
  readonly url?: string;
  // Ids of the entries this one names or is named by (job ↔ project, degree ↔ course).
  readonly related: readonly string[];
  // A degree's academic years, in order; absent when the CV does not divide it.
  readonly blocks?: readonly Block[];
  // Set on a degree followed on an evening schedule ("horaire décalé").
  readonly schedule?: 'evening';
}

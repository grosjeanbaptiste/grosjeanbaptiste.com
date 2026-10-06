// Published language: the shape of /app/data/{lang}.json as written by
// scripts/export-data.mjs — JSON Resume v1.0.0 plus the site extras, with a
// stable `id` on every entry. Only the fields the app reads are declared.

interface Identified {
  readonly id: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly url?: string;
  readonly summary?: string;
}

export interface WorkRecord extends Identified {
  readonly company: string;
  readonly position: string;
  readonly location?: string;
  readonly highlights?: readonly string[];
  readonly skills?: readonly string[];
  readonly projects?: readonly string[];
}

// One academic year of a degree: the programme's name for it when it has one,
// and the course units taken that year, by name.
export interface BlockRecord {
  readonly year: string;
  readonly label?: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly units: readonly string[];
}

export interface EducationRecord extends Identified {
  readonly institution: string;
  readonly studyType?: string;
  readonly area?: string;
  readonly gpa?: string;
  readonly skills?: readonly string[];
  readonly projects?: readonly string[];
  readonly blocks?: readonly BlockRecord[];
}

export interface ProjectRecord extends Identified {
  readonly name: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly type?: string;
  readonly roles?: readonly string[];
  readonly entity?: string;
  readonly courseUnit: boolean;
}

export interface VolunteerRecord extends Identified {
  readonly organization: string;
  readonly position: string;
}

export interface Profile {
  readonly network: string;
  readonly url: string;
}

export interface Basics {
  readonly name: string;
  readonly label: string;
  readonly image?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly summary?: string;
  readonly location?: { readonly city?: string; readonly region?: string };
  readonly profiles?: readonly Profile[];
}

// A competition (a hackathon): held on a day, and naming the projects built there.
export interface CompetitionRecord {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly organizer?: string;
  readonly summary?: string;
  readonly url?: string;
  readonly projects?: readonly string[];
}

export interface Resume {
  readonly basics: Basics;
  readonly work: readonly WorkRecord[];
  readonly education: readonly EducationRecord[];
  readonly projects: readonly ProjectRecord[];
  readonly volunteer: readonly VolunteerRecord[];
  readonly competitions?: readonly CompetitionRecord[];
  readonly skills: readonly { readonly name: string; readonly keywords: readonly string[] }[];
  readonly languages: readonly { readonly language: string; readonly fluency: string }[];
  readonly references?: readonly { readonly name: string; readonly reference: string }[];
}

// One display of the CV (classic, interactive, XSLT…), from scripts/lib/views.js.
export interface ViewLink {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly note?: string;
}

// A picture of one page of a shipped PDF, shown while PDF.js draws the page.
export interface PagePicture {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface ResumeDocument {
  readonly lang: string;
  readonly ui: Readonly<Record<string, unknown>>;
  readonly resume: Resume;
  readonly viewsTitle: string;
  readonly views: readonly ViewLink[];
  // Keyed by the path the site serves each PDF at.
  readonly pictures: Readonly<Record<string, readonly PagePicture[]>>;
}

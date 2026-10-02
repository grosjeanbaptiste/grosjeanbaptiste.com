import type { ResumeDocument } from './resume';

// Port: where the CV of one language comes from. The app knows nothing of
// HTTP or files; infrastructure decides.
export interface ResumeSource {
  load(lang: string): Promise<ResumeDocument>;
}

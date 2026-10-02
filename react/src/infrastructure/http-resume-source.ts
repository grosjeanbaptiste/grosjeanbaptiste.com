// Adapter: reads /app/data/{lang}.json, the documents scripts/export-data.mjs
// publishes next to the bundle.
import type { ResumeDocument } from '../domain/resume';
import type { ResumeSource } from '../domain/resume-source';

type Fetcher = (url: string) => Promise<Response>;

export class HttpResumeSource implements ResumeSource {
  constructor(
    private readonly base: string,
    private readonly fetcher: Fetcher = (url) => fetch(url),
  ) {}

  async load(lang: string): Promise<ResumeDocument> {
    const url = `${this.base}data/${lang}.json`;
    const response = await this.fetcher(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${url}`);
    const document = (await response.json()) as ResumeDocument;
    if (document.lang !== lang) {
      throw new Error(`${url} holds the "${document.lang}" CV, not "${lang}"`);
    }
    return document;
  }
}

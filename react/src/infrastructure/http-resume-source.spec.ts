import { describe, expect, it, vi } from 'vitest';
import { aResume } from '../domain/fixtures';
import { HttpResumeSource } from './http-resume-source';

const document = { lang: 'fr', ui: {}, resume: aResume() };

const respond = (status: number, body: unknown) =>
  vi.fn(async (_url: string) => new Response(JSON.stringify(body), { status }));

describe('HttpResumeSource', () => {
  it('fetches the exported document of the language under the base path', async () => {
    const fetcher = respond(200, document);
    await new HttpResumeSource('/app/', fetcher).load('fr');
    expect(fetcher).toHaveBeenCalledWith('/app/data/fr.json');
  });

  it('returns the parsed document', async () => {
    const loaded = await new HttpResumeSource('/app/', respond(200, document)).load('fr');
    expect(loaded.resume.basics.name).toBe('Baptiste Grosjean');
  });

  it('fails with the status and the url when the server refuses', async () => {
    const source = new HttpResumeSource('/app/', respond(404, {}));
    await expect(source.load('fr')).rejects.toThrow(/404.*\/app\/data\/fr\.json/);
  });

  it('fails when the document is for another language than asked', async () => {
    const source = new HttpResumeSource('/app/', respond(200, { ...document, lang: 'nl' }));
    await expect(source.load('fr')).rejects.toThrow(/nl.*fr/);
  });
});

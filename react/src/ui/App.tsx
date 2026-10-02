import { Navigate, Route, Routes } from 'react-router';
import { preferredLang } from '../application/lang';
import type { ResumeSource } from '../domain/resume-source';
import { LangShell } from './LangShell';

export interface AppProps {
  readonly source: ResumeSource;
  readonly browserLanguages: readonly string[];
  readonly today: Date;
}

export function App({ source, browserLanguages, today }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${preferredLang(browserLanguages)}`} replace />} />
      <Route path="/:lang/*" element={<LangShell source={source} today={today} />} />
    </Routes>
  );
}

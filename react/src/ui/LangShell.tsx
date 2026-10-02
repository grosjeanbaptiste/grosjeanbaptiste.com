// Everything under /:lang — loads that language's CV, then lays out the
// header, the page and the command palette around it.
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';
import { type Lang, isLang } from '../application/lang';
import type { ResumeSource } from '../domain/resume-source';
import { NotFound } from './NotFound';
import { ReadingProvider } from './context';
import { EntryPage } from './entry/EntryPage';
import { Header } from './header/Header';
import { HomePage } from './home/HomePage';
import { CommandPalette } from './palette/CommandPalette';
import { STRINGS } from './strings';
import { useTheme } from './theme';
import { useCatalogue } from './use-catalogue';

export function LangShell({ source, today }: { source: ResumeSource; today: Date }) {
  const { lang } = useParams();
  if (!isLang(lang)) return <NotFound strings={STRINGS.en} />;
  return <LoadedShell source={source} today={today} lang={lang} />;
}

function LoadedShell({ source, today, lang }: { source: ResumeSource; today: Date; lang: Lang }) {
  const loading = useCatalogue(source, lang);
  const { theme, toggle } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const strings = STRINGS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  if (loading.status === 'loading') {
    return (
      <p className="shell-message" aria-busy="true">
        {strings.loading}
      </p>
    );
  }
  if (loading.status === 'failed') {
    return (
      <p className="shell-message" role="alert">
        {strings.loadFailed} <code>{loading.error.message}</code>
      </p>
    );
  }

  const reading = {
    lang,
    catalogue: loading.catalogue,
    strings,
    today,
    theme,
    toggleTheme: toggle,
  };
  return (
    <ReadingProvider value={reading}>
      <Header onSearch={() => setPaletteOpen(true)} />
      <main className="page">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path=":kind/:id" element={<EntryPage />} />
          <Route path="*" element={<NotFound strings={strings} />} />
        </Routes>
      </main>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </ReadingProvider>
  );
}

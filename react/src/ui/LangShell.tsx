// Everything under /:lang — loads that language's CV, then lays out one of the
// two displays this app serves: the interactive CV (header, timeline, ⌘K
// palette) or, under /:lang/pdf, the PDF reader. Both sit under the views bar.
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';
import { type Lang, isLang } from '../application/lang';
import type { ResumeSource } from '../domain/resume-source';
import { NotFound } from './NotFound';
import { ReadingProvider, useReading } from './context';
import { Header } from './header/Header';
import { ViewsBar } from './header/ViewsBar';
import { HomePage } from './home/HomePage';
import { CommandPalette } from './palette/CommandPalette';
import { PdfReader } from './pdf/PdfReader';
import type { PdfRenderer } from './pdf/pdf-renderer';
import { STRINGS } from './strings';
import { useTheme } from './theme';
import { useCatalogue } from './use-catalogue';

interface ShellProps {
  readonly source: ResumeSource;
  readonly pdf: PdfRenderer;
  readonly today: Date;
}

export function LangShell(props: ShellProps) {
  const { lang } = useParams();
  if (!isLang(lang)) return <NotFound strings={STRINGS.en} />;
  return <LoadedShell {...props} lang={lang} />;
}

function LoadedShell({ source, pdf, today, lang }: ShellProps & { lang: Lang }) {
  const loading = useCatalogue(source, lang);
  const { theme, toggle } = useTheme();
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

  const catalogue = loading.catalogue;
  const reading = { lang, catalogue, strings, today, theme, toggleTheme: toggle };
  return (
    <ReadingProvider value={reading}>
      <Routes>
        <Route
          path="pdf"
          element={
            <>
              <ViewsBar current="pdf" />
              <PdfReader renderer={pdf} />
            </>
          }
        />
        <Route path="*" element={<InteractiveCv />} />
      </Routes>
    </ReadingProvider>
  );
}

function InteractiveCv() {
  const { strings } = useReading();
  const [paletteOpen, setPaletteOpen] = useState(false);
  return (
    <>
      <ViewsBar current="interactive" />
      <Header onSearch={() => setPaletteOpen(true)} />
      <main className="page">
        <Routes>
          <Route index element={<HomePage />} />
          {/* The same page, with that entry open under the timeline. */}
          <Route path=":kind/:id" element={<HomePage />} />
          <Route path="*" element={<NotFound strings={strings} />} />
        </Routes>
      </main>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}

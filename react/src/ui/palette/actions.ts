// Palette actions: what can be done from the keyboard besides going to an entry.
import { useLocation, useNavigate } from 'react-router';
import { LANGS } from '../../application/lang';
import { useReading } from '../context';
import { LANG_NAMES, pdfPath, withLang } from '../paths';

export interface PaletteAction {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly run: () => void;
}

export function usePaletteActions(): PaletteAction[] {
  const { lang, catalogue, strings, toggleTheme } = useReading();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const languages = LANGS.filter((other) => other !== lang).map((other) => ({
    id: `lang:${other}`,
    label: LANG_NAMES[other],
    hint: strings.switchTo,
    run: () => navigate(withLang(pathname, search, other), { viewTransition: true }),
  }));

  return [
    ...languages,
    { id: 'theme', label: catalogue.text('themeLabel'), run: toggleTheme },
    {
      id: 'pdf',
      label: catalogue.text('downloadCV'),
      hint: 'PDF',
      run: () => window.open(pdfPath(lang), '_blank', 'noopener'),
    },
    // The other displays of the CV — the same list the views bar shows.
    ...catalogue.views
      .filter((view) => view.id !== 'interactive')
      .map((view) => ({
        id: `view:${view.id}`,
        label: view.label,
        hint: catalogue.viewsTitle,
        run: () => window.location.assign(view.href),
      })),
  ];
}

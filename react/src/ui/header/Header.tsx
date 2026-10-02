import { Link } from 'react-router';
import { useReading } from '../context';
import { classicPath, homePath } from '../paths';
import { LangMenu } from './LangMenu';

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export function Header({ onSearch }: { onSearch: () => void }) {
  const { lang, catalogue, strings, theme, toggleTheme } = useReading();
  return (
    <header className="topbar">
      <Link to={homePath(lang)} className="topbar-brand" viewTransition>
        {catalogue.basics.name}
      </Link>
      <button type="button" className="topbar-search" onClick={onSearch}>
        <span className="topbar-search-label">{strings.search}</span>
        <kbd>{isMac() ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      <nav className="topbar-tools" aria-label={strings.actions}>
        <LangMenu />
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          aria-label={catalogue.text('themeLabel')}
          aria-pressed={theme === 'dark'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
        </button>
        <a className="topbar-classic" href={classicPath(lang)}>
          {strings.classicSite}
        </a>
      </nav>
    </header>
  );
}

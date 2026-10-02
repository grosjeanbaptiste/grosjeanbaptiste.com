import { useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { LANGS } from '../../application/lang';
import { useReading } from '../context';
import { LANG_NAMES, withLang } from '../paths';

// Same page in another language. A <details> keeps it usable without JS
// focus tricks; it closes itself once a language is picked.
export function LangMenu() {
  const { lang, catalogue } = useReading();
  const { pathname, search } = useLocation();
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => menu.current?.removeAttribute('open');

  return (
    <details className="lang-menu" ref={menu}>
      <summary aria-label={catalogue.text('langMenuLabel')}>{lang.toUpperCase()}</summary>
      <ul>
        {LANGS.map((other) => (
          <li key={other}>
            <Link
              to={withLang(pathname, search, other)}
              hrefLang={other}
              lang={other}
              aria-current={other === lang ? 'true' : undefined}
              onClick={close}
              viewTransition
            >
              {LANG_NAMES[other]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

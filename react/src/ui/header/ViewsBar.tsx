// The views bar: the same buttons every display of the CV shows (classic,
// interactive, XSLT, PDF, timeline), from the registry in scripts/lib/views.js,
// with the same markup the shared /css/views-bar.css styles. The displays this
// app serves are routes of it: a <Link> switches between them without reloading
// the app. The others are other documents, plain <a>. A PDF display's file is
// fetched as soon as the pointer or a finger reaches its link.
import { Link } from 'react-router';
import { useReading } from '../context';
import { APP_BASE, pdfPath, timelinePdfPath } from '../paths';
import type { PdfRenderer } from '../pdf/pdf-renderer';

const insideApp = (href: string) => href.startsWith(`${APP_BASE}/`);

interface Props {
  // The display this bar is drawn into — this app serves three.
  readonly current: 'interactive' | 'pdf' | 'timeline';
  readonly pdf: PdfRenderer;
}

export function ViewsBar({ current, pdf }: Props) {
  const { lang, catalogue } = useReading();
  const files: Readonly<Record<string, string>> = {
    pdf: pdfPath(lang),
    timeline: timelinePdfPath(lang),
  };
  const ahead = (id: string) => {
    const file = files[id];
    if (!file) return;
    pdf.prefetch(file).catch((error: unknown) => {
      console.warn(`Fetching ${file} ahead failed; the reader will fetch it when opened:`, error);
    });
  };
  return (
    <nav className="views-bar" aria-label={catalogue.viewsTitle}>
      <span className="views-bar-title">{catalogue.viewsTitle}</span>
      <ul>
        {catalogue.views.map((view) => {
          const props = {
            className: 'views-bar-link',
            'aria-current': view.id === current ? ('page' as const) : undefined,
            title: view.note,
            onPointerEnter: () => ahead(view.id),
            onTouchStart: () => ahead(view.id),
            onFocus: () => ahead(view.id),
          };
          return (
            <li key={view.id}>
              {insideApp(view.href) ? (
                <Link to={view.href.slice(APP_BASE.length)} {...props}>
                  {view.label}
                </Link>
              ) : (
                <a href={view.href} {...props}>
                  {view.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

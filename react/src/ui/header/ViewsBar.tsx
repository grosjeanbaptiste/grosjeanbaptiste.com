// The views bar: the same buttons every display of the CV shows (classic,
// interactive, XSLT, PDF), from the registry in scripts/lib/views.js, with the
// same markup the shared /css/views-bar.css styles. Plain <a>: every other
// display is another document, not a route of this app.
import { useReading } from '../context';

// `current`: the display this bar is drawn into — this app serves two.
export function ViewsBar({ current }: { current: 'interactive' | 'pdf' }) {
  const { catalogue } = useReading();
  return (
    <nav className="views-bar" aria-label={catalogue.viewsTitle}>
      <span className="views-bar-title">{catalogue.viewsTitle}</span>
      <ul>
        {catalogue.views.map((view) => (
          <li key={view.id}>
            <a
              className="views-bar-link"
              href={view.href}
              aria-current={view.id === current ? 'page' : undefined}
              title={view.note}
            >
              {view.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

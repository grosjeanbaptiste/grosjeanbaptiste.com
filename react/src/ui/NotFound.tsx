import { Link } from 'react-router';
import type { Strings } from './strings';

export function NotFound({ strings }: { strings: Strings }) {
  return (
    <section className="not-found">
      <p>{strings.notFound}</p>
      <Link to="/">{strings.back}</Link>
    </section>
  );
}

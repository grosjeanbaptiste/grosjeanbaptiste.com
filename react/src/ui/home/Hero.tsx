import { useReading } from '../context';
import { pdfPath } from '../paths';

export function Hero() {
  const { lang, catalogue } = useReading();
  const { name, label, summary, image, email, location, profiles } = catalogue.basics;
  const paragraphs = (summary ?? '').split(/\n{2,}/).filter(Boolean);

  return (
    <section className="hero" aria-labelledby="hero-name">
      {image && <img className="hero-photo" src={`/${image}`} alt="" width={160} height={160} />}
      <div className="hero-text">
        <h1 id="hero-name">{name}</h1>
        <p className="hero-label">{label}</p>
        {location?.city && (
          <p className="hero-location">
            {[location.city, location.region].filter(Boolean).join(', ')}
          </p>
        )}
        {paragraphs.map((p) => (
          <p key={p} className="hero-summary">
            {p}
          </p>
        ))}
        <ul className="hero-links">
          <li>
            <a className="button button-primary" href={pdfPath(lang)} download>
              {catalogue.text('downloadCV')}
            </a>
          </li>
          {email && (
            <li>
              <a className="button" href={`mailto:${email}`}>
                {email}
              </a>
            </li>
          )}
          {(profiles ?? []).map((p) => (
            <li key={p.url}>
              <a className="button" href={p.url} target="_blank" rel="noopener noreferrer">
                {p.network}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Who the CV is about, kept to one compact band so the timeline leads the page.
import { useReading } from '../context';
import { pdfPath } from '../paths';

// The sized WebP copies next to the photo (assets/images/profil-160.webp …):
// it is shown at 5rem at most, the original is 837px.
const WIDTHS = [160, 320, 500];
const photoSrcSet = (image: string) =>
  WIDTHS.map((w) => `/${image.replace(/\.[a-z]+$/i, '')}-${w}.webp ${w}w`).join(', ');

export function Hero() {
  const { lang, catalogue } = useReading();
  const { name, label, image, email, location, profiles } = catalogue.basics;

  return (
    <section className="hero" aria-labelledby="hero-name">
      {image && (
        <img
          className="hero-photo"
          src={`/${image}`}
          srcSet={photoSrcSet(image)}
          sizes="5rem"
          alt=""
          width={96}
          height={96}
        />
      )}
      <div className="hero-text">
        <h1 id="hero-name">{name}</h1>
        <p className="hero-label">{label}</p>
        {location?.city && (
          <p className="hero-location">
            {[location.city, location.region].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
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
    </section>
  );
}

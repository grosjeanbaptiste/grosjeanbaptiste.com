// The summary of the CV, in its own section under the timeline.
import { useReading } from '../context';

export function About() {
  const { catalogue } = useReading();
  const paragraphs = (catalogue.basics.summary ?? '').split(/\n{2,}/).filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title">{catalogue.text('about')}</h2>
      {paragraphs.map((p) => (
        <p key={p} className="about-summary">
          {p}
        </p>
      ))}
    </section>
  );
}

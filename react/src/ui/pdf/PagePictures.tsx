// Pictures of the PDF's pages (scripts/generate-pdf-previews.js), shown over
// the reader at once while PDF.js loads and draws the real pages — text
// selectable, links live — which replace them when the first is drawn. Only the
// first is fetched eagerly; it is what the screen shows.
import type { PagePicture } from '../../domain/resume';

export function PagePictures({ pictures }: { pictures: readonly PagePicture[] }) {
  return (
    <div className="pdf-pictures" aria-hidden="true">
      {pictures.map((picture, index) => (
        <img
          key={picture.src}
          src={picture.src}
          width={picture.width}
          height={picture.height}
          alt=""
          decoding="async"
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      ))}
    </div>
  );
}

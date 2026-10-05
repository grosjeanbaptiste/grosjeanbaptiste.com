// Pure part of the data export: gives every entry a stable id taken from the
// canonical (English) data, so /app/fr/projects/x and /app/en/projects/x are
// the same page in two languages.

import { slugOf } from '../src/domain/slug.ts';

const NAMERS = {
  work: (e) => `${e.company} ${e.position}`,
  education: (e) => `${e.institution} ${e.studyType ?? ''}`,
  projects: (e) => e.name,
  volunteer: (e) => `${e.organization} ${e.position}`,
  competitions: (e) => e.title,
};

function uniqueIds(names) {
  const seen = new Map();
  return names.map((name) => {
    const base = slugOf(name);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

function identifySection(section, canonical, localized) {
  const source = canonical[section] ?? [];
  const target = localized[section] ?? [];
  if (source.length !== target.length) {
    throw new Error(
      `${section}: canonical has ${source.length} entries, localized has ${target.length}`,
    );
  }
  const ids = uniqueIds(source.map(NAMERS[section]));
  return target.map((entry, i) => {
    const out = { ...entry, id: ids[i] };
    if (section === 'projects') out.courseUnit = source[i].type === 'Course unit';
    return out;
  });
}

export function identify(canonical, localized) {
  const out = { ...localized };
  for (const section of Object.keys(NAMERS)) {
    out[section] = identifySection(section, canonical, localized);
  }
  return out;
}

// The page pictures of one language's PDFs (assets/cv/previews/manifest.json,
// written by scripts/generate-pdf-previews.js), keyed by the path the site
// serves each PDF at, so the reader shows them before PDF.js has drawn.
export function picturesFor(manifest, lang) {
  return Object.fromEntries(
    Object.entries(manifest.files)
      .filter(([name]) => name.endsWith(`_${lang}.pdf`))
      .map(([name, { pages }]) => [
        `/assets/cv/${name}`,
        pages.map(({ src, width, height }) => ({ src: `/${src}`, width, height })),
      ]),
  );
}

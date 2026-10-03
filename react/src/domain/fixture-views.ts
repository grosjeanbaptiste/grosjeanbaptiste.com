// Test data: the views registry as scripts/lib/views.js exports it, en and fr.
import type { ViewLink } from './resume';

const LABELS: Record<string, [string, string[]]> = {
  en: [
    'Views',
    ['Classic', 'Interactive', 'XSLT (rich)', 'XSLT (minimal)', 'PDF', 'Timeline (PDF)'],
  ],
  fr: [
    'Affichages',
    ['Classique', 'Interactif', 'XSLT riche', 'XSLT minimal', 'PDF', 'Chronologie (PDF)'],
  ],
};

export function aViews(lang: string): { viewsTitle: string; views: ViewLink[] } {
  const [viewsTitle, labels] = LABELS[lang] ?? LABELS.en ?? ['', []];
  const hrefs = [
    lang === 'en' ? '/' : `/${lang}/`,
    `/app/${lang}/`,
    `/assets/data/resume-${lang}.xml`,
    `/assets/data/resume-${lang}-minimal.xml`,
    `/app/${lang}/pdf/`,
    `/app/${lang}/pdf/timeline/`,
  ];
  const ids = ['classic', 'interactive', 'xsltRich', 'xsltMinimal', 'pdf', 'timeline'];
  return {
    viewsTitle,
    views: ids.map((id, i) => ({ id, href: hrefs[i] ?? '', label: labels[i] ?? '' })),
  };
}

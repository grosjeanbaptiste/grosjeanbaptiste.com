// The PDF reader's own strings, apart from the app's (../strings.ts): a data
// table, one row per language, same keys everywhere.
import type { Lang } from '../../application/lang';

export interface PdfStrings {
  readonly pages: (count: number) => string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fitWidth: string;
  readonly openFile: string;
  readonly pdfLoading: string;
  readonly pdfFailed: string;
  readonly timelineTitle: string;
}

export const PDF_STRINGS: Readonly<Record<Lang, PdfStrings>> = {
  en: {
    pages: (n) => `${n} ${n === 1 ? 'page' : 'pages'}`,
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fitWidth: 'Fit width',
    openFile: 'Open the file',
    pdfLoading: 'Loading the PDF…',
    pdfFailed: 'The PDF could not be displayed.',
    timelineTitle: 'Timeline (PDF)',
  },
  fr: {
    pages: (n) => `${n} page${n === 1 ? '' : 's'}`,
    zoomIn: 'Agrandir',
    zoomOut: 'Réduire',
    fitWidth: 'Ajuster à la largeur',
    openFile: 'Ouvrir le fichier',
    pdfLoading: 'Chargement du PDF…',
    pdfFailed: 'Le PDF n’a pas pu être affiché.',
    timelineTitle: 'Chronologie (PDF)',
  },
  nl: {
    pages: (n) => `${n} pagina${n === 1 ? '' : '’s'}`,
    zoomIn: 'Inzoomen',
    zoomOut: 'Uitzoomen',
    fitWidth: 'Aanpassen aan breedte',
    openFile: 'Bestand openen',
    pdfLoading: 'PDF wordt geladen…',
    pdfFailed: 'De PDF kon niet worden weergegeven.',
    timelineTitle: 'Tijdlijn (PDF)',
  },
  es: {
    pages: (n) => `${n} página${n === 1 ? '' : 's'}`,
    zoomIn: 'Ampliar',
    zoomOut: 'Reducir',
    fitWidth: 'Ajustar al ancho',
    openFile: 'Abrir el archivo',
    pdfLoading: 'Cargando el PDF…',
    pdfFailed: 'No se pudo mostrar el PDF.',
    timelineTitle: 'Cronología (PDF)',
  },
  de: {
    pages: (n) => `${n} ${n === 1 ? 'Seite' : 'Seiten'}`,
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    fitWidth: 'An Breite anpassen',
    openFile: 'Datei öffnen',
    pdfLoading: 'PDF wird geladen…',
    pdfFailed: 'Das PDF konnte nicht angezeigt werden.',
    timelineTitle: 'Zeitleiste (PDF)',
  },
  zh: {
    pages: (n) => `${n} 页`,
    zoomIn: '放大',
    zoomOut: '缩小',
    fitWidth: '适合宽度',
    openFile: '打开文件',
    pdfLoading: '正在加载 PDF…',
    pdfFailed: '无法显示 PDF。',
    timelineTitle: '时间线 (PDF)',
  },
};

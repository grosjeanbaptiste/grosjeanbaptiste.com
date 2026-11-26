// The words of the PDF reader's toolbar in the XSLT themes (meta/pdfReader),
// the interactive view's own (react/src/ui/pdf/pdf-strings.ts): keep the two in
// step. XSLT cannot choose among them, and the reader's script reads them off
// the page.
const I18N = require('./i18n');

// Singular and plural noun of the page count ("2 pages"), as pages() in the
// interactive view's strings.
const PAGES = {
  en: ['page', 'pages'],
  fr: ['page', 'pages'],
  nl: ['pagina', 'pagina’s'],
  es: ['página', 'páginas'],
  de: ['Seite', 'Seiten'],
  zh: ['页', '页'],
};

// The two sides of the sheet, as the reader names them.
const SIDES = {
  en: ['Front', 'Back'],
  fr: ['Recto', 'Verso'],
  nl: ['Voorzijde', 'Achterzijde'],
  es: ['Anverso', 'Reverso'],
  de: ['Vorderseite', 'Rückseite'],
  zh: ['正面', '背面'],
};

const WORDS = {
  en: ['Zoom in', 'Zoom out', 'Fit height', 'Open the file', 'The PDF could not be displayed.'],
  fr: [
    'Agrandir',
    'Réduire',
    'Ajuster à la hauteur',
    'Ouvrir le fichier',
    'Le PDF n’a pas pu être affiché.',
  ],
  nl: [
    'Inzoomen',
    'Uitzoomen',
    'Aanpassen aan hoogte',
    'Bestand openen',
    'De PDF kon niet worden weergegeven.',
  ],
  es: [
    'Ampliar',
    'Reducir',
    'Ajustar a la altura',
    'Abrir el archivo',
    'No se pudo mostrar el PDF.',
  ],
  de: [
    'Vergrößern',
    'Verkleinern',
    'An Höhe anpassen',
    'Datei öffnen',
    'Das PDF konnte nicht angezeigt werden.',
  ],
  zh: ['放大', '缩小', '适合高度', '打开文件', '无法显示 PDF。'],
};

function pdfReaderForXml(lang) {
  const [zoomIn, zoomOut, fitWidth, openFile, failed] = WORDS[lang];
  const [pageOne, pageMany] = PAGES[lang];
  const [recto, verso] = SIDES[lang];
  const { downloadCV, downloadTimeline } = I18N[lang];
  return {
    zoomIn,
    zoomOut,
    fitWidth,
    openFile,
    failed,
    recto,
    verso,
    pageOne,
    pageMany,
    downloadCV,
    downloadTimeline,
  };
}

module.exports = { pdfReaderForXml };

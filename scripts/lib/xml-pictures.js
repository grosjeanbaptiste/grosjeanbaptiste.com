// The page pictures of one language's PDFs (assets/cv/previews, listed in its
// manifest.json by scripts/generate-pdf-previews.js), as the XML mirrors carry
// them (meta/pictures), for the rich XSLT theme's PDF reader to show where the
// browser cannot display a PDF: the pictures the app's reader shows before
// PDF.js has drawn.
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./config');

function picturesForXml(lang) {
  const file = path.join(ROOT, 'assets/cv/previews/manifest.json');
  if (!fs.existsSync(file)) return [];
  const { files } = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Object.entries(files)
    .filter(([name]) => name.endsWith(`_${lang}.pdf`))
    .map(([name, { pages }]) => ({
      file: `/assets/cv/${name}`,
      pages: pages.map(({ src, width, height }) => ({ src: `/${src}`, width, height })),
    }));
}

module.exports = { picturesForXml };

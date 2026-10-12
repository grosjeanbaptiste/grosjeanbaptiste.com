// Which way each sheet of a PDF is turned, as a reader sees it.
//
// A landscape sheet reaches a PDF in two ways and both must count: a browser
// writes the page wider than tall, while LaTeX's pdflscape keeps the A4 box
// upright and sets /Rotate 90 on it. `pdfinfo -l` reports the two separately.

const { execFileSync } = require('node:child_process');

/** @returns {('portrait'|'landscape')[]} one entry per page, in order */
function orientations(pdf) {
  const info = execFileSync('pdfinfo', ['-l', '99', pdf], { encoding: 'utf8', stdio: 'pipe' });
  const sizes = [...info.matchAll(/^Page\s+(\d+) size:\s+([\d.]+) x ([\d.]+) pts/gm)];
  if (!sizes.length) throw new Error(`pdfinfo reports no page size for ${pdf}`);
  return sizes.map(([, page, width, height]) => {
    const rot = new RegExp(`^Page\\s+${page} rot:\\s+(\\d+)`, 'm').exec(info);
    const turned = rot ? Number(rot[1]) % 180 === 90 : false;
    const wide = Number(width) > Number(height);
    return wide !== turned ? 'landscape' : 'portrait';
  });
}

// The sheet every printable version of the CV is: the recto upright, the verso
// — the timeline and the references — turned, because the timeline needs the
// width.
const SHEET = ['portrait', 'landscape'];

module.exports = { orientations, SHEET };

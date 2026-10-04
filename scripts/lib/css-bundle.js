// css/style.css is the list of the classic page's stylesheets, in order. As
// @imports it made the browser fetch one file to discover nineteen. Written out
// here as two: the screen sheets, and the print sheets (loaded with
// media="print", which does not block the first paint). The modules stay the
// source, each under 200 lines; the bundles are generated and committed.
const fs = require('node:fs');
const path = require('node:path');

const IMPORT = /@import "([^"]+)";/g;
const isPrint = (file) => file.startsWith('print');

function bundlesOf(dir) {
  const manifest = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  const sheets = [...manifest.matchAll(IMPORT)].map(([, file]) => {
    const source = path.join(dir, file);
    if (!fs.existsSync(source))
      throw new Error(`css/style.css imports ${file}, which does not exist`);
    return { file, css: fs.readFileSync(source, 'utf8').trimEnd() };
  });
  const join = (keep) =>
    `${sheets
      .filter(({ file }) => keep(file))
      .map(({ file, css }) => `/* ${file} */\n${css}`)
      .join('\n\n')}\n`;
  return { screen: join((file) => !isPrint(file)), print: join(isPrint) };
}

module.exports = { bundlesOf };

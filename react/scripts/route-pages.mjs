// Post-build: writes ../app/{lang}/…/index.html for every route of every
// language, from the built ../app/index.html and the exported data.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routePages } from './route-pages-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, '..', '..', 'app');
const DATA = join(APP, 'data');

const langs = JSON.parse(readFileSync(join(DATA, 'languages.json'), 'utf8'));
const documents = langs.map((lang) => JSON.parse(readFileSync(join(DATA, `${lang}.json`), 'utf8')));
const pages = routePages(readFileSync(join(APP, 'index.html'), 'utf8'), documents);

for (const { path, html } of pages) {
  const file = join(APP, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
console.log(`wrote ${pages.length} route pages under ${APP}`);

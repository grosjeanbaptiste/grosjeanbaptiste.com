#!/usr/bin/env node
/**
 * Re-reads the official sheets of the CV's course units and says whether each
 * wording recorded in dsl/course-unit-sources.json is still on its sheet.
 * Needs the network and poppler (pdftotext); not part of `npm test`, which
 * stays offline. Exits 1 on drift or on a sheet that cannot be read.
 *
 * Run from the repo root: node scripts/check-course-unit-sources.js
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { driftOf } = require('./lib/course-unit-drift');

const ROOT = path.resolve(__dirname, '..');
const { retrieved, units } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'dsl/course-unit-sources.json'), 'utf8'),
);

async function download(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
// UMONS serves UTF-8 or Latin-1 depending on the page.
const decode = (bytes) => {
  const utf8 = bytes.toString('utf8');
  return utf8.includes('�') ? bytes.toString('latin1') : utf8;
};

// One PDF for the whole bachelor: a unit runs from its page to the next unit's.
const pdfs = new Map();
async function pdfPages(url, name) {
  const [file, anchor] = url.split('#page=');
  if (!pdfs.has(file)) {
    const local = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-dossier-')), 'dossier.pdf');
    fs.writeFileSync(local, await download(file));
    pdfs.set(file, local);
  }
  const first = Number(anchor);
  const starts = Object.values(units)
    .filter((u) => u.url?.startsWith(file))
    .map((u) => Number(u.url.split('#page=')[1]))
    .filter((page) => page > first);
  // The last recorded unit is followed by units the CV does not model.
  const last = starts.length ? Math.min(...starts) - 1 : first + 5;
  if (!Number.isInteger(first)) throw new Error(`${name} names no page in ${url}`);
  return execFileSync('pdftotext', ['-f', `${first}`, '-l', `${last}`, pdfs.get(file), '-'], {
    encoding: 'utf8',
  });
}

// `sheet`: a unit's own record, or its `later` one.
async function read(name, sheet) {
  if (sheet.url.includes('.pdf#page=')) return pdfPages(sheet.url, name);
  const pages = await Promise.all([sheet.url, ...(sheet.activities || [])].map(download));
  return pages.map((bytes) => textOf(decode(bytes))).join(' ');
}

driftOf(units, read).then(
  (drift) => {
    const sourced = Object.values(units).filter((u) => u.url).length;
    for (const { unit, keyword, wording } of drift) {
      console.error(`drift: ${unit} — "${wording}" (${keyword}) is no longer on its sheet`);
    }
    console.log(
      `check-course-unit-sources: ${sourced} sheets read, ${drift.length} wording(s) gone (record of ${retrieved})`,
    );
    for (const local of pdfs.values()) fs.rmSync(path.dirname(local), { recursive: true });
    process.exit(drift.length ? 1 : 0);
  },
  (error) => {
    console.error(`check-course-unit-sources: ${error.message}`);
    process.exit(1);
  },
);

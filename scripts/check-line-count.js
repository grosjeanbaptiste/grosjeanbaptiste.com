#!/usr/bin/env node
// Fails when any tracked source file exceeds MAX_LINES.
// Code files (.js, .mjs, .ts, .tsx, .css) only — data (.json), markup (.html, .xml), and
// vendored trees are skipped.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MAX_LINES = 200;
const CODE_EXTS = new Set(['.js', '.mjs', '.ts', '.tsx', '.css']);
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.venv',
  'site-packages',
  '_vendor',
  'dist',
  'build',
  'app', // the React view's build output, minified
  '.prerender', // the React view built for Node, to draw its pages at build time
]);

// Generated from the modules css/style.css lists (scripts/lib/css-bundle.js):
// the modules are the code and stay under the limit, these are their output.
const GENERATED = new Set(['css/bundle.css', 'css/bundle-print.css']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (GENERATED.has(path.relative(ROOT, full))) {
      // not source: see GENERATED
    } else if (entry.isFile() && CODE_EXTS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
}

function main() {
  const files = [];
  walk(ROOT, files);

  const violations = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n').length;
    if (lines > MAX_LINES) {
      violations.push({ file: path.relative(ROOT, file), lines });
    }
  }

  if (violations.length > 0) {
    console.error(`\n✗ ${violations.length} file(s) exceed ${MAX_LINES} lines:\n`);
    for (const v of violations.sort((a, b) => b.lines - a.lines)) {
      console.error(`  ${v.lines.toString().padStart(5)}  ${v.file}`);
    }
    console.error(
      `\nLimit: ${MAX_LINES} lines (${[...CODE_EXTS].join(', ')}). Split into modules.\n`,
    );
    process.exit(1);
  }

  console.log(`✓ All ${files.length} code file(s) within ${MAX_LINES} lines.`);
}

if (require.main === module) main();

module.exports = { CODE_EXTS, MAX_LINES };

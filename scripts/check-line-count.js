#!/usr/bin/env node
// Fails when any tracked source file exceeds MAX_LINES.
// Code files (.js, .css) only — data (.json), markup (.html, .xml), and
// vendored trees are skipped.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MAX_LINES = 200;
const CODE_EXTS = new Set(['.js', '.css']);
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.venv',
  'site-packages',
  '_vendor',
  'dist',
  'build',
]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && CODE_EXTS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
}

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
  console.error(`\nLimit: ${MAX_LINES} lines (.js, .css). Split into modules.\n`);
  process.exit(1);
}

console.log(`✓ All ${files.length} code file(s) within ${MAX_LINES} lines.`);

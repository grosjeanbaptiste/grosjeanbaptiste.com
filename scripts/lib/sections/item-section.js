// The two helpers every section of the main column shares: the pools an item
// needs to embed its related entries, and the <section> that wraps the items.
const { escapeHtml } = require('../format');
const { indentLines } = require('../markers');

// The projects/courses/volunteer/references pools an item renderer needs to embed
// related entries. Bundled once per section so the item renderers stay short.
function ctxOf(resume) {
  return {
    projects: resume.projects || [],
    courses: resume.courses || [],
    volunteer: resume.volunteer || [],
    references: resume.references || [],
  };
}

// Wrap a list of entries in a <section id>; each item is rendered then indented
// two spaces to match the hand-written HTML nesting. Returns null (skipped
// downstream) when the section is empty.
function renderItemSection(id, heading, entries, renderItem, printHeadingText = null) {
  if (!entries?.length) return null;
  const items = entries.map((e, i) => indentLines(renderItem(e, i), 2)).join('\n');
  // The PDF gives a few sections a shorter title than the site does
  // ("Experience" against "Work Experience"); data-print-text lets the sheet
  // use the PDF's while the page keeps its own.
  const attr = printHeadingText ? ` data-print-text="${escapeHtml(printHeadingText)}"` : '';
  return [
    `<section id="${id}">`,
    `  <h2${attr}>${escapeHtml(heading)}</h2>`,
    items,
    '</section>',
  ].join('\n');
}

module.exports = { ctxOf, renderItemSection };

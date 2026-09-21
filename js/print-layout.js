// Rearranges the page into the LaTeX CV's structure just before printing, and
// puts it back afterwards.
//
// Two differences cannot be expressed in the print stylesheet, because CSS
// cannot move a node between containers:
//
//   - it renders Education in the narrow left column, and as a two-line degrees
//     summary rather than a list of entries (the fit plan drops the entries);
//     the page renders a full Education section in the main column and files the
//     degree lines under the contact details.
//
// So we move those nodes for the duration of the print and restore them after.
// With JavaScript disabled nothing moves and the sheet still prints correctly —
// it just keeps the page's own arrangement.
(() => {
  /** @type {{node: Element, parent: Node, next: Node|null}[]} */
  let undo = [];
  /** @type {{el: Element, text: string}[]} */
  let clipped = [];
  let prepared = false;

  function move(node, parent, { before } = {}) {
    if (!node || !parent) return;
    undo.push({ node, parent: node.parentNode, next: node.nextSibling });
    if (before) parent.insertBefore(node, before);
    else parent.appendChild(node);
  }

  function prepare() {
    if (prepared) return; // print dialogs can fire the event twice
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    prepared = true;

    // In the LaTeX CV the degrees summary is the first sidebar SECTION — under
    // the header, not above it. The banner used to carry the photo and the name
    // out of the sidebar, so putting Education at the very top was right then;
    // without it they stayed, and the sheet opened on EDUCATION above the name.
    // Slot it in after the identity block instead.
    const contact = document.querySelector('.contact-info');
    const education = document.getElementById('education');
    move(education, sidebar, { before: contact ? contact.nextSibling : sidebar.firstChild });
    if (education) {
      for (const degree of document.querySelectorAll('.contact-info .degree')) {
        move(degree, education);
      }
    }

    // The generator carries the PDF's clipped wording in data-print-text,
    // computed with the LaTeX build's own truncate. Swap it in for the print so
    // the sheet says what the PDF says, and keep the full text on screen.
    for (const el of document.querySelectorAll('[data-print-text]')) {
      clipped.push({ el, text: el.textContent });
      el.textContent = el.dataset.printText;
    }
  }

  function restore() {
    for (const { el, text } of clipped) {
      el.textContent = text;
    }
    clipped = [];
    for (const { node, parent, next } of undo.reverse()) {
      parent.insertBefore(node, next);
    }
    undo = [];
    prepared = false;
  }

  window.addEventListener('beforeprint', prepare);
  window.addEventListener('afterprint', restore);

  // Safari historically fires neither event; it only flips the print media
  // query. Listening to both is harmless — prepare() and restore() are
  // idempotent.
  const printMedia = window.matchMedia('print');
  if (printMedia.addEventListener) {
    printMedia.addEventListener('change', (e) => (e.matches ? prepare() : restore()));
  }
})();

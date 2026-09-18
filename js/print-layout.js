// Rearranges the page into the LaTeX CV's structure just before printing, and
// puts it back afterwards.
//
// Two differences cannot be expressed in the print stylesheet, because CSS
// cannot move a node between containers:
//
//   - the LaTeX CV opens with a full-width banner (photo, name, tagline,
//     contact details) above both columns, while the page nests all of that
//     inside the sidebar;
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
  let header = null;

  function move(node, parent, { first = false } = {}) {
    if (!node || !parent) return;
    undo.push({ node, parent: node.parentNode, next: node.nextSibling });
    if (first) parent.insertBefore(node, parent.firstChild);
    else parent.appendChild(node);
  }

  function prepare() {
    if (header) return; // already prepared; print dialogs can fire twice
    const container = document.querySelector('.container');
    const sidebar = document.querySelector('.sidebar');
    if (!container || !sidebar) return;

    header = document.createElement('div');
    header.className = 'print-header';
    container.parentNode.insertBefore(header, container);

    move(document.getElementById('profile-picture'), header);
    move(document.querySelector('.contact-info'), header);

    // The LaTeX sidebar carries a degrees summary under the Education heading.
    // Reuse that section — already localized — as its home: its own entries are
    // hidden in print, matching education_in_body: false.
    // \cvsectionsidebar for the degrees is the FIRST block of the LaTeX sidebar,
    // ahead of languages, skills and the day chart.
    const education = document.getElementById('education');
    move(education, sidebar, { first: true });
    if (education) {
      for (const degree of document.querySelectorAll('.contact-info .degree')) {
        move(degree, education);
      }
    }
  }

  function restore() {
    for (const { node, parent, next } of undo.reverse()) {
      parent.insertBefore(node, next);
    }
    undo = [];
    if (header) {
      header.remove();
      header = null;
    }
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

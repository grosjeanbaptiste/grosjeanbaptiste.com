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
  /** @type {{el: Element, html: string}[]} */
  let clipped = [];
  /** @type {Element|null} */
  let versoVolunteer = null;
  let prepared = false;

  function move(node, parent, { before } = {}) {
    if (!node || !parent) return;
    undo.push({ node, parent: node.parentNode, next: node.nextSibling });
    if (before) parent.insertBefore(node, before);
    else parent.appendChild(node);
  }

  // The LaTeX CV prints a Volunteer section on the verso. The page keeps the
  // same roles embedded under the education entry that hosts them, and
  // print-type.css hides those entries wholesale to mirror the fit plan's
  // education_in_body: false — so without this the printed sheet drops the
  // volunteering the PDF shows.
  //
  // The rows are gathered into one list, because the page splits them per host
  // (UMons, EPHEC) while the PDF prints a single section. It is nested INSIDE
  // #references on purpose: that section already carries break-before: page,
  // so the block rides its break instead of needing one of its own — a second
  // break here would start a third sheet.
  function gatherVolunteering() {
    const blocks = document.querySelectorAll('.embedded-volunteer');
    const sidebarEl = document.querySelector('.sidebar');
    if (!blocks.length || !sidebarEl) return;

    const section = document.createElement('section');
    section.id = 'print-volunteer';
    const heading = document.createElement('h2');
    // Take the label off the page rather than hardcoding a string: it is
    // already localized in all six languages.
    const label = blocks[0].querySelector('.embedded-label');
    heading.textContent = (label ? label.textContent : '').replace(/\s*:\s*$/, '');
    section.appendChild(heading);

    const list = document.createElement('ul');
    for (const block of blocks) {
      for (const row of block.querySelectorAll('li')) move(row, list);
    }
    section.appendChild(list);

    sidebarEl.appendChild(section);
    versoVolunteer = section;
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

    gatherVolunteering();

    // The generator carries the PDF's clipped wording in data-print-text,
    // computed with the LaTeX build's own truncate. Swap it in for the print so
    // the sheet says what the PDF says, and keep the full text on screen.
    //
    // Save innerHTML, not textContent: these summaries carry <br> for their
    // paragraph breaks, and textContent flattens the markup away — restoring
    // from it left the page with the line break permanently gone, on screen,
    // after any print. The clipped text itself is plain, so it still goes in
    // through textContent.
    for (const el of document.querySelectorAll('[data-print-text]')) {
      clipped.push({ el, html: el.innerHTML });
      el.textContent = el.dataset.printText;
    }
  }

  function restore() {
    for (const { el, html } of clipped) {
      el.innerHTML = html;
    }
    clipped = [];
    // Drop the built section first; the loop below puts its rows back where
    // they came from, and removing it afterwards would take them with it.
    versoVolunteer?.remove();
    versoVolunteer = null;
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

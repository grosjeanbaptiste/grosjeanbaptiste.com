// Rearranges the page into the LaTeX CV's structure just before printing, and
// puts it back afterwards.
//
// Three differences cannot be expressed in the print stylesheet, because CSS
// cannot move a node between containers:
//
//   - the PDF's \makecvheader puts photo, name, tagline and contact details in
//     a banner spanning BOTH columns; the page nests them at the top of the
//     narrow one;
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
  /** @type {Element|null} */
  let banner = null;
  /** @type {Element|null} */
  let verso = null;
  let prepared = false;

  function move(node, parent, { before } = {}) {
    if (!node || !parent) return;
    undo.push({ node, parent: node.parentNode, next: node.nextSibling });
    if (before) parent.insertBefore(node, before);
    else parent.appendChild(node);
  }

  // The banner was dropped once: Firefox will not fragment the two-column block
  // across sheets, so a full-width header above it pushed the whole block onto
  // its own page and the CV printed on three. It is affordable now because the
  // identity block is what leaves the narrow column — nine stacked contact rows
  // and a two-line name cost that 30% column far more height than the same
  // details cost spread across the full width. The two-page guarantee is not
  // assumed: print-fit*.test.js prints and counts, in both engines.
  function buildBanner() {
    const container = document.querySelector('.container');
    const contact = document.querySelector('.contact-info');
    if (!container?.parentNode || !contact) return;
    const header = document.createElement('header');
    header.id = 'print-banner';
    container.parentNode.insertBefore(header, container);
    banner = header;
    move(document.getElementById('profile-picture'), header);
    move(contact, header);
  }

  // The PDF header ends on its build date. The page carries only the localized
  // label, so the date is written here: Intl produces the same wording for all
  // six languages that scripts/lib/pdf/today.js does, and a build-time date in
  // the HTML would put all six pages in every regeneration commit.
  function stampUpdated() {
    const slot = document.querySelector('.print-updated time');
    if (!slot) return;
    // Recorded on the same undo list as the clipped summaries: writing the
    // date and never taking it back leaves the page altered after the print
    // dialog closes, which print-restore.test.js compares and rejects.
    clipped.push({ el: slot, html: slot.innerHTML });
    slot.textContent = new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
      dateStyle: 'long',
    }).format(new Date());
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
    if (!blocks.length) return;

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

    versoVolunteer = section;
  }

  // \clearpage\begin{paracol}{2} volunteer \switchcolumn references — the PDF's
  // verso is a SECOND two-column block, not a page break inside the first. The
  // page faked it with break-before on nodes sitting inside the recto's grid,
  // and Firefox, which will not fragment a grid, answered with a page for the
  // volunteering and another for the references: four sheets instead of two.
  function buildVerso() {
    const container = document.querySelector('.container');
    const references = document.getElementById('references');
    if (!container?.parentNode || (!versoVolunteer && !references)) return;
    const block = document.createElement('div');
    block.id = 'print-verso';
    container.parentNode.insertBefore(block, container.nextSibling);
    verso = block;
    // Volunteer first: it is the left column, as \switchcolumn puts it.
    if (versoVolunteer) block.appendChild(versoVolunteer);
    move(references, block);
  }

  function prepare() {
    if (prepared) return; // print dialogs can fire the event twice
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    prepared = true;

    // In the LaTeX CV the degrees summary is the sidebar's first section, the
    // banner having carried photo and name out of the column. Education
    // therefore goes in at the very top — the degrees must leave .contact-info
    // before buildBanner() takes that block away, or they travel with it.
    const education = document.getElementById('education');
    move(education, sidebar, { before: sidebar.firstChild });
    if (education) {
      for (const degree of document.querySelectorAll('.contact-info .degree')) {
        move(degree, education);
      }
    }

    buildBanner();
    stampUpdated();
    gatherVolunteering();
    buildVerso();

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
    banner?.remove();
    banner = null;
    verso?.remove();
    verso = null;
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

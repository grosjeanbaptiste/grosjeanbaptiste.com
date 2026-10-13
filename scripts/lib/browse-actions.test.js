// The rest of what the classic page took over from the interactive view, in a
// real browser: the search's actions (languages, theme, PDFs), the skills
// named on the entries as a way into the filter, and the timeline's PDF
// following the zoom. One Chrome run, one probe.
const test = require('node:test');
const assert = require('node:assert/strict');
const { probed } = require('./browser-probe');

const PROBE = `<script>
addEventListener('load', () => setTimeout(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];
  const dialog = $('#cv-search'), input = $('input', dialog), opener = $('.tl-search-open');
  const pressed = () => all('.tl-chip[aria-pressed="true"]').map((c) => c.dataset.skill);
  const skill = () => new URL(location.href).searchParams.get('skill');
  const type = (text) => { input.value = text; input.dispatchEvent(new Event('input')); };
  const key = (name) => input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
  const seen = {};
  // The actions: offered as the search opens, found by their name.
  opener.click();
  seen.actionsAtOpen = all('#cv-search [role="option"]').map((o) => o.dataset.type).every((type) => type === 'action') && all('#cv-search [role="option"]').length;
  type('nederl');
  const dutch = $('#cv-search [role="option"]');
  seen.languageFound = [dutch.dataset.type, dutch.dataset.href];
  type('theme');
  const before = document.documentElement.getAttribute('data-theme');
  key('Enter');
  seen.themeToggled = [dialog.open, document.documentElement.getAttribute('data-theme') !== before];
  // A skill named on an entry is a way into the filter.
  const tag = all('.main-content .skill-tag').find((t) => t.textContent.trim() === 'Rust');
  seen.tagIsButton = [tag.getAttribute('role'), tag.tabIndex];
  tag.click();
  seen.tagFilters = [pressed().join(), skill()];
  $('.tl-skill-clear').click();
  // The timeline's PDF follows the zoom.
  const pdf = $('[data-timeline-pdf]');
  const at = (years) => { $('.tl-zoom button[data-years="' + years + '"]').click(); return pdf.getAttribute('href'); };
  seen.pdfByZoom = [at('2'), at('5'), at('all')].map((href) => href.replace('/assets/cv/cv_grosjean_baptiste_timeline', ''));
  document.documentElement.setAttribute('data-actions', JSON.stringify(seen));
}, 900));
</script>`;

let seen;
test.before(async () => {
  seen = await probed(PROBE, '/fr/', 'data-actions');
});

const check = (name, fn) =>
  test(name, (t) => {
    if (!seen) return t.skip('no Chrome found — set CHROME_PATH to check the search here');
    fn();
  });

check('the search opens on its actions: languages, theme, PDFs', () =>
  assert.equal(seen.actionsAtOpen, 8),
);
check('a language is found by its name and leads to its page', () =>
  assert.deepEqual(seen.languageFound, ['action', '/nl/']),
);
check('the theme action closes the search and toggles the theme', () =>
  assert.deepEqual(seen.themeToggled, [false, true]),
);
check('a skill named on an entry can be reached by keyboard', () =>
  assert.deepEqual(seen.tagIsButton, ['button', 0]),
);
check('pressing a skill on an entry filters the timeline by it', () =>
  assert.deepEqual(seen.tagFilters, ['Rust', 'Rust']),
);
check('the timeline’s PDF is the one of the zoom on screen', () =>
  assert.deepEqual(seen.pdfByZoom, ['_2y_fr.pdf', '_5y_fr.pdf', '_fr.pdf']),
);

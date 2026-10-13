// The classic page's skill filter, made to work. The generator lists the
// skills under the timeline, each naming the entries that use it
// (scripts/lib/sections/skill-filter.js); this dims the bars of the others,
// says how many entries use the skill, and keeps the choice in the URL
// (?skill=Rust) so the view can be shared. The search chooses a skill through
// the `cv:skill` event. Without this script the list stays hidden.
(() => {
  const root = document.querySelector('.tl-skills');
  if (!root) return;
  const status = root.querySelector('.tl-skill-status');
  const said = status?.querySelector('output');
  const more = root.querySelector('.tl-chip-more');
  const chips = [...root.querySelectorAll('.tl-chip')];
  if (!status || !said || chips.length === 0) {
    console.warn(
      'skill-filter.js: the filter markup is not the one this script knows; left hidden.',
    );
    return;
  }
  const bars = [...document.querySelectorAll('#timeline .tl-bar')];
  const chipOf = (skill) => chips.find((chip) => chip.dataset.skill === skill);

  // The URL names the skill and nothing else changes: the place stays shareable.
  const remember = (skill) => {
    const url = new URL(location.href);
    if (skill) url.searchParams.set('skill', skill);
    else url.searchParams.delete('skill');
    history.replaceState(null, '', url);
  };

  // `skill`: the one to light the timeline by, or null for the whole CV.
  const choose = (skill) => {
    const chosen = skill ? chipOf(skill) : undefined;
    const users = new Set(chosen ? chosen.dataset.entries.split(' ') : []);
    for (const chip of chips) chip.setAttribute('aria-pressed', String(chip === chosen));
    for (const bar of bars) {
      if (chosen && !users.has(bar.dataset.entry)) bar.dataset.dimmed = 'true';
      else delete bar.dataset.dimmed;
    }
    said.textContent = chosen ? chosen.dataset.status : '';
    status.hidden = !chosen;
    remember(chosen ? chosen.dataset.skill : null);
  };

  root.addEventListener('click', (event) => {
    const chip = event.target.closest('.tl-chip');
    // Choosing the chosen skill again clears it.
    if (chip) choose(chip.getAttribute('aria-pressed') === 'true' ? null : chip.dataset.skill);
    if (event.target.closest('.tl-skill-clear')) choose(null);
  });
  more?.addEventListener('click', () => {
    const expanded = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(expanded));
    root.toggleAttribute('data-expanded', expanded);
    more.textContent = expanded ? more.dataset.fewer : more.dataset.more;
  });
  document.addEventListener('cv:skill', (event) => {
    choose(event.detail);
    root.scrollIntoView({ block: 'nearest' });
  });

  root.hidden = false;
  // A skill the URL names but the page does not list is left out, said once.
  const named = new URL(location.href).searchParams.get('skill');
  if (named && !chipOf(named)) console.warn(`skill-filter.js: no entry uses "${named}".`);
  else if (named) choose(named);
})();

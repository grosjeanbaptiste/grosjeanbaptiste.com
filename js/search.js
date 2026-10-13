// The classic page's search: a dialog opened by the button in the timeline's
// head or by ⌘K / Ctrl+K, over the entries the generator handed the page
// (scripts/lib/sections/search.js), ranked by js/search-rank.js. A skill
// applies the skill filter (js/skill-filter.js, through `cv:skill`); an entry
// is scrolled to and set apart, its bar marked (js/timeline.js, through
// `cv:reveal`). Without this script the button stays hidden.
(() => {
  const dialog = document.getElementById('cv-search');
  const opener = document.querySelector('.tl-search-open');
  const data = document.getElementById('cv-index');
  const input = dialog?.querySelector('input');
  const list = dialog?.querySelector('[role="listbox"]');
  const empty = dialog?.querySelector('.cv-search-empty');
  const rank = globalThis.cvSearch;
  if (!dialog || !opener || !data || !input || !list || !empty || !rank) {
    console.warn('search.js: the search markup is not the one this script knows; left closed.');
    return;
  }
  const { entries, skills, kinds, groups } = JSON.parse(data.textContent);
  const MAX_SKILLS = 6;
  const MAX_ENTRIES = 20;

  const make = (tag, className, text) =>
    Object.assign(document.createElement(tag), { className, textContent: text ?? '' });
  const optionOf = (hit, i) => {
    const option = make('li', 'cv-search-option');
    option.id = `cv-search-option-${i}`;
    option.setAttribute('role', 'option');
    option.dataset.type = hit.type;
    option.dataset.value = hit.type === 'skill' ? hit.skill : hit.entry.id;
    const [title, aside] =
      hit.type === 'skill'
        ? [hit.skill, `${groups.skills} · ${hit.uses}`]
        : [
            hit.entry.title,
            [hit.entry.organisation, kinds[hit.entry.kind]].filter(Boolean).join(' · '),
          ];
    option.append(make('strong', '', title), make('span', '', aside));
    return option;
  };

  const options = () => [...list.children];
  const activate = (option) => {
    for (const other of options()) other.setAttribute('aria-selected', String(other === option));
    if (option) input.setAttribute('aria-activedescendant', option.id);
    else input.removeAttribute('aria-activedescendant');
    option?.scrollIntoView({ block: 'nearest' });
  };
  const render = () => {
    const hits = rank.search(entries, skills, input.value);
    const kept = [
      ...hits.filter((h) => h.type === 'skill').slice(0, MAX_SKILLS),
      ...hits.filter((h) => h.type === 'entry').slice(0, MAX_ENTRIES),
    ];
    list.replaceChildren(...kept.map(optionOf));
    empty.hidden = kept.length > 0 || input.value.trim() === '';
    activate(options()[0]);
  };

  // An entry: scrolled to and set apart; its bar, when it has one, marked.
  const lead = (id) => {
    const entry = document.getElementById(id);
    if (!entry) return console.warn(`search.js: no #${id} on the page.`);
    document.querySelector('.tl-shown')?.classList.remove('tl-shown');
    (entry.closest('li') ?? entry).classList.add('tl-shown');
    entry.scrollIntoView({ block: 'center' });
    history.replaceState(null, '', `#${id}`);
    document.dispatchEvent(new CustomEvent('cv:reveal', { detail: id }));
  };
  const pick = (option) => {
    if (!option) return;
    dialog.close();
    if (option.dataset.type === 'skill')
      document.dispatchEvent(new CustomEvent('cv:skill', { detail: option.dataset.value }));
    else lead(option.dataset.value);
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    render();
    dialog.showModal();
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', (event) => {
    const all = options();
    const at = all.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (event.key === 'ArrowDown') activate(all[Math.min(at + 1, all.length - 1)]);
    else if (event.key === 'ArrowUp') activate(all[Math.max(at - 1, 0)]);
    else if (event.key === 'Enter') pick(all[at]);
    else return;
    event.preventDefault();
  });
  list.addEventListener('click', (event) => pick(event.target.closest('[role="option"]')));
  // A click on the backdrop — the dialog itself, outside its content — closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  opener.addEventListener('click', open);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });
  opener.hidden = false;
})();

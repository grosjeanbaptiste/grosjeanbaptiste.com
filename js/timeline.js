// The classic page's timeline, made interactive. The generator draws it and it
// works without this script (bars link to their entries); this adds the zoom
// (2 years / 5 years / all), the arrow keys from bar to bar, the preview on
// hover or focus, and marks the bar of the entry the page is showing.
(() => {
  const section = document.getElementById('timeline');
  if (!section) return;
  const scroller = section.querySelector('.tl-scroll');
  const grid = section.querySelector('.tl-grid');
  const zoom = section.querySelector('.tl-zoom');
  const bars = [...section.querySelectorAll('.tl-bar')];
  const months = Number(grid.dataset.months);
  if (!scroller || !zoom || !months) {
    console.warn('timeline.js: the timeline markup is not the one this script knows; left static.');
    return;
  }

  // Zoom: the scale only — the whole career stays drawn, scrolled to today.
  const setZoom = (years) => {
    grid.style.width =
      years === 'all' ? '100%' : `${Math.max(100, (months / (Number(years) * 12)) * 100)}%`;
    for (const b of zoom.querySelectorAll('button'))
      b.setAttribute('aria-pressed', String(b.dataset.years === years));
    const current = section.querySelector('.tl-bar[aria-current="true"]');
    if (current) current.scrollIntoView({ block: 'nearest', inline: 'center' });
    else scroller.scrollLeft = scroller.scrollWidth;
  };
  zoom.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-years]');
    if (button) setZoom(button.dataset.years);
  });
  zoom.hidden = false;

  // The entry a bar leads to: its bar marked, the entry set apart, the URL
  // naming it. Done here, not with :target — nav.js takes the click over to
  // scroll smoothly and leaves the URL alone.
  // An id may hold non-Latin letters (a role's title in Chinese). The browser
  // percent-encodes them in location.hash, an XSLT processor in href: ids are
  // compared and looked up decoded.
  const idOf = (fragment) => {
    const raw = fragment.replace(/^#/, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw; // not percent-encoding at all (a stray "%"): the id is as written
    }
  };
  const reveal = (bar) => {
    const entry = document.getElementById(idOf(bar.getAttribute('href')));
    if (!entry) return;
    for (const other of bars) other.setAttribute('aria-current', String(other === bar));
    document.querySelector('.tl-shown')?.classList.remove('tl-shown');
    (entry.closest('li') ?? entry).classList.add('tl-shown');
    history.replaceState(null, '', bar.getAttribute('href'));
  };
  grid.addEventListener('click', (event) => {
    const bar = event.target.closest('a.tl-bar');
    if (bar) reveal(bar);
  });
  const named = bars.find(
    (bar) =>
      location.hash !== '' &&
      bar.hasAttribute('href') &&
      idOf(bar.getAttribute('href')) === idOf(location.hash),
  );
  if (named) reveal(named);
  setZoom('5');

  // Arrow keys: along a lane in time order, across lanes to the closest in time.
  const centre = (bar) => bar.offsetLeft + bar.offsetWidth / 2;
  const laneOf = (bar) =>
    [...bar.closest('.tl-track').querySelectorAll('.tl-bar')].sort(
      (a, b) => a.offsetLeft - b.offsetLeft,
    );
  const lanes = [...section.querySelectorAll('.tl-track')];
  const neighbour = (bar, key) => {
    const lane = laneOf(bar);
    if (key === 'ArrowRight') return lane[lane.indexOf(bar) + 1];
    if (key === 'ArrowLeft') return lane[lane.indexOf(bar) - 1];
    const other = lanes[lanes.indexOf(bar.closest('.tl-track')) + (key === 'ArrowDown' ? 1 : -1)];
    if (!other) return undefined;
    const at = centre(bar);
    return [...other.querySelectorAll('.tl-bar')].sort(
      (a, b) => Math.abs(centre(a) - at) - Math.abs(centre(b) - at),
    )[0];
  };
  grid.addEventListener('keydown', (event) => {
    const bar = event.target.closest('.tl-bar');
    if (!bar || !event.key.startsWith('Arrow')) return;
    event.preventDefault();
    neighbour(bar, event.key)?.focus();
  });

  // Preview: what the bar stands for, under it.
  const preview = document.createElement('div');
  preview.className = 'tl-preview';
  preview.id = 'tl-preview';
  preview.setAttribute('role', 'tooltip');
  const show = (bar) => {
    const { name, title, period } = bar.dataset;
    preview.replaceChildren(
      ...[
        [name, 'strong'],
        [title, 'span'],
        [period, 'span'],
      ]
        .filter(([text]) => text)
        .map(([text, tag]) => Object.assign(document.createElement(tag), { textContent: text })),
    );
    grid.append(preview);
    const track = bar.closest('.tl-track');
    preview.style.top = `${track.offsetTop + bar.offsetTop + bar.offsetHeight + 4}px`;
    preview.style.left = `${Math.max(0, Math.min(track.offsetLeft + bar.offsetLeft, grid.offsetWidth - preview.offsetWidth))}px`;
    bar.setAttribute('aria-describedby', preview.id);
  };
  const hide = (bar) => {
    preview.remove();
    bar.removeAttribute('aria-describedby');
  };
  for (const bar of bars) {
    bar.addEventListener('mouseenter', () => show(bar));
    bar.addEventListener('focus', () => show(bar));
    bar.addEventListener('mouseleave', () => hide(bar));
    bar.addEventListener('blur', () => hide(bar));
  }
})();

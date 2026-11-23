// What the rich XSLT theme's links cannot do by themselves. Both are extras:
// without this script the filter (#skill-rust, CSS :target) and the menu work.
//  - ?skill=Rust, the classic page's shareable form, sets the filter's target;
//    choosing a skill writes it back, so the address bar can be shared.
//  - the menu's link to the section on screen is marked, as nav.js does.
(() => {
  const chips = [...document.querySelectorAll('.tl-chip')];
  const nameOf = (chip) => chip.firstChild.textContent.trim();
  const chipFor = (hash) => chips.find((chip) => chip.getAttribute('href') === hash);

  const wanted = new URLSearchParams(location.search).get('skill');
  const asked = wanted && chips.find((chip) => nameOf(chip) === wanted);
  if (asked && !location.hash) location.hash = asked.getAttribute('href');

  const remember = () => {
    const chip = chipFor(location.hash);
    const url = new URL(location.href);
    // Other hashes (an entry's panel) leave the skill as it was.
    if (chip) url.searchParams.set('skill', nameOf(chip));
    else if (location.hash === '#timeline') url.searchParams.delete('skill');
    else return;
    history.replaceState(null, '', url);
  };
  addEventListener('hashchange', remember);

  const links = [...document.querySelectorAll('.toolbar a.nav-link')];
  const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  const mark = () => {
    // The toolbar scrolls away with the page: its foot counts only while on screen.
    const bar = document.querySelector('.toolbar nav')?.getBoundingClientRect().bottom ?? 0;
    const line = Math.max(bar, 0) + 30;
    const here = sections.find((s) => {
      const box = s?.getBoundingClientRect();
      return box && box.top <= line && box.bottom > line;
    });
    links.forEach((a, i) => a.classList.toggle('active', sections[i] === here && !!here));
  };
  addEventListener('scroll', mark, { passive: true });
  addEventListener('resize', mark);
  mark();

  // The photo and the latest degree, in a bar under the menu, once the identity
  // block has scrolled out of the top of the screen.
  const identity = document.querySelector('.sidebar h1');
  if (identity && document.querySelector('.mini-id')) {
    const root = document.documentElement;
    const menu = document.querySelector('.toolbar');
    const size = () => {
      const bar = menu.getBoundingClientRect().height || menu.querySelector('nav')?.offsetHeight || 0;
      root.style.setProperty('--toolbar-h', `${bar}px`);
    };
    size();
    addEventListener('resize', size);
    new IntersectionObserver(([entry]) => {
      root.toggleAttribute(
        'data-identity-away',
        !entry.isIntersecting && entry.boundingClientRect.bottom < 0,
      );
    }).observe(identity);
  }
})();

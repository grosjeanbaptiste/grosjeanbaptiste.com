// The other displays of the CV, warmed ahead. Once this page has gone quiet, read the
// page of every other display in the views bar and fetch, at low priority, what
// it announces — scripts, styles, preloads, and the list a reader page keeps for
// us — so the first click on a display
// finds its files in the HTTP cache instead of paying for them then. Loaded by
// the classic page and by the app. Plain fetch(), because Safari has no
// <link rel="prefetch">. Nothing under Save-Data or on 2G; XSLT displays are
// left alone (one XML file each, and only Firefox renders them).
(() => {
  const connection = navigator.connection;
  if (connection?.saveData || /2g$/.test(connection?.effectiveType ?? '')) return;

  const ANNOUNCED =
    'script[src], link[rel~="stylesheet"], link[rel~="modulepreload"], link[rel~="preload"], link[rel~="prefetch"]';
  const asked = new Set(performance.getEntriesByType('resource').map((entry) => entry.name));
  const warm = async (url) => {
    if (asked.has(url)) return undefined;
    asked.add(url);
    const response = await fetch(url, { priority: 'low' });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response;
  };

  // One display: its page, then what the page announces, one file at a time.
  const ahead = async (page) => {
    const response = await warm(page);
    if (!response) return;
    const html = new DOMParser().parseFromString(await response.text(), 'text/html');
    const announced = [...html.querySelectorAll(ANNOUNCED)].map(
      (element) => element.getAttribute('src') ?? element.getAttribute('href'),
    );
    // A reader page lists its heavy files (the PDF, the PDF engine) apart, in
    // JSON, so that it does not fetch them ahead itself — only we do.
    const listed = JSON.parse(html.querySelector('script.views-ahead')?.textContent ?? '[]');
    for (const href of [...announced, ...listed]) {
      const url = new URL(href, page);
      if (url.origin !== location.origin) continue;
      const file = await warm(url.href);
      if (file) await file.arrayBuffer();
    }
  };

  const others = () =>
    [...document.querySelectorAll('.views-bar-link')].filter(
      (link) =>
        link.origin === location.origin &&
        !link.pathname.endsWith('.xml') &&
        link.getAttribute('aria-current') !== 'page',
    );

  // The app draws its views bar once its data is in: look again for a while.
  const start = async (tries = 20) => {
    const links = others();
    if (!links.length) {
      if (tries > 0) return setTimeout(() => start(tries - 1), 500);
      return console.warn('views-ahead.js: no views bar on this page; nothing warmed ahead.');
    }
    for (const link of links) {
      try {
        await ahead(link.href);
      } catch (error) {
        console.warn(`Warming ${link.href} ahead failed; it will load when opened:`, error);
      }
    }
    return undefined;
  };

  // Not before this page has finished its own loading: on the PDF reader the
  // engine is still arriving after `load`, and warming other displays then
  // delayed it (measured: the PDF complete 0.7 s later). Quiet = no resource
  // finishing for a while.
  const QUIET_MS = 3000;
  const quiet = () =>
    new Promise((resolve) => {
      const done = () => {
        observer.disconnect();
        resolve();
      };
      let timer = setTimeout(done, QUIET_MS);
      const observer = new PerformanceObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(done, QUIET_MS);
      });
      observer.observe({ type: 'resource' });
    });
  const begin = () => quiet().then(() => start());
  if (document.readyState === 'complete') begin();
  else addEventListener('load', begin);
})();

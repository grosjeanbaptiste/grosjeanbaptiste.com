import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// findBy* waits for the async load of the CV; 1 s is too short under load.
configure({ asyncUtilTimeout: 10_000 });

// jsdom lacks the layout APIs cmdk calls to keep the selected option in view.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// Only under jsdom: specs that declare `@vitest-environment node` have no DOM.
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= () => {};

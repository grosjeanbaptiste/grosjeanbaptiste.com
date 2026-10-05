import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const SITE_ROOT = resolve(import.meta.dirname, '..');
const SHARED = ['/css/', '/js/', '/assets/', '/favicon.ico', '/manifest.webmanifest'];
const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
};

// The app reuses the site's own fonts and DSL-generated palette rather than
// copying them: the tags are added after Vite's HTML processing (so the build
// leaves those absolute URLs alone), and the dev server serves them from the
// repository root, as GitHub Pages does in production.
function siteAssets(): Plugin {
  return {
    name: 'site-assets',
    transformIndexHtml: () => [
      { tag: 'link', attrs: { rel: 'stylesheet', href: '/css/fonts.css' }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'stylesheet', href: '/css/variables.css' }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'stylesheet', href: '/css/views-bar.css' }, injectTo: 'head' },
      // The site's own warm-up of the other displays (js/views-ahead.js).
      { tag: 'script', attrs: { src: '/js/views-ahead.js', defer: true }, injectTo: 'head' },
      { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: 'any' }, injectTo: 'head' },
      {
        tag: 'link',
        attrs: { rel: 'icon', type: 'image/svg+xml', href: '/assets/icons/favicon.svg' },
        injectTo: 'head',
      },
    ],
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0] ?? '';
        const file = join(SITE_ROOT, url);
        const inside = file.startsWith(`${SITE_ROOT}/`);
        const shared = SHARED.some((p) => url.startsWith(p));
        if (!inside || !shared || !existsSync(file) || !statSync(file).isFile()) {
          return next();
        }
        res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
  };
}

// Served from https://www.grosjeanbaptiste.com/app/ — built into ../app,
// which GitHub Pages serves as-is next to the static and XSLT views.
export default defineConfig(({ isSsrBuild }) => ({
  base: '/app/',
  plugins: [react(), siteAssets()],
  // The manifest names the hashed chunks: scripts/route-pages.mjs reads it to
  // have the reader pages start loading the PDF engine with their own HTML.
  // The Node build (src/prerender.tsx → .prerender/) is code only: it must not
  // take a copy of public/ with it.
  build: { outDir: '../app', emptyOutDir: true, manifest: true, copyPublicDir: !isSsrBuild },
  test: {
    environment: 'jsdom',
    setupFiles: ['./spec-support/setup.ts'],
    // Role queries over the whole page are slow in jsdom, and slower still on a
    // loaded machine: a tight budget fails healthy tests (seen at load ~70).
    testTimeout: 30_000,
    include: ['src/**/*.spec.{ts,tsx}', 'scripts/**/*.spec.mjs'],
  },
}));

// Composition root: wires the HTTP adapter, the PDF engine and the clock, and
// starts the app (src/start-app.tsx) in the page's #root.
import { HttpResumeSource } from './infrastructure/http-resume-source';
import { PdfJsRenderer } from './infrastructure/pdfjs-renderer';
import { startApp } from './start-app';
import './ui/styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('index.html has no #root element to mount the app into');

startApp(container, {
  source: new HttpResumeSource(import.meta.env.BASE_URL),
  pdf: new PdfJsRenderer(),
  browserLanguages: navigator.languages,
  today: new Date(),
}).catch((error: unknown) => {
  console.error('The app failed to start:', error);
  throw error;
});

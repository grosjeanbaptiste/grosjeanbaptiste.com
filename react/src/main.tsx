// Composition root: wires the HTTP adapter, the browser router and the clock.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { HttpResumeSource } from './infrastructure/http-resume-source';
import { PdfJsRenderer } from './infrastructure/pdfjs-renderer';
import { App } from './ui/App';
import './ui/styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('index.html has no #root element to mount the app into');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename="/app">
      <App
        source={new HttpResumeSource(import.meta.env.BASE_URL)}
        pdf={new PdfJsRenderer()}
        browserLanguages={navigator.languages}
        today={new Date()}
      />
    </BrowserRouter>
  </StrictMode>,
);

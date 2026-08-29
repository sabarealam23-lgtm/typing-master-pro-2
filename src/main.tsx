import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register lightweight Service Worker for offline asset caching and PWA support
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker successfully registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration skipped or failed:', err);
      });
  });
}

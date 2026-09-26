import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { mountFinanceMobileNav } from './components/MobileNavBridge';
import './index.css';
import './mobile-tokens.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.removeAttribute('data-codepackr-prerendered');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  // Fixed mobile bottom nav (spec §07–§08)
  mountFinanceMobileNav();
}

// Service Worker disabled after Cloudflare → Vercel migration.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => {
        reg.unregister().catch(() => {});
      });
    }).catch(() => {});
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key).catch(() => {});
        });
      }).catch(() => {});
    }
  });
}

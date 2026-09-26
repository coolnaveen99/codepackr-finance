import { useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MobileBottomNav, FINANCE_MOBILE_TABS } from './MobileBottomNav';

function FinanceMobileNavHost() {
  const [tab, setTab] = useState('home');

  const onSelect = (t: string) => {
    setTab(t);
    if (t === 'home') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (t === 'calculators') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      document.getElementById('sidebar-toggle-btn')?.click();
    } else if (t === 'saved') {
      window.history.pushState({}, '', '/?cat=bookmarks');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (t === 'history') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (t === 'more') {
      document.getElementById('sidebar-toggle-btn')?.click();
    }
  };

  return (
    <MobileBottomNav activeTab={tab} onSelectTab={onSelect} tabs={FINANCE_MOBILE_TABS} />
  );
}

let root: Root | null = null;

/** Mount fixed mobile bottom nav once (safe for React 18). */
export function mountFinanceMobileNav() {
  if (typeof document === 'undefined') return;
  let host = document.getElementById('cp-mobile-nav-root');
  if (!host) {
    host = document.createElement('div');
    host.id = 'cp-mobile-nav-root';
    document.body.appendChild(host);
  }
  if (!root) {
    root = createRoot(host);
    root.render(<FinanceMobileNavHost />);
  }
  document.documentElement.classList.add('cp-has-mobile-nav');
}

export function FinanceMobileNavEffect() {
  useEffect(() => {
    mountFinanceMobileNav();
  }, []);
  return null;
}

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid, Star, WalletCards, LineChart, Landmark, BriefcaseBusiness,
  BadgeIndianRupee, PiggyBank, Home, ShieldCheck, ChevronLeft, ChevronRight, X, Lock
} from 'lucide-react';
import { CategoryFilter } from '../types';
import { TOOLS } from '../data/tools';
import { useBookmarks } from '../lib/bookmarks';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onGoHome: () => void;
  onGoBookmarks: () => void;
  onGoContact: () => void;
  onGoPrivacy: () => void;
  onGoTerms: () => void;
}

const FINANCE_NAV: Array<{ id: CategoryFilter; label: string; icon: React.ReactNode }> = [
  { id: 'loans' as CategoryFilter, label: 'Loans & Debt', icon: <WalletCards className="w-4 h-4" /> },
  { id: 'investments' as CategoryFilter, label: 'Investments', icon: <LineChart className="w-4 h-4" /> },
  { id: 'tax' as CategoryFilter, label: 'Tax Planning', icon: <Landmark className="w-4 h-4" /> },
  { id: 'salary' as CategoryFilter, label: 'Salary & In-Hand', icon: <BadgeIndianRupee className="w-4 h-4" /> },
  { id: 'retirement' as CategoryFilter, label: 'Retirement & FIRE', icon: <PiggyBank className="w-4 h-4" /> },
  { id: 'personal-finance' as CategoryFilter, label: 'Personal Finance', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'business-finance' as CategoryFilter, label: 'Business Finance', icon: <BriefcaseBusiness className="w-4 h-4" /> },
];

/** Smooth count-up micro-animation for sidebar badges (matches parent CodePackr). */
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplayValue(value);
      return;
    }
    const duration = 400;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    };

    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  selectedCategory,
  onSelectCategory,
  onGoHome,
  onGoBookmarks,
}) => {
  const { count: bookmarkCount } = useBookmarks();

  const handleHome = () => {
    onSelectCategory('all');
    onGoHome();
    onClose();
  };

  const handleBookmarks = () => {
    onSelectCategory('bookmarks');
    onGoBookmarks();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out border-r border-[color:var(--border)] bg-[color:var(--surface)] flex flex-col justify-between shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-18' : 'w-72 xl:w-[295px]'}`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-5 custom-scrollbar">
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-2">
              <img
                src="/codepackr-finance-icon.svg"
                alt=""
                className="w-5 h-5 object-contain"
                width="20"
                height="20"
              />
              <span className="font-semibold text-[color:var(--ink)]">Financial Navigation</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <a
            id="mobile-nav-codepackr-devsuite-link"
            href="https://www.codepackr.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            title="Switch to Codepackr Developer & Utility Suite"
            className="lg:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer"
          >
            <span aria-hidden="true">←</span>
            <span>Codepackr Dev Suite</span>
          </a>

          <div className="space-y-1">
            {/* All Tools — solid brand fill + white left accent (matches parent) */}
            <button
              onClick={handleHome}
              className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group overflow-hidden ${
                selectedCategory === 'all'
                  ? 'bg-[color:var(--brand)] text-white shadow-sm'
                  : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
              }`}
              aria-current={selectedCategory === 'all' ? 'page' : undefined}
            >
              {selectedCategory === 'all' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white shadow-xs" />
              )}
              <div className="flex items-center gap-3 min-w-0">
                <LayoutGrid className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="font-medium">All Tools</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-white/20 font-bold' : 'bg-[color:var(--surface-muted)]'}`}>
                  <AnimatedNumber value={TOOLS.length} />
                </span>
              )}
            </button>

            {/* Favorites — warning fill + white left accent */}
            <button
              onClick={handleBookmarks}
              className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group overflow-hidden ${
                selectedCategory === 'bookmarks'
                  ? 'bg-[color:var(--warning)] text-white shadow-sm'
                  : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
              }`}
              aria-current={selectedCategory === 'bookmarks' ? 'page' : undefined}
            >
              {selectedCategory === 'bookmarks' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white shadow-xs" />
              )}
              <div className="flex items-center gap-3 min-w-0">
                <Star className={`w-4 h-4 shrink-0 ${selectedCategory === 'bookmarks' ? 'fill-white' : bookmarkCount > 0 ? 'text-[color:var(--warning)] fill-[color:var(--warning)]' : ''}`} />
                {!isCollapsed && <span className="font-medium">Favorites</span>}
              </div>
              {!isCollapsed && bookmarkCount > 0 && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${selectedCategory === 'bookmarks' ? 'bg-white/20' : 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]'}`}>
                  <AnimatedNumber value={bookmarkCount} />
                </span>
              )}
            </button>
          </div>

          <div>
            {!isCollapsed && (
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)] px-3 mb-2 block">
                Categories
              </span>
            )}
            <div className="space-y-1">
              {FINANCE_NAV.map((cat) => {
                const count = TOOLS.filter((t) => t.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={String(cat.id)}
                    onClick={() => { onSelectCategory(cat.id); onClose(); }}
                    title={cat.label}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group overflow-hidden ${
                      isSelected
                        ? 'bg-[color:var(--brand-light)] text-[color:var(--brand)] font-semibold'
                        : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
                    }`}
                    aria-current={isSelected ? 'page' : undefined}
                  >
                    {/* Left accent bar — same selection graphic as parent CodePackr */}
                    {isSelected && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[color:var(--brand)] shadow-xs animate-scale-in" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1.5 text-left">
                      <span className="shrink-0">{cat.icon}</span>
                      {!isCollapsed && (
                        <span className="text-sm font-medium leading-snug break-words" title={cat.label}>
                          {cat.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md shrink-0 ml-1 ${isSelected ? 'bg-[color:var(--brand)]/10 font-bold' : 'bg-[color:var(--surface-muted)]'}`}>
                        <AnimatedNumber value={count} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isCollapsed && (
            <div className="pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)] px-3 mb-2 block">
                Plan & Grow
              </span>
              <div className="grid grid-cols-2 gap-2 px-1">
                <button
                  type="button"
                  onClick={() => { onSelectCategory('loans'); onClose(); }}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface)] cursor-pointer"
                >
                  <WalletCards className="w-4 h-4 text-[color:var(--brand)] mb-2" />
                  <span className="text-[11px] font-semibold text-[color:var(--ink)] leading-tight block">Manage Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onSelectCategory('investments'); onClose(); }}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface)] cursor-pointer"
                >
                  <LineChart className="w-4 h-4 text-[color:var(--brand)] mb-2" />
                  <span className="text-[11px] font-semibold text-[color:var(--ink)] leading-tight block">Grow Investments</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onSelectCategory('personal-finance'); onClose(); }}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface)] cursor-pointer"
                >
                  <PiggyBank className="w-4 h-4 text-[color:var(--brand)] mb-2" />
                  <span className="text-[11px] font-semibold text-[color:var(--ink)] leading-tight block">Build Savings</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onSelectCategory('loans'); onClose(); }}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface)] cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[color:var(--brand)] mb-2" />
                  <span className="text-[11px] font-semibold text-[color:var(--ink)] leading-tight block">Plan a Home</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[color:var(--border)] bg-[color:var(--surface)] space-y-3">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl border border-[color:var(--success)]/20 bg-[color:var(--success)]/5 text-xs space-y-1.5 group hover:border-[color:var(--success)]/40 transition-colors">
              <div className="flex items-center gap-2 text-[color:var(--success)] font-semibold">
                <ShieldCheck className="w-4 h-4 animate-lock-pulse" />
                <span>Privacy-First Calculations</span>
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-[color:var(--ink-muted)] leading-relaxed flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Calculations run in your browser.</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Privacy-first calculations">
              <ShieldCheck className="w-5 h-5 text-[color:var(--success)] animate-lock-pulse" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-xl border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-sm font-medium">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
};

import React from 'react';
import {
  LayoutGrid, Star, WalletCards, LineChart, Landmark, BriefcaseBusiness,
  BadgeIndianRupee, PiggyBank, Home, ShieldCheck, ChevronLeft, ChevronRight, X
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

  const navClass = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
      active
        ? 'bg-[color:var(--brand)] text-white shadow-sm'
        : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
    }`;

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
        } ${isCollapsed ? 'w-18' : 'w-72'}`}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 custom-scrollbar">
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

          <div className="space-y-1">
            <button onClick={handleHome} className={navClass(selectedCategory === 'all')} aria-current={selectedCategory === 'all' ? 'page' : undefined}>
              <div className="flex items-center gap-3 min-w-0">
                <LayoutGrid className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">All Tools</span>}
              </div>
              {!isCollapsed && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-[color:var(--surface-muted)]'}`}>
                  {TOOLS.length}
                </span>
              )}
            </button>

            <button
              onClick={handleBookmarks}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                selectedCategory === 'bookmarks'
                  ? 'bg-[color:var(--warning)] text-white shadow-sm'
                  : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
              }`}
              aria-current={selectedCategory === 'bookmarks' ? 'page' : undefined}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Star className={`w-4 h-4 shrink-0 ${selectedCategory === 'bookmarks' ? 'fill-white' : bookmarkCount > 0 ? 'text-[color:var(--warning)] fill-[color:var(--warning)]' : ''}`} />
                {!isCollapsed && <span className="truncate">Favorites</span>}
              </div>
              {!isCollapsed && bookmarkCount > 0 && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${selectedCategory === 'bookmarks' ? 'bg-white/20' : 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]'}`}>
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>

          {!isCollapsed && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)] px-3 mb-2 block">
                Categories
              </span>
              <div className="space-y-1">
                {FINANCE_NAV.map((cat) => {
                  const count = TOOLS.filter((t) => t.category === cat.id).length;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={String(cat.id)}
                      onClick={() => { onSelectCategory(cat.id); onClose(); }}
                      title={cat.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-[color:var(--brand-light)] text-[color:var(--brand)] font-semibold'
                          : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md shrink-0 ${isSelected ? 'bg-[color:var(--brand)]/10' : 'bg-[color:var(--surface-muted)]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isCollapsed && (
            <div className="pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)] px-3 mb-2 block">
                Plan &amp; Grow
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
            <div className="p-3 rounded-xl border border-[color:var(--success)]/20 bg-[color:var(--success)]/5 text-xs space-y-1">
              <div className="flex items-center gap-2 text-[color:var(--success)] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy-First Calculations</span>
              </div>
              <p className="text-[color:var(--ink-muted)] leading-relaxed">
                Calculations run in your browser.
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="Privacy-first calculations">
              <ShieldCheck className="w-5 h-5 text-[color:var(--success)]" />
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
import React from 'react';
import { Home, Calculator, Search, Star, MoreHorizontal, BookOpen, Scale, Sparkles, TrendingUp, ClipboardList, GraduationCap, LayoutGrid } from 'lucide-react';

export type MobileTab = string;

export interface MobileNavTab {
  id: MobileTab;
  label: string;
  icon: React.ReactNode;
}

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  tabs: MobileNavTab[];
  badgeCounts?: Partial<Record<string, number>>;
  className?: string;
}

/** Shared CodePackr mobile bottom navigation (spec §07–§08). lg:hidden, safe-area, ≥44px targets. */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  tabs,
  badgeCounts = {},
  className = '',
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Primary mobile navigation"
      className={`lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[color:var(--border,var(--color-border,#e2e8f0))] bg-[color:var(--surface,var(--color-surface,#fff))]/95 backdrop-blur-md ${className}`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)',
      }}
    >
      <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = badgeCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 min-h-[44px] px-1 py-1 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[color:var(--brand,var(--color-accent,#2563eb))]'
                  : 'text-[color:var(--ink-muted,var(--color-muted,#64748b))] hover:text-[color:var(--ink,var(--color-fg,#0f172a))]'
              }`}
            >
              <span className="relative flex items-center justify-center">
                {tab.icon}
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-4 text-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-medium leading-tight truncate max-w-full ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[color:var(--brand,var(--color-accent,#2563eb))]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const icon = (El: React.ComponentType<{ className?: string; strokeWidth?: number }>) =>
  <El className="w-5 h-5" strokeWidth={2} />;

/** finance.codepackr.com — Home · Calculators · Saved · History/Plans · More */
export const FINANCE_MOBILE_TABS: MobileNavTab[] = [
  { id: 'home', label: 'Home', icon: icon(Home) },
  { id: 'calculators', label: 'Calculators', icon: icon(Calculator) },
  { id: 'saved', label: 'Saved', icon: icon(Star) },
  { id: 'history', label: 'Plans', icon: icon(ClipboardList) },
  { id: 'more', label: 'More', icon: icon(MoreHorizontal) },
];

/** astro.codepackr.com — Home · Jathagam · Predictions · Saved · More */
export const ASTRO_MOBILE_TABS: MobileNavTab[] = [
  { id: 'home', label: 'Home', icon: icon(Home) },
  { id: 'jathagam', label: 'Jathagam', icon: icon(Sparkles) },
  { id: 'predictions', label: 'Predictions', icon: icon(TrendingUp) },
  { id: 'saved', label: 'Saved', icon: icon(Star) },
  { id: 'more', label: 'More', icon: icon(MoreHorizontal) },
];

/** law.codepackr.com — Home · Study · Judgments · Search · More */
export const LAW_MOBILE_TABS: MobileNavTab[] = [
  { id: 'home', label: 'Home', icon: icon(Home) },
  { id: 'study', label: 'Study', icon: icon(BookOpen) },
  { id: 'judgments', label: 'Judgments', icon: icon(Scale) },
  { id: 'search', label: 'Search', icon: icon(Search) },
  { id: 'more', label: 'More', icon: icon(MoreHorizontal) },
];

/** study.codepackr.com — Home · Subjects · Practice · Progress · More */
export const STUDY_MOBILE_TABS: MobileNavTab[] = [
  { id: 'home', label: 'Home', icon: icon(Home) },
  { id: 'subjects', label: 'Subjects', icon: icon(GraduationCap) },
  { id: 'practice', label: 'Practice', icon: icon(ClipboardList) },
  { id: 'progress', label: 'Progress', icon: icon(TrendingUp) },
  { id: 'more', label: 'More', icon: icon(MoreHorizontal) },
];

import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowRight,
  Search,
  Share2,
  Star,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ToolDef, CategoryFilter } from '../types';
import { TOOLS } from '../data/tools';
import { getIcon } from '../lib/icons';
import { useBookmarks, shareToolUrl } from '../lib/bookmarks';
import { useToolGovernance } from '../lib/useToolGovernance';
import { useAdminAuth } from '../lib/useAdminAuth';
import { HeroPreviewCards } from './HeroPreviewCards';

interface HomeDashboardProps {
  onSelectTool: (tool: ToolDef, initialPayload?: string) => void;
  onOpenSearch: () => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onGoTrustPage?: (page: 'about' | 'financial-disclaimer' | 'cookie-policy' | 'calculation-methodology' | 'editorial-policy') => void;
}

const ROTATING_SUBLINES = [
  'Plan your home loan with confidence…',
  'See your SIP wealth grow over time…',
  'Calculate exact take-home salary…',
  'Model your retirement corpus…',
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sublineIndex, setSublineIndex] = useState(0);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isToolVisible } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setSublineIndex((prev) => (prev + 1) % ROTATING_SUBLINES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const visibleTools = useMemo(() => {
    return TOOLS.filter((tool) => isToolVisible(tool.id, isAuthenticated));
  }, [isAuthenticated, isToolVisible]);

  const filteredTools = useMemo(() => {
    return visibleTools.filter((tool) => {
      if (selectedCategory === 'bookmarks' && !isBookmarked(tool.id)) return false;
      if (
        selectedCategory !== 'all' &&
        selectedCategory !== 'bookmarks' &&
        tool.category !== selectedCategory
      ) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [isBookmarked, searchQuery, selectedCategory, visibleTools]);

  const handleCardShare = async (e: React.MouseEvent, tool: ToolDef) => {
    e.stopPropagation();
    const success = await shareToolUrl(tool.id, tool.name, tool.description);
    if (success) {
      setCopiedId(tool.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const scrollToToolGrid = () => {
    const el = document.getElementById('tool-grid');
    if (el) {
      const navOffset = 90;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  return (
    <div id="home-dashboard" className="space-y-16 pb-20 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[color:var(--surface)] via-emerald-500/[0.04] to-teal-500/[0.07] dark:from-[color:var(--surface)] dark:via-emerald-950/20 dark:to-teal-950/25 shadow-lg shadow-emerald-500/[0.03]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="col-span-1 lg:col-span-7 w-full max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 mb-6 shadow-xs backdrop-blur-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>100% Client-Side Execution · Privacy Guaranteed</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[color:var(--ink)] leading-[1.12] mb-5">
                Free Financial Calculators,
                <br />
                Built for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500">
                  Smart Money Decisions.
                </span>
              </h1>

              <div className="h-8 flex items-center gap-2 text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span key={sublineIndex} className="inline-block">
                  {ROTATING_SUBLINES[sublineIndex]}
                </span>
              </div>

              <p className="text-base sm:text-lg text-[color:var(--ink-muted)] mb-8 leading-relaxed max-w-xl">
                Calculate, compare, and forecast loans, investments, retirement, salary, and personal finance with transparent assumptions, interactive schedules, and zero tracking.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToToolGrid}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2 text-sm"
                >
                  Explore All Calculators
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500/70 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer text-sm"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  Search Calculators
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]">
                    Ctrl K
                  </kbd>
                </button>
              </div>
            </div>

            <HeroPreviewCards onSelectTool={onSelectTool} visibleSlots={3} />
          </div>
        </div>
      </section>

      <section id="tool-grid" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">All Calculators</h2>
            <p className="text-sm text-[color:var(--ink-muted)]">
              {filteredTools.length} tools · 100% client-side
            </p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-[color:var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter calculators..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all' as CategoryFilter, label: 'All' },
              { id: 'loans' as CategoryFilter, label: 'Loans' },
              { id: 'investments' as CategoryFilter, label: 'Investments' },
              { id: 'tax' as CategoryFilter, label: 'Tax' },
              { id: 'salary' as CategoryFilter, label: 'Salary' },
              { id: 'retirement' as CategoryFilter, label: 'Retirement' },
              { id: 'personal-finance' as CategoryFilter, label: 'Personal' },
              { id: 'business-finance' as CategoryFilter, label: 'Business' },
              { id: 'bookmarks' as CategoryFilter, label: 'Favorites' },
            ] as const
          ).map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--ink-muted)] hover:border-emerald-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const bookmarked = isBookmarked(tool.id);
            const isCopied = copiedId === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="group flex flex-col bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border)] p-5 cursor-pointer transition-all hover:border-emerald-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] group-hover:text-emerald-600 group-hover:border-emerald-500 transition">
                    {getIcon(tool.icon, 22)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(tool.id);
                      }}
                      className={`p-2 rounded-lg cursor-pointer ${
                        bookmarked ? 'text-amber-500' : 'text-[color:var(--ink-muted)]'
                      }`}
                      aria-label="Bookmark"
                    >
                      <Star className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCardShare(e, tool)}
                      className="p-2 rounded-lg text-[color:var(--ink-muted)] cursor-pointer"
                      aria-label="Share"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-[color:var(--ink)] group-hover:text-emerald-600 transition">
                  {tool.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--ink-muted)] line-clamp-2 flex-1">
                  {tool.description}
                </p>
                <div className="mt-3 pt-3 border-t border-[color:var(--border)] flex items-center justify-between text-xs font-semibold text-emerald-600">
                  <span>Open Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 text-[color:var(--ink-muted)]">
            No calculators match your filters.
          </div>
        )}
      </section>
    </div>
  );
};

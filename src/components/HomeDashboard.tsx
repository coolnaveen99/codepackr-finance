import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Search,
  Star,
  Share2,
  Check,
} from 'lucide-react';
import { ToolDef, CategoryFilter } from '../types';
import { TOOLS, CATEGORIES } from '../data/tools';
import { getIcon } from '../lib/icons';
import { useBookmarks, shareToolUrl } from '../lib/bookmarks';
import { useToolGovernance } from '../lib/useToolGovernance';
import { useAdminAuth } from '../lib/useAdminAuth';
import { FinanceHero } from './FinanceHero';

interface HomeDashboardProps {
  onSelectTool: (tool: ToolDef, initialPayload?: string) => void;
  onOpenSearch: () => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onGoTrustPage?: (page: 'about' | 'financial-disclaimer' | 'cookie-policy' | 'calculation-methodology' | 'editorial-policy') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isToolVisible } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();

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

  return (
    <div id="home-dashboard" className="space-y-10 pb-20 animate-fade-in">
      <FinanceHero onSelectTool={onSelectTool} onOpenSearch={onOpenSearch} />

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

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CreditCard,
  PiggyBank,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Landmark,
  BadgeIndianRupee,
  LineChart,
  WalletCards,
  X,
  Sparkles,
} from 'lucide-react';
import { ToolDef, CategoryFilter } from '../types';
import { TOOLS } from '../data/tools';
import { getIcon } from '../lib/icons';
import { useBookmarks, shareToolUrl } from '../lib/bookmarks';
import { useToolGovernance } from '../lib/useToolGovernance';
import { useAdminAuth } from '../lib/useAdminAuth';

interface HomeDashboardProps {
  onSelectTool: (tool: ToolDef, initialPayload?: string) => void;
  onOpenSearch: () => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
}

const planningCards = [
  {
    title: 'Manage a Loan',
    description: 'Estimate EMI, total interest, and repayment scenarios.',
    icon: CreditCard,
    toolId: 'loan-calculator',
    category: 'loans' as CategoryFilter,
  },
  {
    title: 'Grow My Investments',
    description: 'Compare SIP, compound growth, and long-term returns.',
    icon: TrendingUp,
    toolId: 'sip-calculator',
    category: 'investments' as CategoryFilter,
  },
  {
    title: 'Plan Retirement',
    description: 'Model your retirement corpus and future funding needs.',
    icon: Target,
    toolId: 'financial-planner',
    category: 'retirement' as CategoryFilter,
  },
  {
    title: 'Build Savings',
    description: 'Understand savings goals, growth, and emergency readiness.',
    icon: PiggyBank,
    toolId: 'savings-goal-calculator',
    category: 'personal-finance' as CategoryFilter,
  },
  {
    title: 'Understand My Salary',
    description: 'Explore CTC, in-hand pay, statutory deductions, and take-home pay.',
    icon: BriefcaseBusiness,
    toolId: 'ctc-to-in-hand-calculator',
    category: 'salary' as CategoryFilter,
  },
  {
    title: 'Check My Financial Position',
    description: 'See the bigger picture across savings, debt, and net worth.',
    icon: BarChart3,
    toolId: 'net-worth-calculator',
    category: 'personal-finance' as CategoryFilter,
  },
];

const categoryCards: Array<{
  id: CategoryFilter;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'loans', title: 'Loans & Debt', desc: 'EMI, amortization, prepayments & DTI', icon: WalletCards },
  { id: 'investments', title: 'Investments', desc: 'SIP, lumpsum, CAGR, ROI & compounding', icon: LineChart },
  { id: 'tax', title: 'Tax Planning', desc: 'New vs Old tax regimes & slab breakdowns', icon: Landmark },
  { id: 'salary', title: 'Salary & In-Hand', desc: 'CTC take-home, appraisal increments & gratuity', icon: BadgeIndianRupee },
  { id: 'retirement', title: 'Retirement & FIRE', desc: 'Corpus projection, FIRE milestones & inflation', icon: PiggyBank },
  { id: 'personal-finance', title: 'Personal Finance', desc: 'Emergency funds, savings goals & net worth', icon: ShieldCheck },
  { id: 'business-finance', title: 'Business & Valuation', desc: 'Capital multiples, ROI and valuation analysis', icon: BriefcaseBusiness },
];

const signatureCards = [
  {
    title: 'Emergency Fund & Health',
    description: 'A structured assessment of liquidity, runway, and financial emergency readiness.',
    toolId: 'emergency-fund-calculator',
  },
  {
    title: 'Retirement Planner',
    description: 'Estimate future corpus needs with transparent assumptions and scenario modeling.',
    toolId: 'financial-planner',
  },
  {
    title: 'FIRE Calculator',
    description: 'Explore financial independence timelines using Lean, Fat, and Coast FIRE targets.',
    toolId: 'fire-calculator',
  },
  {
    title: 'Net Worth Calculator',
    description: 'Understand the gap between what you own, what you owe, and where you are heading.',
    toolId: 'net-worth-calculator',
  },
];

const CATEGORY_TABS: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All Calculators' },
  { id: 'loans', label: 'Loans & Debt' },
  { id: 'investments', label: 'Investments' },
  { id: 'tax', label: 'Tax Planning' },
  { id: 'salary', label: 'Salary & In-Hand' },
  { id: 'retirement', label: 'Retirement & FIRE' },
  { id: 'personal-finance', label: 'Personal Finance' },
  { id: 'bookmarks', label: 'Favorites' },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isBookmarked, toggleBookmark, bookmarks } = useBookmarks();
  const { isToolVisible } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();

  const visibleTools = useMemo(() => {
    return TOOLS.filter((tool) => isToolVisible(tool.id, isAuthenticated));
  }, [isAuthenticated, isToolVisible]);

  const popularTools = useMemo(() => {
    const popular = visibleTools.filter((tool) => tool.popular);
    return popular.length ? popular : visibleTools.slice(0, 6);
  }, [visibleTools]);

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

  const handleCategoryTabClick = (cat: CategoryFilter) => {
    onSelectCategory(cat);
    scrollToToolGrid();
  };

  const filteredTools = useMemo(() => {
    return visibleTools.filter((tool) => {
      if (selectedCategory === 'bookmarks' && !isBookmarked(tool.id)) return false;
      if (selectedCategory !== 'all' && selectedCategory !== 'bookmarks' && tool.category !== selectedCategory) {
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

  return (
    <div id="home-dashboard" className="space-y-16 pb-20 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[color:var(--brand)] via-[color:var(--accent)] to-[color:var(--success)]" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 opacity-[0.07] text-[color:var(--brand)]" aria-hidden="true">
            <span className="block text-[20rem] font-mono font-bold leading-none">&gt;=</span>
          </div>
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[color:var(--brand)]/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
        </div>
        <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[color:var(--success)] animate-pulse" />
              100% Client-Side Execution · Privacy Guaranteed
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[color:var(--ink)] leading-[1.08] mb-5 max-w-4xl">
              Free Financial Calculators,<br />
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--accent)]">Smart Money Decisions.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[color:var(--ink-muted)] mb-8 max-w-3xl leading-relaxed">
              Calculate, compare, and forecast loans, investments, retirement, salary, and personal finance with transparent assumptions, interactive schedules, and instant local results.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={scrollToToolGrid}
                className="px-6 py-3 rounded-xl font-bold text-white bg-[color:var(--brand)] hover:bg-[color:var(--brand-hover)] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                Explore All Calculators <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onOpenSearch}
                className="px-6 py-3 rounded-xl font-bold border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] hover:border-[color:var(--brand)] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Search className="w-5 h-5 text-[color:var(--ink-muted)]" />
                Search Calculators ({typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section id="popular-tools" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Most Popular</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Start with a premier calculator</h2>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">High-value tools for the essential financial decisions people make most often.</p>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryTabClick('all')}
            className="self-start text-sm font-bold text-[color:var(--brand)] hover:underline sm:self-auto cursor-pointer flex items-center gap-1"
          >
            Browse all {visibleTools.length} tools <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.slice(0, 6).map((tool) => {
            const bookmarked = isBookmarked(tool.id);
            const copied = copiedId === tool.id;
            return (
              <article
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="group cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--brand)]">
                    {getIcon(tool.icon, 23)}
                  </div>
                  <div className="flex items-center gap-1">
                    {tool.popular && (
                      <span className="rounded-md bg-[color:var(--brand)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)]">
                        Popular
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(tool.id);
                      }}
                      className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)] cursor-pointer"
                      aria-label="Favorite calculator"
                    >
                      <Star className={`h-4 w-4 ${bookmarked ? 'fill-current text-[color:var(--warning)]' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCardShare(e, tool)}
                      className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)] cursor-pointer"
                      aria-label="Share calculator"
                    >
                      {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                  {tool.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--ink-muted)]">
                  {tool.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  <span className="capitalize">{tool.category.replace('-', ' ')}</span>
                  <span className="inline-flex items-center gap-1 text-[color:var(--brand)] font-bold">
                    Calculate Now <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Intent-based Navigation */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Goal-Oriented Planning</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">What are you planning today?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]">
            Choose the financial milestone or question you want answered. Each goal links directly to its dedicated calculator.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {planningCards.map((card) => {
            const Icon = card.icon;
            const target = visibleTools.find((t) => t.id === card.toolId);
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => {
                  if (target) {
                    onSelectTool(target);
                  } else {
                    handleCategoryTabClick(card.category);
                  }
                }}
                className="group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-elevated)] cursor-pointer"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">
                    {card.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[color:var(--ink-muted)] group-hover:text-[color:var(--brand)] transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Explore By Domain</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Financial tool categories</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">Select a category to view all specialized calculators in that domain.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const count = visibleTools.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={String(cat.id)}
                type="button"
                onClick={() => handleCategoryTabClick(cat.id)}
                className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                  isSelected
                    ? 'border-[color:var(--brand)] bg-[color:var(--brand-light)] shadow-sm'
                    : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--brand)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[color:var(--brand)] text-white' : 'bg-[color:var(--surface-elevated)] text-[color:var(--brand)]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]">
                    {count} tools
                  </span>
                </div>
                <div className="text-base font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                  {cat.title}
                </div>
                <div className="mt-1 text-xs text-[color:var(--ink-muted)] leading-relaxed">
                  {cat.desc}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[color:var(--brand)]">
                  View calculators <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Signature Decisions Section */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">High-Impact Decision Suites</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Comprehensive planning calculators</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {signatureCards.map((item) => {
            const target = visibleTools.find((t) => t.id === item.toolId);
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (target) onSelectTool(target);
                  else onOpenSearch();
                }}
                className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:shadow-lg cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)] flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">
                    {item.description}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[color:var(--brand)]">
                  Launch Planner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ALL TOOLS DIRECTORY & FILTER GRID */}
      <section id="tool-grid" className="scroll-mt-24 space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[color:var(--border)] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Calculator Directory</p>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">
              {selectedCategory === 'all'
                ? 'All Financial Calculators'
                : selectedCategory === 'bookmarks'
                ? 'Your Favorited Calculators'
                : CATEGORY_TABS.find((t) => t.id === selectedCategory)?.label || 'Calculators'}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'calculator' : 'calculators'}
              {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}.
            </p>
          </div>

          {/* Quick in-page search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--ink-muted)]" />
            <input
              type="text"
              placeholder="Filter calculators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-none focus:border-[color:var(--brand)] shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] cursor-pointer"
                aria-label="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            const count =
              tab.id === 'all'
                ? visibleTools.length
                : tab.id === 'bookmarks'
                ? bookmarks.length
                : visibleTools.filter((t) => t.category === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[color:var(--brand)] text-white border-[color:var(--brand)] shadow-sm'
                    : 'bg-[color:var(--surface)] border-[color:var(--border)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)]'
                }`}
              >
                {tab.id === 'bookmarks' && (
                  <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-white' : 'fill-[color:var(--warning)] text-[color:var(--warning)]'}`} />
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => {
              const bookmarked = isBookmarked(tool.id);
              const copied = copiedId === tool.id;
              return (
                <article
                  key={tool.id}
                  onClick={() => onSelectTool(tool)}
                  className="group cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--brand)]">
                        {getIcon(tool.icon, 23)}
                      </div>
                      <div className="flex items-center gap-1">
                        {tool.popular && (
                          <span className="rounded-md bg-[color:var(--brand)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)]">
                            Popular
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(tool.id);
                          }}
                          className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)] cursor-pointer"
                          aria-label="Favorite calculator"
                        >
                          <Star className={`h-4 w-4 ${bookmarked ? 'fill-current text-[color:var(--warning)]' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCardShare(e, tool)}
                          className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)] cursor-pointer"
                          aria-label="Share calculator"
                        >
                          {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Share2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)] line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]">
                    <span className="capitalize">{tool.category.replace('-', ' ')}</span>
                    <span className="inline-flex items-center gap-1 text-[color:var(--brand)] font-bold">
                      Calculate <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)]">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)] flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[color:var(--ink)]">No calculators match your filter</h3>
            <p className="text-sm text-[color:var(--ink-muted)] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No tools found for "${searchQuery}". Try a broader term or reset your search.`
                : 'No favorited tools saved yet. Click the star on any calculator card to bookmark it.'}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] hover:border-[color:var(--brand)] cursor-pointer"
                >
                  Clear search
                </button>
              )}
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-hover)] cursor-pointer"
                >
                  View all calculators
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Why CodePackr Finance */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Why CodePackr Finance?</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Designed for clarity before commitment.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Free & Open Access', 'Every single calculator is available without paywalls, sign-ups, or spam.'],
              ['100% Client-Side', 'Inputs never leave your browser. Zero backend telemetry or logging.'],
              ['Transparent Formulas', 'Every methodology, amortization schedule, and formula is fully inspectable.'],
              ['Global Currencies', 'Seamlessly switch between INR, USD, EUR, GBP, JPY, and 30+ world currencies.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
                <h3 className="font-bold text-[color:var(--ink)]">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">How calculations work</p>
          <div className="mt-6 space-y-3">
            {['Inputs', 'Formula Engine', 'Calculated Output', 'Amortization & Schedules', 'Local Summary'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-bold text-white font-mono">{index + 1}</span>
                <span className="font-semibold text-[color:var(--ink)] text-sm">{step}</span>
                {index < 4 && <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--ink-muted)]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Methodology */}
      <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Trust & Methodology</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Understand what the numbers mean.</h2>
          <p className="mt-3 text-sm sm:text-base leading-7 text-[color:var(--ink-muted)]">
            Review calculation assumptions, methodology, statutory guidelines, and review dates before using results for critical financial milestones. All outputs are educational models executed client-side.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Mathematical Accuracy', 'Standardized Slabs & Acts', 'Zero Server Transmission', 'Real-Time Schedule Generation'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-4 text-sm font-semibold text-[color:var(--ink)]">
              <ShieldCheck className="h-5 w-5 text-[color:var(--success)] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

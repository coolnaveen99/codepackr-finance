import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  Check,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PiggyBank,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Wallet,
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

const findTool = (...patterns: string[]) =>
  TOOLS.find((tool) => {
    const haystack = `${tool.id} ${tool.name} ${tool.description}`.toLowerCase();
    return patterns.some((pattern) => haystack.includes(pattern.toLowerCase()));
  });

const planningCards = [
  {
    title: 'Manage a Loan',
    description: 'Estimate EMI, total interest, and repayment scenarios.',
    icon: CreditCard,
    matches: ['loan', 'emi'],
    category: 'calculators' as CategoryFilter,
  },
  {
    title: 'Grow My Investments',
    description: 'Compare SIP, compound growth, and long-term returns.',
    icon: TrendingUp,
    matches: ['sip', 'investment', 'compound'],
    category: 'calculators' as CategoryFilter,
  },
  {
    title: 'Plan Retirement',
    description: 'Model your retirement corpus and future funding needs.',
    icon: Target,
    matches: ['retirement', 'financial planner'],
    category: 'calculators' as CategoryFilter,
  },
  {
    title: 'Build Savings',
    description: 'Understand savings goals, growth, and emergency readiness.',
    icon: PiggyBank,
    matches: ['savings', 'emergency'],
    category: 'calculators' as CategoryFilter,
  },
  {
    title: 'Understand My Salary',
    description: 'Explore CTC, in-hand pay, hikes, and salary scenarios.',
    icon: BriefcaseBusiness,
    matches: ['salary', 'ctc', 'in-hand'],
    category: 'calculators' as CategoryFilter,
  },
  {
    title: 'Check My Financial Position',
    description: 'See the bigger picture across savings, debt, and net worth.',
    icon: BarChart3,
    matches: ['net worth', 'financial health', 'financial planner'],
    category: 'calculators' as CategoryFilter,
  },
];

const categoryCards = [
  ['Loans & Debt', 'loans'],
  ['Investments', 'investments'],
  ['Tax', 'tax'],
  ['Salary', 'salary'],
  ['Retirement', 'retirement'],
  ['Personal Finance', 'personal-finance'],
  ['Real Estate', 'real-estate'],
  ['Business Finance', 'business-finance'],
  ['Advanced Finance', 'advanced-finance'],
];

const signaturePatterns = [
  { title: 'Financial Health Check', description: 'A structured view of savings, debt, emergency funds, investments, and retirement readiness.', patterns: ['financial health', 'health check'] },
  { title: 'Retirement Planner', description: 'Estimate future corpus needs with transparent assumptions and scenario thinking.', patterns: ['retirement', 'financial planner'] },
  { title: 'FIRE Planner', description: 'Explore financial independence timelines using your own assumptions.', patterns: ['fire planner', 'fire'] },
  { title: 'Net Worth Calculator', description: 'Understand the gap between what you own, what you owe, and where you are heading.', patterns: ['net worth'] },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTool,
  selectedCategory,
  onSelectCategory,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isToolVisible, getToolStatus } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();
  const { visibleTools, popularTools, fallbackTools } = useMemo(() => {
    const visible = TOOLS.filter((tool) => isToolVisible(tool.id, isAuthenticated));
    const popular = visible.filter((tool) => tool.popular);
    return {
      visibleTools: visible,
      popularTools: popular.length ? popular : visible.slice(0, 6),
      fallbackTools: visible.slice(0, 6),
    };
  }, [isAuthenticated, isToolVisible]);

  const handleCardShare = async (e: React.MouseEvent, tool: ToolDef) => {
    e.stopPropagation();
    const success = await shareToolUrl(tool.id, tool.name, tool.description);
    if (success) {
      setCopiedId(tool.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredTools = useMemo(() => {
    return visibleTools.filter((tool) => {
      if (selectedCategory === 'bookmarks' && !isBookmarked(tool.id)) return false;
      if (selectedCategory !== 'all' && selectedCategory !== 'bookmarks' && tool.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords?.some((k) => k.toLowerCase().includes(q));
    });
  }, [isBookmarked, searchQuery, selectedCategory, visibleTools]);

  const primaryTools = popularTools.length ? popularTools : fallbackTools;

  return (
    <div id="home-dashboard" className="space-y-16 pb-20 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[color:var(--brand)]/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
        </div>
        <div className="relative z-10 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--success)]" />
              Transparent calculations. Clear assumptions. Private by design.
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-[color:var(--ink)] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Free Financial Calculators &amp; Smart Money Tools
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--ink-muted)] sm:text-lg">
              Calculate, compare and understand loans, investments, retirement, salary and personal finance with transparent assumptions and clear results.
            </p>

            <div className="mt-8 max-w-3xl">
              <button
                onClick={onOpenSearch}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-4 text-left shadow-sm transition hover:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30"
                aria-label="Search financial calculators"
              >
                <Search className="h-5 w-5 shrink-0 text-[color:var(--ink-muted)] group-hover:text-[color:var(--brand)]" />
                <span className="flex-1 truncate text-sm font-medium text-[color:var(--ink-muted)] sm:text-base">Search financial calculators...</span>
                <kbd className="hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1 font-mono text-xs text-[color:var(--ink-muted)] sm:inline-flex">Ctrl K</kbd>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('popular-tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brand)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[color:var(--brand-hover)]"
              >
                Explore Calculators <ArrowRight className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3 text-xs font-medium text-[color:var(--ink-muted)]">
                <CircleDollarSign className="h-4 w-4" />
                Built for everyday money decisions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section id="popular-tools" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Popular</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Start with a calculator</h2>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">High-value tools for the decisions people make most often.</p>
          </div>
          <button onClick={() => onSelectCategory('all')} className="self-start text-sm font-bold text-[color:var(--brand)] hover:underline sm:self-auto">
            Browse all tools →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryTools.slice(0, 6).map((tool) => {
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
                    {tool.popular && <span className="rounded-md bg-[color:var(--brand)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)]">Popular</span>}
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(tool.id); }} className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)]" aria-label="Favorite calculator">
                      <Star className={`h-4 w-4 ${bookmarked ? 'fill-current text-[color:var(--warning)]' : ''}`} />
                    </button>
                    <button onClick={(e) => handleCardShare(e, tool)} className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)]" aria-label="Share calculator">
                      {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{tool.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--ink-muted)]">{tool.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  <span>{tool.category}</span>
                  <span className="inline-flex items-center gap-1 text-[color:var(--brand)]">Open <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Intent-based navigation */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Start with your goal</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">What are you planning?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]">Choose the outcome you care about. You do not need to know the calculator name first.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {planningCards.map((card) => {
            const Icon = card.icon;
            const target = findTool(...card.matches);
            return (
              <button
                key={card.title}
                onClick={() => target ? onSelectTool(target) : onSelectCategory(card.category)}
                className="group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-elevated)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{card.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{card.description}</p>
                </div>
                <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-[color:var(--ink-muted)] group-hover:block group-hover:text-[color:var(--brand)]" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Explore by area</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Financial tool categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoryCards.map(([label, category]) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category as CategoryFilter)}
              className="group rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 text-left transition hover:border-[color:var(--brand)] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{label}</span>
                <ArrowRight className="h-4 w-4 text-[color:var(--ink-muted)] group-hover:text-[color:var(--brand)]" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Signature tools */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Signature tools</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Tools for bigger decisions</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {signaturePatterns.map((item, index) => {
            const target = findTool(...item.patterns);
            const Icon = [Landmark, Target, Wallet, BarChart3][index];
            return (
              <button
                key={item.title}
                onClick={() => target && onSelectTool(target)}
                className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-lg"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{item.title}</h3>
                      <ArrowRight className="h-4 w-4 text-[color:var(--ink-muted)] group-hover:translate-x-1 group-hover:text-[color:var(--brand)]" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Why + how */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Why CodePackr Finance?</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)]">Designed for clarity, not guesswork.</h2>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Free', 'Use the core tools without a mandatory subscription.'],
              ['Browser-first', 'Calculations can run directly in the browser.'],
              ['Transparent', 'See assumptions and understand the result.'],
              ['No mandatory signup', 'Get to the calculator before creating an account.'],
              ['Exportable reports', 'Take useful results with you when supported.'],
              ['Privacy-conscious', 'Keep sensitive calculator inputs out of the product where possible.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[color:var(--ink)]">
                  <Check className="h-4 w-4 text-[color:var(--success)]" /> {title}
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[color:var(--ink-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">How calculations work</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)]">Calculate → Understand → Compare → Simulate → Plan → Export</h2>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['1', 'Inputs'], ['2', 'Formula'], ['3', 'Result'], ['4', 'Scenario'], ['5', 'Chart / Table'], ['6', 'Export'],
            ].map(([step, title]) => (
              <div key={step} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
                <div className="text-xs font-bold text-[color:var(--brand)]">STEP {step}</div>
                <div className="mt-1 text-sm font-extrabold text-[color:var(--ink)]">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education + Trust */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Learn along the way</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)]">Educational resources</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">Build understanding around the numbers with guides, formula explainers, glossary content, and dated tax information where relevant.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {['Financial guides', 'Formula explainers', 'Glossary', 'Tax-year updates'].map((item) => (
              <span key={item} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-2 text-xs font-semibold text-[color:var(--ink-muted)]">{item}</span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Trust &amp; methodology</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)]">Know where the numbers come from.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">Use methodology notes, calculation sources, review information, and last-updated details to understand the context behind a result.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {['Editorial methodology', 'Calculation methodology', 'Review process', 'Data sources'].map((item) => (
              <div key={item} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-xs font-bold text-[color:var(--ink)]">{item}</div>
            ))}
          </div>
          <p className="mt-5 text-xs italic leading-5 text-[color:var(--ink-muted)]">Results are illustrative projections based on the assumptions entered and should not be presented as personalized professional financial advice.</p>
        </div>
      </section>

      {/* Search / filter fallback for existing tool inventory */}
      <section id="tool-grid" className="space-y-5 border-t border-[color:var(--border)] pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[color:var(--ink)]">All available calculators</h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">Filter the current published inventory or search by financial intent.</p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search within calculators..."
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-2.5 pl-9 pr-4 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.slice(0, 9).map((tool) => (
            <article
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              className="group cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition hover:border-[color:var(--brand)] hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--brand)]">
                  {getIcon(tool.icon, 20)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{tool.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-[color:var(--ink-muted)]">{tool.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

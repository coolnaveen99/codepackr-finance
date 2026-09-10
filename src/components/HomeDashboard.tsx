import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  CreditCard,
  PiggyBank,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
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
  { title: 'Manage a Loan', description: 'Estimate EMI, total interest, and repayment scenarios.', icon: CreditCard, matches: ['loan', 'emi'], category: 'calculators' as CategoryFilter },
  { title: 'Grow My Investments', description: 'Compare SIP, compound growth, and long-term returns.', icon: TrendingUp, matches: ['sip', 'investment', 'compound'], category: 'calculators' as CategoryFilter },
  { title: 'Plan Retirement', description: 'Model your retirement corpus and future funding needs.', icon: Target, matches: ['retirement', 'financial planner'], category: 'calculators' as CategoryFilter },
  { title: 'Build Savings', description: 'Understand savings goals, growth, and emergency readiness.', icon: PiggyBank, matches: ['savings', 'emergency'], category: 'calculators' as CategoryFilter },
  { title: 'Understand My Salary', description: 'Explore CTC, in-hand pay, hikes, and salary scenarios.', icon: BriefcaseBusiness, matches: ['salary', 'ctc', 'in-hand'], category: 'calculators' as CategoryFilter },
  { title: 'Check My Financial Position', description: 'See the bigger picture across savings, debt, and net worth.', icon: BarChart3, matches: ['net worth', 'financial health', 'financial planner'], category: 'calculators' as CategoryFilter },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onSelectTool, selectedCategory, onSelectCategory, onOpenSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isToolVisible, getToolStatus } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();
  const { visibleTools, popularTools } = useMemo(() => {
    const visible = TOOLS.filter((tool) => isToolVisible(tool.id, isAuthenticated));
    const popular = visible.filter((tool) => tool.popular);
    return { visibleTools: visible, popularTools: popular.length ? popular : visible.slice(0, 6) };
  }, [isAuthenticated, isToolVisible]);

  const handleCardShare = async (e: React.MouseEvent, tool: ToolDef) => {
    e.stopPropagation();
    const success = await shareToolUrl(tool.id, tool.name, tool.description);
    if (success) {
      setCopiedId(tool.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredTools = useMemo(() => visibleTools.filter((tool) => {
    if (selectedCategory === 'bookmarks' && !isBookmarked(tool.id)) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'bookmarks' && tool.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q) || tool.keywords?.some((k) => k.toLowerCase().includes(q));
  }), [isBookmarked, searchQuery, selectedCategory, visibleTools]);

  const primaryTools = popularTools.length ? popularTools : filteredTools.slice(0, 6);

  return (
    <div id="home-dashboard" className="space-y-16 pb-20 animate-fade-in">
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
              <button onClick={onOpenSearch} className="group flex w-full items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-4 text-left shadow-sm transition hover:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30" aria-label="Search financial calculators">
                <Search className="h-5 w-5 shrink-0 text-[color:var(--ink-muted)] group-hover:text-[color:var(--brand)]" />
                <span className="flex-1 truncate text-sm font-medium text-[color:var(--ink-muted)] sm:text-base">Search financial calculators...</span>
                <kbd className="hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1 font-mono text-xs text-[color:var(--ink-muted)] sm:inline-flex">Ctrl K</kbd>
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => document.getElementById('popular-tools')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brand)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[color:var(--brand-hover)]">
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

      <section id="popular-tools" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Popular</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Start with a calculator</h2>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">High-value tools for the decisions people make most often.</p>
          </div>
          <button onClick={() => onSelectCategory('all')} className="self-start text-sm font-bold text-[color:var(--brand)] hover:underline sm:self-auto">Browse all tools →</button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {primaryTools.slice(0, 6).map((tool) => {
            const bookmarked = isBookmarked(tool.id);
            const copied = copiedId === tool.id;
            return (
              <article key={tool.id} onClick={() => onSelectTool(tool)} className="group cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--brand)]">{getIcon(tool.icon, 23)}</div>
                  <div className="flex items-center gap-1">
                    {tool.popular && <span className="rounded-md bg-[color:var(--brand)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)]">Popular</span>}
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(tool.id); }} className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)]" aria-label="Favorite calculator"><Star className={`h-4 w-4 ${bookmarked ? 'fill-current text-[color:var(--warning)]' : ''}`} /></button>
                    <button onClick={(e) => handleCardShare(e, tool)} className="rounded-lg p-2 text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)]" aria-label="Share calculator">{copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Share2 className="h-4 w-4" />}</button>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{tool.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--ink-muted)]">{tool.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]"><span>{tool.category}</span><span className="inline-flex items-center gap-1 text-[color:var(--brand)]">Open <ArrowRight className="h-3.5 w-3.5" /></span></div>
              </article>
            );
          })}
        </div>
      </section>

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
              <button key={card.title} onClick={() => target ? onSelectTool(target) : onSelectCategory(card.category)} className="group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-elevated)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0"><h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{card.title}</h3><p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{card.description}</p></div>
                <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-[color:var(--ink-muted)] group-hover:block group-hover:text-[color:var(--brand)]" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Explore by area</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Financial tool categories</h2>
        </div>
      </section>
    </div>
  );
};

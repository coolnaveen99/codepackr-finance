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
      {/* Hero - mirrors the established CodePackr landing-page hierarchy */}
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
              100% Client-Side Execution
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[color:var(--ink)] leading-[1.08] mb-5 max-w-4xl">
              Free Financial Calculators,<br />
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--brand)] to-[color:var(--accent)]">Smart Money Decisions.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[color:var(--ink-muted)] mb-8 max-w-3xl leading-relaxed">
              Calculate, compare and understand loans, investments, retirement, salary and personal finance with transparent assumptions and clear results.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById('popular-tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl font-bold text-white bg-[color:var(--brand)] hover:bg-[color:var(--brand-hover)] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                Explore Calculators <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSearch}
                className="px-6 py-3 rounded-xl font-bold border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink)] hover:border-[color:var(--brand)] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Search className="w-5 h-5" />
                Search Calculators ({typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K)
              </button>
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
              <button key={card.title} onClick={() => target ? onSelectTool(target) : onSelectCategory(card.category)} className="group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-elevated)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0"><h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{card.title}</h3><p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{card.description}</p></div>
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categoryCards.map(([title]) => (
            <button key={title} onClick={() => onSelectCategory('calculators')} className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-5 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-md">
              <div className="text-sm font-bold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{title}</div>
              <div className="mt-2 text-xs text-[color:var(--ink-muted)]">Explore tools →</div>
            </button>
          ))}
        </div>
      </section>

      {/* Signature Tools */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Signature</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Tools for bigger decisions</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {signaturePatterns.map((item) => {
            const target = findTool(...item.patterns);
            return (
              <button key={item.title} onClick={() => target ? onSelectTool(target) : onOpenSearch()} className="group rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:shadow-lg">
                <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-[color:var(--brand)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[color:var(--brand)]">Explore <ArrowRight className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Why */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Why CodePackr Finance?</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Designed for clarity before commitment.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Free to use', 'Core calculators are available without a mandatory account.'],
              ['Browser-first', 'Calculations are designed to run locally in your browser.'],
              ['Transparent', 'Assumptions and methodology are easier to inspect and understand.'],
              ['Export-ready', 'Turn important results into reports and reusable scenarios.'],
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
            {['Inputs', 'Formula', 'Result', 'Scenario', 'Export'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-bold text-white">{index + 1}</span>
                <span className="font-semibold text-[color:var(--ink)]">{step}</span>
                {index < 4 && <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--ink-muted)]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / methodology */}
      <section className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">Trust & methodology</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Understand what the numbers mean.</h2>
          <p className="mt-3 text-sm sm:text-base leading-7 text-[color:var(--ink-muted)]">Review calculation assumptions, methodology, sources and update context before using results for important financial decisions. Outputs are educational calculations based on the information and assumptions entered.</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Editorial methodology', 'Calculation methodology', 'Data sources', 'Last reviewed'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-4 text-sm font-semibold text-[color:var(--ink)]">
              <ShieldCheck className="h-5 w-5 text-[color:var(--success)]" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

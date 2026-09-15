import React, { useMemo, useState, useEffect } from 'react';
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
  Calculator,
  ChevronDown,
  Play,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { ToolDef, CategoryFilter } from '../types';
import { TOOLS, CATEGORIES } from '../data/tools';
import { getIcon } from '../lib/icons';
import { useBookmarks, shareToolUrl } from '../lib/bookmarks';
import { useToolGovernance } from '../lib/useToolGovernance';
import { useAdminAuth } from '../lib/useAdminAuth';
import { useCurrency } from '../lib/CurrencyContext';
import { HeroPreviewCards } from './HeroPreviewCards';

interface HomeDashboardProps {
  onSelectTool: (tool: ToolDef, initialPayload?: string) => void;
  onOpenSearch: () => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onGoTrustPage?: (page: 'about' | 'financial-disclaimer' | 'cookie-policy' | 'calculation-methodology' | 'editorial-policy') => void;
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
  { id: 'business-finance', title: 'Business Finance', desc: 'Valuation, DCF, WACC, burn rate & multiples', icon: BriefcaseBusiness },
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
  { id: 'business-finance', label: 'Business Finance' },
  { id: 'bookmarks', label: 'Favorites' },
];

interface CalculationStepDetail {
  step: number;
  name: string;
  tagline: string;
  details: string;
  formula?: string;
  guarantee: string;
  toolId: string;
  toolLabel: string;
}

const CALCULATION_STEPS: CalculationStepDetail[] = [
  {
    step: 1,
    name: 'Inputs',
    tagline: 'Parameter sanitization & boundary validation',
    details: 'User parameters (principal, APR, frequencies, cash flows) are validated in real-time. Edge cases like zero rates, negative tenures, and invalid characters are sanitized before mathematical execution.',
    guarantee: 'Zero Server Telemetry: Raw numbers exist strictly in your browser memory.',
    toolId: 'loan-calculator',
    toolLabel: 'Test in Loan Calculator',
  },
  {
    step: 2,
    name: 'Formula Engine',
    tagline: 'Deterministic mathematical execution',
    details: 'Pure TypeScript engines compute results using standard financial mathematics (amortization, compound interest, DCF, IRR root-finding) without floating-point drift or external libraries.',
    formula: 'EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]',
    guarantee: 'Standardized Vectors: Audited against statutory financial standards and banking benchmarks.',
    toolId: 'sip-calculator',
    toolLabel: 'Test in SIP Calculator',
  },
  {
    step: 3,
    name: 'Calculated Output',
    tagline: 'Instantaneous metrics & chart visualization',
    details: 'Outputs update on every keystroke. The engine delivers primary KPIs (monthly payment, total interest, break-even years, tax impact) with dynamic currency formatting.',
    formula: 'Total Interest = (EMI × n) - Principal',
    guarantee: 'Global Currency Context: Dynamic symbol and thousands separators for 30+ currencies.',
    toolId: 'compound-interest-calculator',
    toolLabel: 'Test in Compound Interest',
  },
  {
    step: 4,
    name: 'Amortization & Schedules',
    tagline: 'Month-by-month & year-by-year payment schedules',
    details: 'Generates up to 360+ rows of detailed repayment schedules showing opening balance, principal repayment, interest cost, and closing balance, including prepayment reduction simulations.',
    formula: 'Monthly Interest_t = Balance_{t-1} × (r / 12)',
    guarantee: 'Client-Side Speed: Zero-latency generation of complete amortizations without loading spinners.',
    toolId: 'mortgage-calculator',
    toolLabel: 'Test in Mortgage Calculator',
  },
  {
    step: 5,
    name: 'Local Summary',
    tagline: 'Private exports, clipboard copy, & saved favorites',
    details: 'Export results to formatted CSV tables, copy key takeaways directly to clipboard, bookmark calculations locally, or generate shareable permalinks without user tracking.',
    guarantee: 'Privacy Guaranteed: Bookmarks and preferences stay in your device localStorage.',
    toolId: 'net-worth-calculator',
    toolLabel: 'Test in Net Worth Calculator',
  },
];

const SIMULATION_STAGES = [
  {
    step: 1,
    title: 'Validating Inputs',
    data: 'Principal: $100,000 | Rate: 7.50% APR | Tenure: 30 Years (360 months)',
    note: 'Sanitized 3 parameters, checked boundaries, and set compounding interval.',
  },
  {
    step: 2,
    title: 'Solving Formula Engine',
    data: 'Monthly rate r = 0.075 / 12 = 0.00625 | Compounding factor (1+r)³⁶⁰ = 9.4215',
    note: 'Pure TypeScript formula computed deterministic annuity in < 1ms.',
  },
  {
    step: 3,
    title: 'Generating Calculated Output',
    data: 'Monthly EMI: $699.21 | Total Interest: $151,717 | Total Repaid: $251,717',
    note: 'Real-time KPI metrics formatted dynamically in current currency.',
  },
  {
    step: 4,
    title: 'Building Amortization Schedule',
    data: 'Compiled 360 monthly entries (Year 1: Principal $838, Interest $7,472)',
    note: 'Prepayment models and annual amortization summaries ready for inspection.',
  },
  {
    step: 5,
    title: 'Finalizing Local Summary',
    data: 'Structured CSV ready for download | Zero external network packets sent',
    note: 'Complete calculation state stored locally in browser session.',
  },
];

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
  onGoTrustPage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [sublineIndex, setSublineIndex] = useState(0);
  const [retirementProgress, setRetirementProgress] = useState(0);
  const { isBookmarked, toggleBookmark, bookmarks } = useBookmarks();
  const { isToolVisible } = useToolGovernance();
  const { isAuthenticated } = useAdminAuth();
  const { currency, formatAmount } = useCurrency();

  // Dynamic preview numbers adapted to active currency
  const previewData = useMemo(() => {
    if (currency.code === 'INR') {
      return {
        loanSub: '₹50,00,000 @ 8.5% · 20y',
        loanEmi: '₹43,391/mo',
        principalBar: '58%',
        interestBar: '42%',
        sipSub: '₹10,000/mo · 15y @ 12%',
        sipGain: '+₹32.46 L Gain',
        sipCorpus: '₹50.46 Lakh',
        retSub: '₹2.4 Cr of ₹3.0 Cr Goal Funded',
      };
    }
    return {
      loanSub: `${currency.symbol}400,000 @ 6.5% · 30y`,
      loanEmi: `${currency.symbol}2,528/mo`,
      principalBar: '68%',
      interestBar: '32%',
      sipSub: `${currency.symbol}500/mo · 15y @ 12%`,
      sipGain: `+${currency.symbol}184,200 Gain`,
      sipCorpus: `${currency.symbol}274,200`,
      retSub: `${currency.symbol}1.18M of ${currency.symbol}1.5M Goal Funded`,
    };
  }, [currency.code, currency.symbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSublineIndex((prev) => (prev + 1) % ROTATING_SUBLINES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Entrance count-up animation for Retirement Goal Progress
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1400;
    const target = 78;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRetirementProgress(Math.round(easeOut * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    const countTimer = setTimeout(() => {
      frameId = requestAnimationFrame(step);
    }, 250);

    return () => {
      clearTimeout(countTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

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

  // Quick numeric extraction from local search query
  const numericMatch = useMemo(() => {
    const cleaned = searchQuery.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 ? num : null;
  }, [searchQuery]);

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
      {/* Hero Section – Warm, Emotional First Impression with Growth Shapes & Glassmorphic Floating Previews */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[color:var(--surface)] via-emerald-500/[0.04] to-teal-500/[0.07] dark:from-[color:var(--surface)] dark:via-emerald-950/20 dark:to-teal-950/25 shadow-lg shadow-emerald-500/[0.03]">
        {/* Soft top gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        
        {/* Floating growth background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Gentle growth curves SVG */}
          <svg className="absolute -right-12 top-0 w-[580px] h-full text-emerald-500/10 dark:text-emerald-400/[0.07]" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 380C120 360 220 280 320 180C420 80 480 20 500 0" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
            <path d="M50 400C160 370 260 270 370 150C440 70 490 10 500 0" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="320" cy="180" r="6" fill="currentColor" />
            <circle cx="420" cy="80" r="5" fill="currentColor" />
          </svg>
          {/* Ambient soft glowing radial orbs */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Emotion, Headlines & CTAs */}
            <div className="col-span-1 lg:col-span-7 w-full max-w-2xl">
              {/* Privacy Badge with gentle pulse */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 mb-6 shadow-xs backdrop-blur-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>100% Client-Side Execution · Privacy Guaranteed</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black tracking-tight text-[color:var(--ink)] leading-[1.12] mb-5">
                Free Financial Calculators,<br />
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400">Smart Money Decisions.</span>
              </h1>

              {/* Dynamic Rotating Sub-line */}
              <div className="h-8 flex items-center gap-2 text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span key={sublineIndex} className="animate-fade-in-up inline-block">
                  {ROTATING_SUBLINES[sublineIndex]}
                </span>
              </div>

              <p className="text-base sm:text-lg text-[color:var(--ink-muted)] mb-8 leading-relaxed max-w-xl">
                Calculate, compare, and forecast loans, investments, retirement, salary, and personal finance with transparent assumptions, interactive schedules, and zero tracking.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToToolGrid}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer inline-flex items-center justify-center gap-2 group"
                >
                  Explore All Calculators 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:border-emerald-500/70 hover:bg-emerald-500/5 hover:scale-[1.01] transition-all duration-200 ease-out flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Search Calculators</span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--ink-muted)]">
                    {typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'} K
                  </kbd>
                </button>
              </div>
            </div>

            {/* Right Column: Desktop Floating Glassmorphic Preview Cards (Rotating Pool, configurable 2 or 3 slots) */}
            <HeroPreviewCards onSelectTool={onSelectTool} visibleSlots={3} />

          </div>
        </div>
      </section>

      {/* Most Popular Calculators Section – Card Magic with Staggered Entrance & Shimmer */}
      <section id="popular-tools" className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Most Popular</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">Start with a premier calculator</h2>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">High-value tools for the essential financial decisions people make most often.</p>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryTabClick('all')}
            className="self-start text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline sm:self-auto cursor-pointer flex items-center gap-1 group"
          >
            Browse all {visibleTools.length} tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.slice(0, 6).map((tool, idx) => {
            const bookmarked = isBookmarked(tool.id);
            const copied = copiedId === tool.id;
            return (
              <article
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="animate-fade-in-up group cursor-pointer rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 transition-all duration-[220ms] ease-out hover:-translate-y-2.5 hover:scale-[1.018] hover:border-emerald-500/75 dark:hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-500/20 dark:hover:shadow-emerald-950/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-[220ms] ease-out">
                    {getIcon(tool.icon, 23)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tool.popular && (
                      <span className="animate-badge-shimmer rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/30 to-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 shadow-xs">
                        Popular
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(tool.id);
                      }}
                      className="rounded-lg p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-amber-500 hover:scale-115 active:scale-125 transition-all cursor-pointer"
                      aria-label="Favorite calculator"
                    >
                      <Star className={`h-4 w-4 transition-transform active:scale-125 duration-150 ${bookmarked ? 'fill-amber-400 text-amber-400 scale-105' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleCardShare(e, tool)}
                      className="rounded-lg p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center text-[color:var(--ink-muted)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--ink)] hover:scale-115 active:scale-110 transition-all cursor-pointer"
                      aria-label="Share calculator"
                    >
                      {copied ? <Check className="h-4 w-4 text-[color:var(--success)]" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-[color:var(--ink)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-[220ms]">
                  {tool.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--ink-muted)]">
                  {tool.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-muted)]">
                  <span className="capitalize">{tool.category.replace('-', ' ')}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    Calculate Now <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-[220ms] ease-out" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Goal-Oriented Planning Section – Hover Lift + Left Border Accent */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Goal-Oriented Planning</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[color:var(--ink)] sm:text-3xl">What are you planning today?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-muted)]">
            Choose the financial milestone or question you want answered. Each goal links directly to its dedicated calculator.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {planningCards.map((card, idx) => {
            const Icon = card.icon;
            const target = visibleTools.find((t) => t.id === card.toolId);
            return (
              <button
                key={card.title}
                type="button"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => {
                  if (target) {
                    onSelectTool(target);
                  } else {
                    handleCategoryTabClick(card.category);
                  }
                }}
                className="animate-fade-in-up group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] border-l-4 border-l-transparent hover:border-l-emerald-500 bg-[color:var(--surface)] p-5 text-left transition-all duration-[220ms] ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-lg hover:border-[color:var(--border-hover)] cursor-pointer"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-600 transition-all duration-[220ms] ease-out">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-[color:var(--ink)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-[220ms]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">
                    {card.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    Launch Plan <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-[220ms] ease-out" />
                  </span>
                </div>
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
                : CATEGORY_TABS.find((t) => t.id === selectedCategory)?.label ||
                  CATEGORIES.find((t) => t.id === selectedCategory)?.label ||
                  'Calculators'}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'calculator' : 'calculators'}
              {selectedCategory !== 'all' && selectedCategory !== 'bookmarks'
                ? ` in ${CATEGORY_TABS.find((t) => t.id === selectedCategory)?.label || CATEGORIES.find((t) => t.id === selectedCategory)?.label || selectedCategory}`
                : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}.
            </p>
          </div>

          {/* Quick in-page search */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                placeholder="Filter calculators (e.g., loan, 50000)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] placeholder:text-[color:var(--ink-muted)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 shadow-xs transition-all"
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

            {/* Smart Numeric Detection Pill for Directory Search */}
            {numericMatch && (
              <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-1.5 text-xs animate-fade-in">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] truncate">
                  {formatAmount(numericMatch)}
                </span>
                <div className="flex items-center gap-1 shrink-0 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      const sip = visibleTools.find((t) => t.id === 'sip-calculator');
                      if (sip) onSelectTool(sip);
                    }}
                    className="px-1.5 py-0.5 rounded font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    SIP →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const loan = visibleTools.find((t) => t.id === 'loan-calculator');
                      if (loan) onSelectTool(loan);
                    }}
                    className="px-1.5 py-0.5 rounded font-bold bg-[color:var(--surface)] border border-emerald-500/30 text-[color:var(--ink)] hover:border-emerald-500 cursor-pointer"
                  >
                    EMI →
                  </button>
                </div>
              </div>
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
                    <span>{CATEGORIES.find((c) => c.id === tool.category)?.label || tool.category.replace('-', ' ')}</span>
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
        <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-7 sm:p-9 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                HOW CALCULATIONS WORK
              </p>
              <button
                type="button"
                onClick={() => {
                  if (isSimulating) {
                    setIsSimulating(false);
                  } else {
                    setIsSimulating(true);
                    setSimulationIndex(0);
                    setActiveStepIndex(null);
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15 hover:border-red-500/50 transition-all cursor-pointer shadow-xs"
                title="Run live demonstration of the 5 calculation stages"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-600 dark:text-red-400 font-bold">{isSimulating ? 'Exit Demo' : 'Live Demo'}</span>
              </button>
            </div>
            <h3 className="mt-1 text-xl font-extrabold text-[color:var(--ink)]">
              5-Stage Client-Side Pipeline
            </h3>
            <p className="mt-1 text-xs leading-5 text-[color:var(--ink-muted)]">
              Every financial computation is deterministic, inspectable, and executed 100% locally in your browser. Click any stage below to inspect its formulas.
            </p>

            {/* Interactive Live Pipeline Simulation Runner */}
            {isSimulating && (
              <div className="mt-4 p-4 rounded-2xl border border-[color:var(--brand)]/30 bg-[color:var(--brand)]/5 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-[color:var(--brand)] uppercase tracking-wider">
                    Stage {simulationIndex + 1} of 5: {SIMULATION_STAGES[simulationIndex].title}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                    Active Flow
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-xs font-mono text-[color:var(--ink)]">
                  {SIMULATION_STAGES[simulationIndex].data}
                </div>
                <p className="text-xs text-[color:var(--ink-muted)]">
                  {SIMULATION_STAGES[simulationIndex].note}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1.5">
                    {SIMULATION_STAGES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSimulationIndex(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          simulationIndex === i
                            ? 'w-6 bg-[color:var(--brand)]'
                            : 'w-2 bg-[color:var(--border)] hover:bg-[color:var(--ink-muted)]'
                        }`}
                        aria-label={`Jump to stage ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {simulationIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => setSimulationIndex((prev) => prev - 1)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] hover:bg-[color:var(--surface-elevated)] cursor-pointer"
                      >
                        Previous
                      </button>
                    )}
                    {simulationIndex < SIMULATION_STAGES.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setSimulationIndex((prev) => prev + 1)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-hover)] cursor-pointer flex items-center gap-1"
                      >
                        Next Stage <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const target = visibleTools.find((t) => t.id === 'loan-calculator');
                          if (target) onSelectTool(target);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[color:var(--success)] text-white hover:opacity-90 cursor-pointer flex items-center gap-1"
                      >
                        Try Real Calculator <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5 Stages List Matching the Exact Visual Mockup */}
            <div className="mt-4 space-y-2.5">
              {CALCULATION_STEPS.map((stepItem, index) => {
                const isExpanded = activeStepIndex === index;
                const isSimActive = isSimulating && simulationIndex === index;
                return (
                  <div
                    key={stepItem.name}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded || isSimActive
                        ? 'border-[color:var(--brand)] bg-[color:var(--surface)] shadow-sm'
                        : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)] hover:border-[color:var(--brand)]/60 hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsSimulating(false);
                        setActiveStepIndex(isExpanded ? null : index);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer group transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold font-mono transition-transform group-hover:scale-105 shrink-0 ${
                            isExpanded || isSimActive
                              ? 'bg-[color:var(--brand)] text-white ring-2 ring-[color:var(--brand)]/20'
                              : 'bg-[color:var(--brand)] text-white'
                          }`}
                        >
                          {stepItem.step}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-[color:var(--ink)] text-sm sm:text-base group-hover:text-[color:var(--brand)] transition-colors block">
                            {stepItem.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <ArrowRight
                          className={`h-4 w-4 transition-all duration-200 ${
                            isExpanded
                              ? 'rotate-90 text-[color:var(--brand)]'
                              : 'text-[color:var(--ink-muted)] group-hover:text-[color:var(--brand)] group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-[color:var(--border)] space-y-3 text-xs sm:text-sm animate-fade-in">
                        <p className="text-[color:var(--ink-muted)] leading-relaxed">
                          {stepItem.details}
                        </p>

                        {stepItem.formula && (
                          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-2.5 font-mono text-xs text-[color:var(--ink)] flex items-center justify-between gap-2 overflow-x-auto">
                            <span className="font-semibold text-[color:var(--brand)] shrink-0">Formula:</span>
                            <code className="text-[color:var(--ink)]">{stepItem.formula}</code>
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-xs text-[color:var(--ink-muted)]">
                          <ShieldCheck className="w-4 h-4 text-[color:var(--success)] shrink-0 mt-0.5" />
                          <span>{stepItem.guarantee}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const tool = visibleTools.find((t) => t.id === stepItem.toolId);
                              if (tool) onSelectTool(tool);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--brand)]/10 text-[color:var(--brand)] hover:bg-[color:var(--brand)] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            {stepItem.toolLabel}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Navigation Link */}
          <div className="mt-5 pt-4 border-t border-[color:var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                if (onGoTrustPage) {
                  onGoTrustPage('calculation-methodology');
                } else {
                  window.location.href = '/calculation-methodology';
                }
              }}
              className="font-bold text-[color:var(--brand)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Inspect full Calculation Methodology <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[color:var(--ink-muted)]">
              Audited Deterministic Formulas
            </span>
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

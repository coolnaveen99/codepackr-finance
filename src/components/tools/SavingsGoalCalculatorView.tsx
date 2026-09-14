import React, { useState, useMemo, useEffect } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { CurrencySelector } from '../CurrencySelector';
import {
  projectSavingsGoal,
  SAVINGS_VEHICLES,
  OptionPlanResult,
  SavingsVehicleOption,
} from '../../lib/financial/savingsGoalProjector';
import {
  Target,
  RotateCcw,
  Copy,
  Check,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  AlertTriangle,
  Sliders,
  PiggyBank,
  Landmark,
  ShieldCheck,
  Scale,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface SavingsGoalCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const PRESET_GOALS = [
  { label: 'Emergency Fund', goal: 100000, months: 6, icon: ShieldCheck },
  { label: 'Vacation Trip', goal: 75000, months: 4, icon: Sparkles },
  { label: 'Gadget / Tech', goal: 150000, months: 8, icon: Layers },
  { label: 'Home Down Payment', goal: 500000, months: 24, icon: Landmark },
];

const TAX_SLABS = [
  { label: '0% (Nil / Exemption)', value: 0 },
  { label: '5% (Entry Slab)', value: 5 },
  { label: '10% (Mid Slab)', value: 10 },
  { label: '15% (New Regime)', value: 15 },
  { label: '20% (Standard Slab)', value: 20 },
  { label: '30% (Highest Slab)', value: 30 },
];

export const SavingsGoalCalculatorView: React.FC<SavingsGoalCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currency } = useCurrency();

  // State initialized with defaults: ₹1,00,000 goal in 6 months with ₹0 saved
  const [targetGoalStr, setTargetGoalStr] = useState<string>('100000');
  const [timeHorizonMonthsStr, setTimeHorizonMonthsStr] = useState<string>('6');
  const [alreadySavedStr, setAlreadySavedStr] = useState<string>('0');
  const [monthlyCapacityStr, setMonthlyCapacityStr] = useState<string>('');
  
  // Advanced Settings State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [showPostTax, setShowPostTax] = useState<boolean>(false);
  const [taxSlabPercent, setTaxSlabPercent] = useState<number>(30);
  const [customRates, setCustomRates] = useState<Record<string, number>>({});
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  // Active Selected Plan for deep-dive schedule & visualization
  const [selectedPlanId, setSelectedPlanId] = useState<string>('recurring-deposit');
  const [showScheduleTable, setShowScheduleTable] = useState<boolean>(false);

  // Feedback states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Target Date computation & sync
  const targetDateFormatted = useMemo(() => {
    const months = Math.max(1, parseInt(timeHorizonMonthsStr, 10) || 6);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [timeHorizonMonthsStr]);

  // Read URL query parameters on initial mount for shareable deep-links
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qGoal = params.get('goal');
    const qMonths = params.get('months');
    const qSaved = params.get('saved');
    const qCapacity = params.get('capacity');
    const qTax = params.get('tax');
    const qPostTax = params.get('postTax');
    const qPlan = params.get('plan');

    if (qGoal && !isNaN(Number(qGoal))) setTargetGoalStr(qGoal);
    if (qMonths && !isNaN(Number(qMonths))) setTimeHorizonMonthsStr(qMonths);
    if (qSaved && !isNaN(Number(qSaved))) setAlreadySavedStr(qSaved);
    if (qCapacity && !isNaN(Number(qCapacity))) setMonthlyCapacityStr(qCapacity);
    if (qTax && !isNaN(Number(qTax))) setTaxSlabPercent(Number(qTax));
    if (qPostTax === 'true') {
      setShowPostTax(true);
      setIsAdvancedOpen(true);
    }
    if (qPlan && SAVINGS_VEHICLES.some(v => v.id === qPlan)) {
      setSelectedPlanId(qPlan);
    }
  }, []);

  // Numeric sanitization
  const handleCleanInput = (raw: string, setter: (v: string) => void) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    setter(cleaned);
  };

  const targetGoal = Math.max(1, parseFloat(targetGoalStr) || 0);
  const timeHorizonMonths = Math.max(1, parseInt(timeHorizonMonthsStr, 10) || 1);
  const alreadySaved = Math.max(0, parseFloat(alreadySavedStr) || 0);
  const monthlyCapacity = monthlyCapacityStr.trim() !== '' && !isNaN(parseFloat(monthlyCapacityStr))
    ? parseFloat(monthlyCapacityStr)
    : undefined;

  // Run calculation engine
  const projectionOutput = useMemo(() => {
    return projectSavingsGoal({
      targetGoalAmount: targetGoal,
      timeHorizonMonths,
      alreadySaved,
      monthlyCapacity,
      showPostTax,
      taxSlabPercent,
      customRates,
    });
  }, [targetGoal, timeHorizonMonths, alreadySaved, monthlyCapacity, showPostTax, taxSlabPercent, customRates]);

  const activePlan = useMemo(() => {
    return (
      projectionOutput.plans.find((p) => p.vehicle.id === selectedPlanId) ||
      projectionOutput.plans[0]
    );
  }, [projectionOutput.plans, selectedPlanId]);

  // Date picker handler: user selects target month
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [selYear, selMonth] = e.target.value.split('-').map(Number);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1; // 1-indexed

    const diffMonths = (selYear - curYear) * 12 + (selMonth - curMonth);
    if (diffMonths >= 1) {
      setTimeHorizonMonthsStr(diffMonths.toString());
    }
  };

  // Reset to initial defaults
  const handleReset = () => {
    setTargetGoalStr('100000');
    setTimeHorizonMonthsStr('6');
    setAlreadySavedStr('0');
    setMonthlyCapacityStr('');
    setShowPostTax(false);
    setTaxSlabPercent(30);
    setCustomRates({});
    setSelectedPlanId('recurring-deposit');
  };

  // Deep Link sharing
  const handleShareLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('goal', targetGoalStr);
    url.searchParams.set('months', timeHorizonMonthsStr);
    url.searchParams.set('saved', alreadySavedStr);
    if (monthlyCapacityStr) url.searchParams.set('capacity', monthlyCapacityStr);
    else url.searchParams.delete('capacity');
    url.searchParams.set('tax', taxSlabPercent.toString());
    url.searchParams.set('postTax', showPostTax.toString());
    url.searchParams.set('plan', selectedPlanId);

    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Plan Summary
  const handleCopySummary = () => {
    const summaryLines = [
      `🎯 Savings Goal Plan: ${formatAmount(targetGoal)} in ${timeHorizonMonths} months (by ${targetDateFormatted})`,
      `💰 Starting Seed Saved: ${formatAmount(alreadySaved)}`,
      showPostTax
        ? `⚖️ Mode: Post-Tax Net Returns (${taxSlabPercent}% Tax Bracket)`
        : `⚖️ Mode: Pre-Tax Gross Returns`,
      '',
      '📊 Comparison Across Options (Required Monthly Deposit):',
      ...projectionOutput.plans.map(
        (p) =>
          `• ${p.vehicle.name} (${p.effectiveAnnualRate}% p.a.): ${formatAmount(p.requiredMonthlyPMT)}/mo · Interest Earned: ${formatAmount(p.interestEarned)}`
      ),
      '',
      `🏆 Selected Plan: ${activePlan.vehicle.name}`,
      `   Required Monthly Investment: ${formatAmount(activePlan.requiredMonthlyPMT)}/mo`,
      `   Total You Contribute: ${formatAmount(activePlan.totalContributedIncludingSeed)}`,
      `   Gains / Interest Earned: ${formatAmount(activePlan.interestEarned)} (${activePlan.interestSharePercent}% of goal)`,
      monthlyCapacity !== undefined
        ? `   Your Monthly Capacity: ${formatAmount(monthlyCapacity)}/mo (${activePlan.capacityAnalysis?.statusLabel})`
        : '',
      '',
      'Generated 100% client-side via CodePackr Finance (https://finance.codepackr.com/savings-goal-calculator)',
    ].filter(Boolean);

    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Download Amortization Schedule CSV
  const handleDownloadCsv = () => {
    const headers = [
      'Month',
      'Opening Balance',
      'Monthly Deposit',
      'Interest Earned',
      'Cumulative Interest',
      'Closing Balance',
      'Percent Of Goal',
    ];
    const rows = activePlan.schedule.map((r) => [
      `Month ${r.month}`,
      r.openingBalance,
      r.deposit,
      r.interestEarned,
      r.cumulativeInterest,
      r.closingBalance,
      `${r.percentOfGoal}%`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `savings-goal-${activePlan.vehicle.id}-${timeHorizonMonths}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="savings-goal-projector-view" className="w-full max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header & Breadcrumb */}
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Top Action Bar & Currency Selector Toolbar */}
      <div
        id="savings-action-bar"
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Active Currency:
          </span>
          <span className="text-xs font-mono font-bold text-[var(--brand)] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20">
            <span>{currency.flag}</span>
            <span>{currency.code} ({currency.symbol.trim()})</span>
            <span className="text-[10px] text-[var(--muted)] font-normal hidden sm:inline">— {currency.name}</span>
          </span>
          <CurrencySelector idPrefix="savings-goal-currency" variant="pill" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="savings-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border hover:bg-[var(--surface-2)] transition cursor-pointer"
            style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            id="savings-copy-summary-btn"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border hover:bg-[var(--surface-2)] transition cursor-pointer"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--brand)]" />}
            <span>{copiedSummary ? 'Summary Copied' : 'Copy Summary'}</span>
          </button>
          <button
            type="button"
            id="savings-share-link-btn"
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border hover:bg-[var(--surface-2)] transition cursor-pointer"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-blue-500" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Deep-Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Sticky Inputs & Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: Sticky Input Panel                                     */}
        {/* =================================================================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-5">
          <div
            id="savings-input-card"
            className="p-6 rounded-2xl border shadow-md space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--brand)]/10 text-[var(--brand)]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                    Goal Parameters
                  </h2>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    Reverse Annuity PMT Engine
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                100% Private
              </span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-semibold block mb-1.5 uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Sample Milestone Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_GOALS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTargetGoalStr(preset.goal.toString());
                      setTimeHorizonMonthsStr(preset.months.toString());
                    }}
                    className="flex items-center gap-1.5 p-2 rounded-xl text-left border text-xs font-medium hover:border-[var(--brand)] hover:bg-[var(--surface-2)] transition cursor-pointer"
                    style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}
                  >
                    <preset.icon className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                    <div className="truncate">
                      <div className="font-bold truncate text-[11px]" style={{ color: 'var(--ink)' }}>
                        {preset.label}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {formatAmount(preset.goal, 0)} · {preset.months}m
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-target-goal" className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                  TARGET AMOUNT ({currency.symbol.trim()})
                </label>
                <span className="text-[11px] font-bold text-[var(--brand)] font-mono">
                  {formatAmount(targetGoal, 0)}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-target-goal"
                  type="text"
                  inputMode="decimal"
                  value={targetGoalStr}
                  onChange={(e) => handleCleanInput(e.target.value, setTargetGoalStr)}
                  placeholder="e.g. 100000"
                  className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-base font-bold outline-none focus:ring-2 focus:ring-[var(--brand)] transition"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTargetGoalStr(amt.toString())}
                    className="px-2 py-0.5 text-[10px] font-mono rounded-md border hover:border-[var(--brand)] transition cursor-pointer"
                    style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                  >
                    +{formatAmount(amt, 0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Horizon (Months + Date Picker) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-time-horizon" className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                  TIME HORIZON (MONTHS)
                </label>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 font-mono">
                  Target: {targetDateFormatted}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    id="input-time-horizon"
                    type="text"
                    inputMode="numeric"
                    value={timeHorizonMonthsStr}
                    onChange={(e) => handleCleanInput(e.target.value, setTimeHorizonMonthsStr)}
                    placeholder="e.g. 6"
                    className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--brand)] transition"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>
                <div>
                  <input
                    id="input-target-date"
                    type="month"
                    onChange={handleDateChange}
                    title="Or pick target month directly"
                    className="w-full px-2.5 py-2.5 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-[var(--brand)] transition cursor-pointer"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>
              </div>

              {/* Quick Month Pills */}
              <div className="flex items-center gap-1.5 mt-2">
                {[3, 6, 9, 12, 18, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimeHorizonMonthsStr(m.toString())}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                      timeHorizonMonths === m
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                        : 'hover:border-[var(--brand)]'
                    }`}
                    style={
                      timeHorizonMonths !== m
                        ? { borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }
                        : {}
                    }
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Already Saved (Seed Capital) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-already-saved" className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                  ALREADY SAVED ({currency.symbol.trim()})
                </label>
                <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                  {alreadySaved > 0 ? formatAmount(alreadySaved, 0) : 'Starting from ₹0'}
                </span>
              </div>
              <input
                id="input-already-saved"
                type="text"
                inputMode="decimal"
                value={alreadySavedStr}
                onChange={(e) => handleCleanInput(e.target.value, setAlreadySavedStr)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] transition"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            {/* Monthly Capacity (Optional Feasibility Mode) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-monthly-capacity" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                  <span>MONTHLY CAPACITY ({currency.symbol.trim()})</span>
                  <span className="text-[10px] font-normal italic">(Optional)</span>
                </label>
                {monthlyCapacity !== undefined && (
                  <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 font-mono">
                    {formatAmount(monthlyCapacity, 0)}/mo
                  </span>
                )}
              </div>
              <input
                id="input-monthly-capacity"
                type="text"
                inputMode="decimal"
                value={monthlyCapacityStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlyCapacityStr)}
                placeholder="What can you actually save per month?"
                className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] transition"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Enables feasibility color coding &amp; shortfall modeling.
              </span>
            </div>

            {/* Advanced Collapsible Section: Tax Slabs & Post-Tax Returns */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <button
                type="button"
                id="savings-toggle-advanced-btn"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-left cursor-pointer"
                style={{ color: 'var(--ink)' }}
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span>Taxation &amp; Post-Tax Returns</span>
                  {showPostTax && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Active ({taxSlabPercent}%)
                    </span>
                  )}
                </div>
                {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isAdvancedOpen && (
                <div className="mt-3 p-3.5 rounded-xl border space-y-3.5 text-xs animate-fade-in" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}>
                  {/* Post-Tax Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold block" style={{ color: 'var(--ink)' }}>
                        Show Post-Tax Returns
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        Models in-hand yield after income tax
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="toggle-post-tax-checkbox"
                        checked={showPostTax}
                        onChange={(e) => setShowPostTax(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand)]" />
                    </label>
                  </div>

                  {/* Expected Tax Slab Selection */}
                  <div>
                    <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                      YOUR INCOME TAX SLAB
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {TAX_SLABS.map((slab) => (
                        <button
                          key={slab.value}
                          type="button"
                          onClick={() => setTaxSlabPercent(slab.value)}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            taxSlabPercent === slab.value
                              ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                              : 'hover:border-[var(--brand)]'
                          }`}
                          style={
                            taxSlabPercent !== slab.value
                              ? { borderColor: 'var(--line)', backgroundColor: 'var(--surface)', color: 'var(--muted)' }
                              : {}
                          }
                        >
                          {slab.value}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arbitrage Fund Tax Insight */}
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 text-[11px] space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      Arbitrage Fund Equity Tax Advantage:
                    </span>
                    <p className="leading-relaxed">
                      Unlike Bank FDs and Debt Funds which are taxed at your full {taxSlabPercent}% slab, Arbitrage Funds enjoy Equity taxation (flat 20% STCG under 1 year). For 30% slab earners, Arbitrage delivers significantly higher net in-hand returns!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              id="savings-calculate-btn"
              onClick={() => {
                const el = document.getElementById('comparison-cards-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Calculate &amp; Compare Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Results, 6 Comparison Cards & Deep-Dive Views        */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Results Title & Subtitle Banner */}
          <div
            id="savings-results-banner"
            className="p-6 rounded-3xl border shadow-md relative overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                  Savings Goal Projector
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--ink)' }}>
                  Your Path to <span className="text-[var(--brand)]">{formatAmount(targetGoal, 0)}</span> in {timeHorizonMonths} {timeHorizonMonths === 1 ? 'Month' : 'Months'}
                </h1>
                <p className="text-xs sm:text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
                  Based on {formatAmount(alreadySaved, 0)} already saved · Target finish by{' '}
                  <strong style={{ color: 'var(--ink)' }}>{targetDateFormatted}</strong> · All calculations run 100% in your browser
                </p>
              </div>

              {/* Quick Mode Indicator Pill */}
              <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: showPostTax ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                    borderColor: showPostTax ? 'rgba(16, 185, 129, 0.3)' : 'rgba(2, 132, 199, 0.3)',
                    color: showPostTax ? '#059669' : '#0284c7',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showPostTax ? '#059669' : '#0284c7' }} />
                  {showPostTax ? `Post-Tax Mode (${taxSlabPercent}% Slab)` : 'Pre-Tax Gross Returns'}
                </span>
                {monthlyCapacity !== undefined && (
                  <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                    Capacity: {formatAmount(monthlyCapacity, 0)}/mo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 6 SIDE-BY-SIDE COMPARISON CARDS                                  */}
          {/* ================================================================ */}
          <section id="comparison-cards-section" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                  Compare 6 Savings &amp; Investment Vehicles
                </h2>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Side-by-side required monthly contributions, returns, liquidity &amp; risk profiles
                </p>
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Click “Use this plan” to inspect month-by-month cashflows
              </span>
            </div>

            {/* Grid of 6 Cards (Responsive: 1 col on mobile, 2 col on tablet, 3 col on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projectionOutput.plans.map((plan) => {
                const isSelected = plan.vehicle.id === selectedPlanId;
                const isEditingRate = editingRateId === plan.vehicle.id;

                // Feasibility status badge
                const cap = plan.capacityAnalysis;
                const statusTheme = cap
                  ? cap.status === 'comfortable'
                    ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 }
                    : cap.status === 'tight'
                    ? { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-700 dark:text-amber-300', icon: AlertTriangle }
                    : { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-700 dark:text-rose-300', icon: AlertTriangle }
                  : null;

                return (
                  <article
                    key={plan.vehicle.id}
                    id={`plan-card-${plan.vehicle.id}`}
                    onClick={() => setSelectedPlanId(plan.vehicle.id)}
                    className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-[var(--brand)] shadow-lg scale-[1.01]'
                        : 'hover:shadow-md hover:border-[var(--brand)]/50'
                    }`}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: isSelected ? 'var(--brand)' : 'var(--line)',
                    }}
                  >
                    {/* Top Badges: Option Title + Risk & Liquidity Pills */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
                            {plan.vehicle.name}
                          </h3>
                          <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                            {plan.vehicle.idealHorizon}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--brand)] text-white shadow-xs">
                            Active Plan
                          </span>
                        )}
                      </div>

                      {/* Risk & Liquidity Tag Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                        <span className={`px-2 py-0.5 rounded-md border ${plan.vehicle.riskBadgeColor}`}>
                          {plan.vehicle.riskLabel}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border ${plan.vehicle.liquidityBadgeColor}`}>
                          {plan.vehicle.liquidityLabel}
                        </span>
                      </div>

                      {/* Assumed Return Rate Header (Editable) */}
                      <div
                        className="p-2.5 rounded-xl border flex items-center justify-between"
                        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--muted)' }}>
                            Assumed Return
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="font-mono text-sm font-extrabold text-[var(--brand)]">
                              {plan.annualRatePreTax}% p.a.
                            </span>
                            {showPostTax && (
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                → {plan.effectiveAnnualRate}% net
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Inline Return Rate Customizer */}
                        {isEditingRate ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="30"
                              value={customRates[plan.vehicle.id] ?? plan.vehicle.defaultAnnualRate}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  setCustomRates((prev) => ({ ...prev, [plan.vehicle.id]: val }));
                                }
                              }}
                              className="w-14 px-1.5 py-1 text-xs font-mono font-bold rounded-md border text-center outline-none"
                              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--brand)', color: 'var(--ink)' }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRateId(null);
                              }}
                              className="p-1 rounded-md bg-[var(--brand)] text-white text-[10px] font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRateId(plan.vehicle.id);
                            }}
                            className="text-[10px] font-semibold text-[var(--muted)] hover:text-[var(--brand)] underline cursor-pointer"
                          >
                            Edit %
                          </button>
                        )}
                      </div>

                      {/* BIG NUMBER: Required Monthly Investment */}
                      <div className="pt-2 pb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                          Required Monthly Investment
                        </span>
                        <div className="text-3xl font-black font-mono tracking-tight mt-0.5" style={{ color: 'var(--ink)' }}>
                          {formatAmount(plan.requiredMonthlyPMT, 0)}
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                          per month for {timeHorizonMonths} months
                        </span>
                      </div>

                      {/* Feasibility Indicator (If user provided capacity) */}
                      {cap && statusTheme && (
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${statusTheme.bg} ${statusTheme.border} ${statusTheme.text}`}>
                          <statusTheme.icon className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold">
                              {cap.status === 'comfortable' && `Comfortable (+${formatAmount(cap.differencePerMonth, 0)}/mo surplus)`}
                              {cap.status === 'tight' && `Tight Shortfall (-${formatAmount(Math.abs(cap.differencePerMonth), 0)}/mo)`}
                              {cap.status === 'difficult' && `Significant Gap (-${formatAmount(Math.abs(cap.differencePerMonth), 0)}/mo)`}
                            </div>
                            <div className="text-[11px] opacity-90 mt-0.5">
                              {cap.status === 'comfortable'
                                ? 'Fully funded within your monthly savings limit.'
                                : `At your capacity, target needs +${cap.extraMonthsNeededAtCapacity} extra months (total ${cap.totalMonthsAtCapacity}m).`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Metric Rows */}
                      <div className="space-y-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--line)' }}>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--muted)' }}>Total You Contribute:</span>
                          <span className="font-mono font-bold" style={{ color: 'var(--ink)' }}>
                            {formatAmount(plan.totalContributedIncludingSeed, 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--muted)' }}>Interest / Gains Earned:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatAmount(plan.interestEarned, 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: 'var(--muted)' }}>Projected Maturity:</span>
                          <span className="font-mono font-extrabold text-[var(--brand)]">
                            {formatAmount(plan.projectedFinalAmount, 0)}
                          </span>
                        </div>
                      </div>

                      {/* Vehicle Specific Insight */}
                      <p className="text-[11px] leading-relaxed pt-1" style={{ color: 'var(--muted)' }}>
                        {plan.vehicle.description}
                      </p>
                    </div>

                    {/* Bottom "Use This Plan" Button */}
                    <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--line)' }}>
                      <button
                        type="button"
                        id={`btn-select-plan-${plan.vehicle.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan.vehicle.id);
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--brand)] text-white shadow-xs'
                            : 'border hover:bg-[var(--surface-2)] text-[var(--ink)]'
                        }`}
                        style={!isSelected ? { borderColor: 'var(--line)' } : {}}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Selected Plan</span>
                          </>
                        ) : (
                          <span>Use This Plan</span>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ================================================================ */}
          {/* DETAILED PLAN DEEP-DIVE & PROGRESS VISUALIZATION                 */}
          {/* ================================================================ */}
          <section
            id="plan-deep-dive-section"
            className="p-6 rounded-3xl border shadow-md space-y-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            {/* Deep-Dive Header with Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Detailed Breakdown &amp; Timeline
                </span>
                <h3 className="text-xl font-extrabold mt-0.5" style={{ color: 'var(--ink)' }}>
                  {activePlan.vehicle.name} Execution Plan
                </h3>
              </div>

              {/* Plan Switcher Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                {projectionOutput.plans.map((p) => (
                  <button
                    key={p.vehicle.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.vehicle.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition cursor-pointer ${
                      selectedPlanId === p.vehicle.id
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-xs'
                        : 'hover:border-[var(--brand)]'
                    }`}
                    style={
                      selectedPlanId !== p.vehicle.id
                        ? { borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }
                        : {}
                    }
                  >
                    {p.vehicle.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Progress Visualization Bar (Seed vs Contributions vs Gains) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span style={{ color: 'var(--ink)' }}>Goal Progress Composition</span>
                <span className="text-[var(--brand)] font-mono">
                  {formatAmount(targetGoal, 0)} Target (100%)
                </span>
              </div>

              {/* Stacked Bar */}
              <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex border" style={{ borderColor: 'var(--line)' }}>
                {alreadySaved > 0 && (
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min(100, (alreadySaved / targetGoal) * 100)}%` }}
                    title={`Already Saved: ${formatAmount(alreadySaved, 0)}`}
                  />
                )}
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      100 - (alreadySaved / targetGoal) * 100,
                      (activePlan.totalMonthlyContributed / targetGoal) * 100
                    )}%`,
                  }}
                  title={`Monthly Contributions: ${formatAmount(activePlan.totalMonthlyContributed, 0)}`}
                />
                <div
                  className="h-full bg-teal-400"
                  style={{ width: `${Math.min(100, (activePlan.interestEarned / targetGoal) * 100)}%` }}
                  title={`Interest Earned: ${formatAmount(activePlan.interestEarned, 0)}`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="font-semibold block" style={{ color: 'var(--ink)' }}>
                      Starting Seed: {formatAmount(alreadySaved, 0)}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {Math.round((alreadySaved / targetGoal) * 100)}% of goal
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold block" style={{ color: 'var(--ink)' }}>
                      Your Monthly Savings: {formatAmount(activePlan.totalMonthlyContributed, 0)}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {formatAmount(activePlan.requiredMonthlyPMT, 0)} × {timeHorizonMonths} months
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-emerald-600 dark:text-emerald-400">
                      Interest Earned: +{formatAmount(activePlan.interestEarned, 0)}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      {activePlan.interestSharePercent}% funded by growth
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Month-by-Month Schedule Table */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button
                  type="button"
                  id="toggle-schedule-table-btn"
                  onClick={() => setShowScheduleTable(!showScheduleTable)}
                  className="flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:opacity-80 transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    Month-by-Month Amortization &amp; Growth Schedule ({timeHorizonMonths} Months)
                  </span>
                  {showScheduleTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showScheduleTable && (
                  <button
                    type="button"
                    id="download-schedule-csv-btn"
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border hover:bg-[var(--surface-2)] transition cursor-pointer"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span>Download Schedule (CSV)</span>
                  </button>
                )}
              </div>

              {showScheduleTable && (
                <div className="mt-4 overflow-x-auto border rounded-2xl max-h-96" style={{ borderColor: 'var(--line)' }}>
                  <table className="w-full text-xs text-left">
                    <thead
                      className="sticky top-0 z-10 border-b font-semibold"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
                    >
                      <tr>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3 text-right">Opening Balance</th>
                        <th className="py-2.5 px-3 text-right">Deposit</th>
                        <th className="py-2.5 px-3 text-right">Interest Earned</th>
                        <th className="py-2.5 px-3 text-right">Cumulative Interest</th>
                        <th className="py-2.5 px-3 text-right">Closing Balance</th>
                        <th className="py-2.5 px-3 text-right">Goal Reached</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                      {activePlan.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-[var(--surface-2)] transition-colors">
                          <td className="py-2 px-3 font-bold text-[var(--brand)]">Month {row.month}</td>
                          <td className="py-2 px-3 text-right">{formatAmount(row.openingBalance, 0)}</td>
                          <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                            +{formatAmount(row.deposit, 0)}
                          </td>
                          <td className="py-2 px-3 text-right text-teal-600 dark:text-teal-400">
                            +{formatAmount(row.interestEarned, 0)}
                          </td>
                          <td className="py-2 px-3 text-right text-[var(--muted)]">
                            {formatAmount(row.cumulativeInterest, 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold" style={{ color: 'var(--ink)' }}>
                            {formatAmount(row.closingBalance, 0)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              {row.percentOfGoal}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pros & Cons Checklist for Selected Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths of {activePlan.vehicle.shortName}:
                </span>
                <ul className="space-y-1.5 text-xs text-emerald-900/80 dark:text-emerald-200/80">
                  {activePlan.vehicle.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Things to Keep in Mind:
                </span>
                <ul className="space-y-1.5 text-xs text-amber-900/80 dark:text-amber-200/80">
                  {activePlan.vehicle.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Legal & Regulatory Financial Disclaimer */}
          <div
            id="savings-disclaimer"
            className="p-4 rounded-2xl border text-xs text-[var(--muted)] flex items-start gap-2.5 leading-relaxed"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Important Financial Advisory Note: </strong>
              Projections are for illustration only. Actual returns may vary depending on macroeconomic interest rate cycles and market conditions. Bank deposits are insured up to ₹5,00,000 per depositor under DICGC. Mutual funds are subject to market risks; please read all scheme-related documents carefully before investing. Tax laws are subject to amendments under the Finance Act.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

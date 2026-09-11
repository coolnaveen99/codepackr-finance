import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Flame, Clock, ShieldAlert, ArrowUpRight, TrendingDown } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateBurnRate, BurnRateInputs } from '../../lib/financial/burnRate';

interface BurnRateCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const BurnRateCalculatorView: React.FC<BurnRateCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [cashBalanceStr, setCashBalanceStr] = useState('750000');
  const [monthlyOperatingExpensesStr, setMonthlyOperatingExpensesStr] = useState('65000');
  const [monthlyRevenueStr, setMonthlyRevenueStr] = useState('20000');
  const [revenueMonthlyGrowthRateStr, setRevenueMonthlyGrowthRateStr] = useState('5');
  const [expenseMonthlyGrowthRateStr, setExpenseMonthlyGrowthRateStr] = useState('2');

  const cashBalance = parseFloat(cashBalanceStr) || 0;
  const monthlyOperatingExpenses = parseFloat(monthlyOperatingExpensesStr) || 0;
  const monthlyRevenue = parseFloat(monthlyRevenueStr) || 0;
  const revenueMonthlyGrowthRate = parseFloat(revenueMonthlyGrowthRateStr) || 0;
  const expenseMonthlyGrowthRate = parseFloat(expenseMonthlyGrowthRateStr) || 0;

  const result = useMemo(() => {
    const inputs: BurnRateInputs = {
      cashBalance,
      monthlyOperatingExpenses,
      monthlyRevenue,
      revenueMonthlyGrowthRate,
      expenseMonthlyGrowthRate,
    };
    return calculateBurnRate(inputs);
  }, [
    cashBalance,
    monthlyOperatingExpenses,
    monthlyRevenue,
    revenueMonthlyGrowthRate,
    expenseMonthlyGrowthRate,
  ]);

  const handleReset = () => {
    setCashBalanceStr('750000');
    setMonthlyOperatingExpensesStr('65000');
    setMonthlyRevenueStr('20000');
    setRevenueMonthlyGrowthRateStr('5');
    setExpenseMonthlyGrowthRateStr('2');
  };

  const getStatusBadge = (status: 'critical' | 'caution' | 'healthy' | 'profitable') => {
    switch (status) {
      case 'critical':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical Runway (&lt; 6 mos)
          </span>
        );
      case 'caution':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            Moderate Runway (6–12 mos)
          </span>
        );
      case 'healthy':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Healthy Runway (&gt; 12 mos)
          </span>
        );
      case 'profitable':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Default Alive (Cash Flow Positive)
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ToolHeader
        tool={tool}
        onBack={onBackToHome}
        actions={
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
              title="Reset Default Values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Treasury Cash &amp; Monthly Operations
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Cash in Bank (Treasury Reserves)
              </label>
              <input
                type="text"
                value={cashBalanceStr}
                onChange={(e) => handleCleanInput(e.target.value, setCashBalanceStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="750000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gross Monthly Operating Expenses (Salaries, Cloud, Rent)
              </label>
              <input
                type="text"
                value={monthlyOperatingExpensesStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlyOperatingExpensesStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="65000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Cash Collections / Revenue
              </label>
              <input
                type="text"
                value={monthlyRevenueStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlyRevenueStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="20000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  MoM Revenue Growth (%)
                </label>
                <input
                  type="text"
                  value={revenueMonthlyGrowthRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setRevenueMonthlyGrowthRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  MoM Expense Growth (%)
                </label>
                <input
                  type="text"
                  value={expenseMonthlyGrowthRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setExpenseMonthlyGrowthRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-7 space-y-5">
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Runway &amp; Capital Lifeline
              </span>
              {getStatusBadge(result.runwayStatus)}
            </div>

            {/* Main Runway Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800/80 border border-amber-200/60 dark:border-amber-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                Estimated Runway Remaining
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {result.runwayMonths >= 99 ? '∞ Default Alive' : `${result.runwayMonths.toFixed(1)} Months`}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Net burn rate of {formatAmount(result.netBurnRate)}/mo depletes cash by {result.zeroCashDate}
              </p>
            </div>

            {/* Burn Rates Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Net Burn Rate (Loss/mo)</span>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {formatAmount(result.netBurnRate)}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Expenses minus incoming revenue
                </span>
              </div>

              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Gross Burn Rate (Cost/mo)</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.grossBurnRate)}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total monthly operating cash outflow
                </span>
              </div>
            </div>

            {/* Fundraise Window Trigger */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Fundraising Window Kickoff Deadline
                </span>
                <span className="text-[11px] text-slate-500">
                  Must begin pitching 6 months prior to cash exhaustion to avoid predatory terms
                </span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                Month {Math.max(1, Math.round(result.runwayMonths - 6))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Venture Capital Runway &amp; Default Alive Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Gross vs Net Burn</span>
            Gross burn is your baseline spending without any revenue assumption. Net burn is your actual monthly cash bleed after netting customer payments.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">The 6-Month Danger Zone</span>
            Institutional seed and Series A rounds take between 3 to 6 months to close from first partner meeting to wire transfer. Never let runway drop below 6 months without term sheets.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Default Alive vs Dead</span>
            A company is 'Default Alive' (Paul Graham) if current revenue growth will lead to profitability before running out of cash without needing subsequent funding rounds.
          </div>
        </div>
      </div>
    </div>
  );
};

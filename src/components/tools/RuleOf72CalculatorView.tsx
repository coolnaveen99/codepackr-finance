import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Clock, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateRuleOf72,
  RuleOf72Inputs,
} from '../../lib/financial/ruleOf72';

interface RuleOf72CalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const RuleOf72CalculatorView: React.FC<RuleOf72CalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [calcMode, setCalcMode] = useState<'doubling' | 'inflation' | 'target-years'>('doubling');
  const [initialAmountStr, setInitialAmountStr] = useState('10000');
  const [interestRateStr, setInterestRateStr] = useState('8.0');
  const [inflationRateStr, setInflationRateStr] = useState('6.0');
  const [targetYearsStr, setTargetYearsStr] = useState('10');

  const initialAmount = parseFloat(initialAmountStr) || 10000;
  const interestRate = parseFloat(interestRateStr) || 8.0;
  const inflationRate = parseFloat(inflationRateStr) || 6.0;
  const targetYears = parseFloat(targetYearsStr) || 10;

  const result = useMemo(() => {
    const effectiveRate = calcMode === 'inflation' ? inflationRate : (calcMode === 'target-years' ? 72 / targetYears : interestRate);
    const inputs: RuleOf72Inputs = {
      interestRate: effectiveRate,
      initialInvestment: initialAmount,
    };
    return calculateRuleOf72(inputs);
  }, [calcMode, initialAmount, interestRate, inflationRate, targetYears]);

  const handleReset = () => {
    setCalcMode('doubling');
    setInitialAmountStr('10000');
    setInterestRateStr('8.0');
    setInflationRateStr('6.0');
    setTargetYearsStr('10');
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
              <Clock className="w-4 h-4 text-blue-500" />
              Rule of 72 Estimator Mode
            </h3>

            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Calculation Focus
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcMode('doubling')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-colors ${
                    calcMode === 'doubling'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Investment Doubling Time</span>
                  <span className="text-[10px] font-normal opacity-80">72 ÷ Return Rate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('inflation')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-colors ${
                    calcMode === 'inflation'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Inflation Purchasing Power Halving</span>
                  <span className="text-[10px] font-normal opacity-80">72 ÷ Inflation Rate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('target-years')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition-colors ${
                    calcMode === 'target-years'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>Required Rate to Double in N Years</span>
                  <span className="text-[10px] font-normal opacity-80">72 ÷ Target Years</span>
                </button>
              </div>
            </div>

            {/* Starting Principal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Amount
              </label>
              <input
                type="text"
                value={initialAmountStr}
                onChange={(e) => handleCleanInput(e.target.value, setInitialAmountStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="10000"
              />
            </div>

            {/* Conditional Input based on mode */}
            {calcMode === 'doubling' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Interest / Compound Return Rate (%)
                </label>
                <input
                  type="text"
                  value={interestRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInterestRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="8.0"
                />
              </div>
            )}

            {calcMode === 'inflation' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Inflation Rate (CPI %)
                </label>
                <input
                  type="text"
                  value={inflationRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInflationRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.0"
                />
              </div>
            )}

            {calcMode === 'target-years' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Desired Doubling Horizon (Years)
                </label>
                <input
                  type="text"
                  value={targetYearsStr}
                  onChange={(e) => handleCleanInput(e.target.value, setTargetYearsStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="10"
                />
              </div>
            )}
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
                Mental Math vs. Exact Logarithmic Compounding
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Variance: {Math.abs(result.variancePercentage).toFixed(2)}%
              </span>
            </div>

            {/* Main Result Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                {calcMode === 'inflation'
                  ? 'Time Until Money Loses 50% Purchasing Power'
                  : calcMode === 'target-years'
                  ? 'Required Compounding Rate to Double'
                  : 'Time to 2x (Double) Your Money'}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {calcMode === 'target-years'
                  ? `${(72 / targetYears).toFixed(2)}%`
                  : `${result.heuristicYears.toFixed(1)} Years`}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Exact logarithmic solution: {calcMode === 'target-years' ? `${((Math.pow(2, 1 / targetYears) - 1) * 100).toFixed(2)}%` : `${result.exactYears.toFixed(2)} Years`} (ln 2 formula)
              </p>
            </div>

            {/* Milestones Progression */}
            <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: 'var(--line)' }}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {calcMode === 'inflation' ? 'Purchasing Power Halving Timeline' : 'Exponential Doubling Milestones'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-[10px] text-slate-400 block font-sans">1x (Today)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {formatAmount(initialAmount)}
                  </span>
                  <span className="text-[10px] text-slate-500">Year 0</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-sans">2x (1st Double)</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 block">
                    {formatAmount(initialAmount * 2)}
                  </span>
                  <span className="text-[10px] text-slate-500">Yr {result.heuristicYears.toFixed(1)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-sans">4x (2nd Double)</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                    {formatAmount(initialAmount * 4)}
                  </span>
                  <span className="text-[10px] text-slate-500">Yr {(result.heuristicYears * 2).toFixed(1)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans">8x (3rd Double)</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                    {formatAmount(initialAmount * 8)}
                  </span>
                  <span className="text-[10px] text-slate-500">Yr {(result.heuristicYears * 3).toFixed(1)}</span>
                </div>
              </div>
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
          The Science &amp; Accuracy of the Rule of 72
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Mathematical Derivation</span>
            The natural logarithm of 2 is approximately 0.693 (69.3%). 72 is used instead of 69.3 because it has vastly more integer divisors (1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">The Sweet Spot (6% to 10%)</span>
            The Rule of 72 is most accurate for return rates between 6% and 10%, with error staying under 2%. For rates around 3-5%, the Rule of 70 is slightly closer.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Inflation &amp; Purchasing Power</span>
            At 6% sustained consumer inflation, your cash loses half of its real purchasing power in just 12 years (72 ÷ 6).
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateLumpsum, LumpsumInput } from '../../lib/financial/lumpsum';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface LumpsumCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const LumpsumCalculatorView: React.FC<LumpsumCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('lumpsum-calculator');

  const [inputs, setInputs] = useState<LumpsumInput>({
    totalInvestment: 100000,
    expectedAnnualReturnRate: 12.0,
    timeHorizonYears: 10,
    inflationRate: 6.0,
  });

  const result = useMemo(() => calculateLumpsum(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      totalInvestment: 100000,
      expectedAnnualReturnRate: 12.0,
      timeHorizonYears: 10,
      inflationRate: 6.0,
    });
  };

  const handleCopy = () => {
    const text = `Lumpsum Investment Summary - CodePackr Finance\n` +
      `Initial Investment: ${formatAmount(result.totalInvested)}\n` +
      `Expected Return: ${inputs.expectedAnnualReturnRate}% p.a.\n` +
      `Time Horizon: ${inputs.timeHorizonYears} Years\n` +
      `Estimated Returns: ${formatAmount(result.estimatedReturns)}\n` +
      `Total Maturity Value: ${formatAmount(result.totalMaturityValue)}\n` +
      `Wealth Multiple: ${result.wealthMultiple}x\n` +
      `Real Purchasing Power (Inflation-Adjusted): ${formatAmount(result.realMaturityValue)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Year', 'Invested Amount', 'Estimated Returns', 'Total Maturity Value', 'Real Purchasing Power'],
      ...result.yearlyBreakdown.map(y => [
        y.year,
        y.investedAmount,
        y.estimatedReturns,
        y.totalValue,
        y.realPurchasingPower,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lumpsum_investment_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="lumpsum-calculator-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Mutual Fund & Equity Standard
          </span>
          <span className="text-xs text-[var(--muted)]">Compound Expansion</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="lump-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="lump-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="lump-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--brand)]" />
              Investment Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="lump-amount" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Total One-Time Investment ({currencyCode})
                </label>
                <input
                  id="lump-amount"
                  type="number"
                  min="500"
                  step="5000"
                  value={inputs.totalInvestment || ''}
                  onChange={(e) => setInputs({ ...inputs, totalInvestment: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="lump-return" className="text-xs font-medium text-[var(--muted)]">
                    Expected Return Rate (% p.a.)
                  </label>
                  <span className="text-xs font-semibold text-[var(--brand)] font-mono">
                    {inputs.expectedAnnualReturnRate}%
                  </span>
                </div>
                <input
                  id="lump-return"
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={inputs.expectedAnnualReturnRate}
                  onChange={(e) => setInputs({ ...inputs, expectedAnnualReturnRate: Number(e.target.value) })}
                  className="w-full accent-[var(--brand)] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="lump-tenure" className="text-xs font-medium text-[var(--muted)]">
                    Time Horizon (Years)
                  </label>
                  <span className="text-xs font-semibold text-[var(--brand)] font-mono">
                    {inputs.timeHorizonYears} Years
                  </span>
                </div>
                <input
                  id="lump-tenure"
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={inputs.timeHorizonYears}
                  onChange={(e) => setInputs({ ...inputs, timeHorizonYears: Number(e.target.value) })}
                  className="w-full accent-[var(--brand)] cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="lump-inflation" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Headline Benchmark Inflation (% p.a.)
                </label>
                <input
                  id="lump-inflation"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={inputs.inflationRate || ''}
                  onChange={(e) => setInputs({ ...inputs, inflationRate: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>
            </div>
          </div>

          {formulaMeta && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--brand)]" />
                Compounding Formula
              </span>
              <p className="text-xs font-mono text-[var(--ink)] bg-[var(--bg)] p-2 rounded-lg border border-[var(--line)]">
                {formulaMeta.formulaText}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Key Outcomes */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Card */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Expected Maturity Value
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
                    {formatAmount(result.totalMaturityValue)}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 font-mono">
                {result.wealthMultiple}x Capital
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Invested Capital</span>
                <span className="text-lg font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.totalInvested)}</span>
                <span className="text-[10px] text-[var(--muted)]">Principal outlay</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-emerald-500 font-medium block">Estimated Wealth Gain</span>
                <span className="text-lg font-bold text-emerald-500 mt-0.5 block">+{formatAmount(result.estimatedReturns)}</span>
                <span className="text-[10px] text-[var(--muted)]">Compound returns</span>
              </div>

              <div className="col-span-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">Real Purchasing Power</span>
                  <span className="text-xs text-[var(--muted)]">Adjusted for {inputs.inflationRate}% inflation</span>
                </div>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {formatAmount(result.realMaturityValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Year-by-Year Growth Progression
            </h3>
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {result.yearlyBreakdown.map((row) => (
                <div key={row.year} className="flex items-center justify-between py-1 border-b border-[var(--line)] last:border-0">
                  <span className="text-[var(--muted)]">Year {row.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-500 font-medium">+{formatAmount(row.estimatedReturns)}</span>
                    <span className="text-[var(--ink)] font-bold">{formatAmount(row.totalValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

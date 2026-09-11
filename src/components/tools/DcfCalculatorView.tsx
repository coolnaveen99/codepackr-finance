import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, Download, CheckCircle2, Table, Layers, ArrowRight } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateDcf, DcfInputs } from '../../lib/financial/dcf';

interface DcfCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const DcfCalculatorView: React.FC<DcfCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [initialFcfStr, setInitialFcfStr] = useState('500000');
  const [growthRateStr, setGrowthRateStr] = useState('12');
  const [forecastYearsStr, setForecastYearsStr] = useState('5');
  const [waccStr, setWaccStr] = useState('10');
  const [terminalMethod, setTerminalMethod] = useState<'growth' | 'multiple'>('growth');
  const [terminalGrowthRateStr, setTerminalGrowthRateStr] = useState('3.0');
  const [exitMultipleStr, setExitMultipleStr] = useState('12');
  const [netDebtStr, setNetDebtStr] = useState('250000');
  const [sharesOutstandingStr, setSharesOutstandingStr] = useState('1000000');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const initialFcf = parseFloat(initialFcfStr) || 0;
  const growthRate = parseFloat(growthRateStr) || 0;
  const forecastYears = parseFloat(forecastYearsStr) || 5;
  const wacc = parseFloat(waccStr) || 10;
  const terminalGrowthRate = parseFloat(terminalGrowthRateStr) || 3.0;
  const exitMultiple = parseFloat(exitMultipleStr) || 12;
  const netDebt = parseFloat(netDebtStr) || 0;
  const sharesOutstanding = parseFloat(sharesOutstandingStr) || undefined;

  const result = useMemo(() => {
    const inputs: DcfInputs = {
      initialFcf,
      growthRate,
      forecastYears,
      wacc,
      terminalMethod,
      terminalGrowthRate,
      exitMultiple,
      netDebt,
      sharesOutstanding,
    };
    return calculateDcf(inputs);
  }, [
    initialFcf,
    growthRate,
    forecastYears,
    wacc,
    terminalMethod,
    terminalGrowthRate,
    exitMultiple,
    netDebt,
    sharesOutstanding,
  ]);

  const handleReset = () => {
    setInitialFcfStr('500000');
    setGrowthRateStr('12');
    setForecastYearsStr('5');
    setWaccStr('10');
    setTerminalMethod('growth');
    setTerminalGrowthRateStr('3.0');
    setExitMultipleStr('12');
    setNetDebtStr('250000');
    setSharesOutstandingStr('1000000');
  };

  const handleCopyCsv = () => {
    const headers = 'Year,Projected FCF,Discount Factor,Present Value,Cumulative PV\n';
    const rows = result.cashFlows
      .map(
        (cf) =>
          `${cf.year},${cf.fcf.toFixed(2)},${cf.discountFactor.toFixed(4)},${cf.presentValue.toFixed(
            2
          )},${cf.cumulativePv.toFixed(2)}`
      )
      .join('\n');
    navigator.clipboard.writeText(headers + rows);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
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
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              DCF Assumptions &amp; Forecast
            </h3>

            {/* Initial Year 1 FCF */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year 1 Free Cash Flow (FCF)
              </label>
              <input
                type="text"
                value={initialFcfStr}
                onChange={(e) => handleCleanInput(e.target.value, setInitialFcfStr)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="500000"
              />
            </div>

            {/* Growth & Horizon Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Forecast CAGR (%)
                </label>
                <input
                  type="text"
                  value={growthRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setGrowthRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Horizon (Years)
                </label>
                <select
                  value={forecastYearsStr}
                  onChange={(e) => setForecastYearsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                >
                  <option value="3">3 Years</option>
                  <option value="5">5 Years (Standard)</option>
                  <option value="7">7 Years</option>
                  <option value="10">10 Years (Matured)</option>
                </select>
              </div>
            </div>

            {/* WACC Discount Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount Rate / WACC (%)
              </label>
              <input
                type="text"
                value={waccStr}
                onChange={(e) => handleCleanInput(e.target.value, setWaccStr)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="10.0"
              />
            </div>

            {/* Terminal Value Method Selector */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Terminal Value Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTerminalMethod('growth')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    terminalMethod === 'growth'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Perpetual Growth (Gordon)
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalMethod('multiple')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    terminalMethod === 'multiple'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Exit Multiple (x)
                </button>
              </div>
            </div>

            {terminalMethod === 'growth' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Long-term Growth Rate (g %)
                </label>
                <input
                  type="text"
                  value={terminalGrowthRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setTerminalGrowthRateStr)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="3.0"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Exit FCF Multiple (x)
                </label>
                <input
                  type="text"
                  value={exitMultipleStr}
                  onChange={(e) => handleCleanInput(e.target.value, setExitMultipleStr)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="12.0"
                />
              </div>
            )}

            {/* Net Debt & Shares */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Net Debt (Debt - Cash)
                </label>
                <input
                  type="text"
                  value={netDebtStr}
                  onChange={(e) => handleCleanInput(e.target.value, setNetDebtStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="250000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shares Outstanding
                </label>
                <input
                  type="text"
                  value={sharesOutstandingStr}
                  onChange={(e) => handleCleanInput(e.target.value, setSharesOutstandingStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Valuation Summary Card */}
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fair Market Valuation Results
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                WACC: {wacc}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 block mb-1">
                  Implied Enterprise Value (EV)
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatAmount(result.enterpriseValue)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Sum of PV(Cash Flows) + PV(Terminal Value)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block mb-1">
                  Implied Equity Value
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatAmount(result.equityValue)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Enterprise Value minus Net Debt
                </span>
              </div>
            </div>

            {/* Per Share Fair Value if shares provided */}
            {result.perShareValue !== undefined && (
              <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Intrinsic Value Per Share
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Based on {sharesOutstanding?.toLocaleString()} shares
                  </span>
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {formatAmount(result.perShareValue)}
                </div>
              </div>
            )}

            {/* Value Component Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  Explicit Forecast: {(100 - result.terminalValuePercentage).toFixed(1)}% ({formatAmount(result.pvExplicitFcfs)})
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  Terminal Value: {result.terminalValuePercentage.toFixed(1)}% ({formatAmount(result.pvTerminalValue)})
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${Math.max(5, Math.min(95, 100 - result.terminalValuePercentage))}%` }}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${Math.max(5, Math.min(95, result.terminalValuePercentage))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cash Flow Forecast Table */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-slate-400" />
                Projected Cash Flows &amp; Discounting
              </h4>
              <button
                onClick={handleCopyCsv}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {copiedCsv ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                {copiedCsv ? 'Copied CSV!' : 'Copy CSV'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b text-slate-500" style={{ borderColor: 'var(--line)' }}>
                    <th className="py-2 font-semibold">Year</th>
                    <th className="py-2 text-right font-semibold">FCF</th>
                    <th className="py-2 text-right font-semibold">Disc. Factor</th>
                    <th className="py-2 text-right font-semibold">Present Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  {result.cashFlows.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 font-bold text-slate-700 dark:text-slate-300">Year {row.year}</td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatAmount(row.fcf)}</td>
                      <td className="py-2 text-right text-slate-500">{row.discountFactor.toFixed(3)}</td>
                      <td className="py-2 text-right font-bold text-blue-600 dark:text-blue-400">
                        {formatAmount(row.presentValue)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">Terminal Value</td>
                    <td className="py-2.5 text-right text-slate-600 dark:text-slate-400">
                      {formatAmount(result.terminalValue)}
                    </td>
                    <td className="py-2.5 text-right text-slate-500">
                      {(1 / Math.pow(1 + wacc / 100, forecastYears)).toFixed(3)}
                    </td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                      {formatAmount(result.pvTerminalValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Explanations */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          How Discounted Cash Flow (DCF) Valuation Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">1. Explicit Free Cash Flows</span>
            Projects operating cash flows minus capital expenditures over a 3-10 year horizon, reflecting expected operating growth.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">2. Terminal Value (TV)</span>
            Captures the remaining value of the firm in perpetuity, estimated via either the Gordon Perpetual Growth formula or exit EBITDA multiples.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">3. Enterprise to Equity Value</span>
            Discounts all future cash flows back to today using WACC, then subtracts Net Debt (Total Debt minus Cash) to calculate Equity Value.
          </div>
        </div>
      </div>
    </div>
  );
};

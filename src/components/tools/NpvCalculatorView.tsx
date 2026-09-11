import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, Plus, Trash2, Download, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateNPV } from '../../lib/financial/npv';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface NpvCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const NpvCalculatorView: React.FC<NpvCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('npv');

  const [initialInvestmentStr, setInitialInvestmentStr] = useState('100000');
  const [discountRateStr, setDiscountRateStr] = useState('10');
  const [cashFlowsStr, setCashFlowsStr] = useState<string[]>([
    '30000',
    '40000',
    '50000',
    '40000',
    '30000',
  ]);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const initialInvestment = parseFloat(initialInvestmentStr) || 0;
  const discountRate = parseFloat(discountRateStr) || 0;
  const cashFlows = useMemo(
    () => cashFlowsStr.map((val) => parseFloat(val) || 0),
    [cashFlowsStr]
  );

  const result = useMemo(
    () => calculateNPV({ initialInvestment, discountRate, cashFlows }),
    [initialInvestment, discountRate, cashFlows]
  );

  const handleUpdateFlow = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    setCashFlowsStr((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
  };

  const handleAddFlow = () => {
    if (cashFlowsStr.length >= 20) return;
    const lastVal = cashFlowsStr[cashFlowsStr.length - 1] || '30000';
    setCashFlowsStr((prev) => [...prev, lastVal]);
  };

  const handleRemoveFlow = (index: number) => {
    if (cashFlowsStr.length <= 1) return;
    setCashFlowsStr((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setInitialInvestmentStr('100000');
    setDiscountRateStr('10');
    setCashFlowsStr(['30000', '40000', '50000', '40000', '30000']);
  };

  const handleLoadPreset = (preset: 'standard' | 'quick' | 'growth') => {
    if (preset === 'standard') {
      setInitialInvestmentStr('100000');
      setDiscountRateStr('10');
      setCashFlowsStr(['30000', '40000', '50000', '40000', '30000']);
    } else if (preset === 'quick') {
      setInitialInvestmentStr('80000');
      setDiscountRateStr('8');
      setCashFlowsStr(['45000', '40000', '35000']);
    } else if (preset === 'growth') {
      setInitialInvestmentStr('150000');
      setDiscountRateStr('12');
      setCashFlowsStr(['20000', '35000', '60000', '90000', '130000']);
    }
  };

  const handleExportCsv = () => {
    let csv = 'Year,Cash Flow,Discount Factor,Present Value,Cumulative PV\n';
    result.presentValues.forEach((r) => {
      csv += `${r.year},${r.cashFlow},${r.discountFactor},${r.presentValue},${r.cumulativePv}\n`;
    });
    csv += `\nInitial Outlay,-${initialInvestment}\n`;
    csv += `Discount Rate,${discountRate}%\n`;
    csv += `Total PV of Inflows,${result.totalPV}\n`;
    csv += `Net Present Value (NPV),${result.npv}\n`;
    csv += `Profitability Index,${result.profitabilityIndex}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `npv-analysis-${cashFlows.length}-years.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div className="space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-5xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency & Preset Controls Toolbar */}
        <div
          className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Active Currency:
            </span>
            <span className="text-xs font-mono font-bold text-[var(--brand)] flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--brand)]/10">
              <span>{currency.flag}</span>
              <span>
                {currency.code} ({currency.symbol.trim()})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Presets:
            </span>
            <button
              onClick={() => handleLoadPreset('standard')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              5-Yr Standard
            </button>
            <button
              onClick={() => handleLoadPreset('quick')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              3-Yr Quick Payback
            </button>
            <button
              onClick={() => handleLoadPreset('growth')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              5-Yr Growth
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer ml-1"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset parameters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <CurrencySelector idPrefix="npv-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Project Parameters & Dynamic Cash Flows */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
              Capital Parameters
            </h3>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                INITIAL INVESTMENT ({currency.symbol.trim()})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={initialInvestmentStr}
                onChange={(e) => handleCleanInput(e.target.value, setInitialInvestmentStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder="100000"
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Cash outflow required at Year 0
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                DISCOUNT RATE / WACC (% P.A.)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={discountRateStr}
                onChange={(e) => handleCleanInput(e.target.value, setDiscountRateStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder="10"
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Hurdle rate or opportunity cost of capital
              </span>
            </div>

            {/* Cash Flow Rows Header */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Cash Inflows by Year
                </span>
                <button
                  onClick={handleAddFlow}
                  disabled={cashFlowsStr.length >= 20}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Year
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cashFlowsStr.map((flowVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium w-16 shrink-0" style={{ color: 'var(--muted)' }}>
                      Year {idx + 1}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={flowVal}
                      onChange={(e) => handleUpdateFlow(idx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                    />
                    {cashFlowsStr.length > 1 && (
                      <button
                        onClick={() => handleRemoveFlow(idx)}
                        className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete year"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Results & Decision Matrix */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
              Valuation & Feasibility Result
            </h3>

            {/* Primary NPV Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                result.decision === 'ACCEPT'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : result.decision === 'REJECT'
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : 'border-blue-500/40 bg-blue-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Net Present Value (NPV)
                  </span>
                  <div
                    className={`text-3xl font-extrabold font-mono mt-1 ${
                      result.decision === 'ACCEPT'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : result.decision === 'REJECT'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[var(--ink)]'
                    }`}
                  >
                    {formatAmount(result.npv)}
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide ${
                    result.decision === 'ACCEPT'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : result.decision === 'REJECT'
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {result.decision === 'ACCEPT' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Project
                    </>
                  ) : result.decision === 'REJECT' ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Project
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Neutral
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--ink)' }}>
                {result.decisionRationale}
              </p>
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  PROFITABILITY INDEX (PI)
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {result.profitabilityIndex === Infinity ? '∞' : `${result.profitabilityIndex}x`}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  {result.profitabilityIndex >= 1 ? 'PI ≥ 1.0 (Value accretive)' : 'PI < 1.0 (Value dilutive)'}
                </span>
              </div>

              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  TOTAL PV OF INFLOWS
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {formatAmount(result.totalPV)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Discounted value of future cash
                </span>
              </div>

              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  DISCOUNTED PAYBACK
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {result.discountedPaybackPeriodYears !== null
                    ? `${result.discountedPaybackPeriodYears} Yrs`
                    : 'Exceeds Horizon'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Nominal: {result.paybackPeriodYears !== null ? `${result.paybackPeriodYears} yrs` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Discounted Cash Flow Breakdown Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Discounted Cash Flow Schedule
                </span>
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {copiedCsv ? 'Exported!' : 'Export CSV'}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <table className="w-full text-xs text-left">
                  <thead style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}>
                    <tr>
                      <th className="px-3 py-2 font-semibold">Period</th>
                      <th className="px-3 py-2 font-semibold text-right">Nominal Cash Flow</th>
                      <th className="px-3 py-2 font-semibold text-right">Discount Factor</th>
                      <th className="px-3 py-2 font-semibold text-right">Present Value</th>
                      <th className="px-3 py-2 font-semibold text-right">Cumulative PV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                    <tr style={{ backgroundColor: 'var(--surface)' }}>
                      <td className="px-3 py-2 font-bold text-[var(--ink)]">Year 0 (Outlay)</td>
                      <td className="px-3 py-2 text-right text-rose-500">-{formatAmount(initialInvestment)}</td>
                      <td className="px-3 py-2 text-right">1.0000</td>
                      <td className="px-3 py-2 text-right text-rose-500">-{formatAmount(initialInvestment)}</td>
                      <td className="px-3 py-2 text-right text-rose-500">-{formatAmount(initialInvestment)}</td>
                    </tr>
                    {result.presentValues.map((row) => (
                      <tr key={row.year} style={{ backgroundColor: 'var(--surface)' }}>
                        <td className="px-3 py-2 font-medium text-[var(--ink)]">Year {row.year}</td>
                        <td className="px-3 py-2 text-right text-[var(--ink)]">{formatAmount(row.cashFlow)}</td>
                        <td className="px-3 py-2 text-right text-[var(--muted)]">{row.discountFactor.toFixed(4)}</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatAmount(row.presentValue)}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--ink)]">{formatAmount(row.cumulativePv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Methodology & Formula Section */}
        {formulaMeta && (
          <div
            className="p-4 rounded-xl border space-y-2 mt-4"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
              <Info className="w-4 h-4" />
              <span>Capital Budgeting Methodology & Formula</span>
            </div>
            <p className="text-xs leading-relaxed font-mono" style={{ color: 'var(--ink)' }}>
              {formulaMeta.formulaText}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {formulaMeta.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

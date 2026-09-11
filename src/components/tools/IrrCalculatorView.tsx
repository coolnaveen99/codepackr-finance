import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Percent, Plus, Trash2, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateIRR } from '../../lib/financial/irr';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface IrrCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const IrrCalculatorView: React.FC<IrrCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('irr');

  const [initialInvestmentStr, setInitialInvestmentStr] = useState('100000');
  const [hurdleRateStr, setHurdleRateStr] = useState('12');
  const [cashFlowsStr, setCashFlowsStr] = useState<string[]>([
    '30000',
    '40000',
    '50000',
    '40000',
    '30000',
  ]);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const initialInvestment = parseFloat(initialInvestmentStr) || 0;
  const hurdleRate = hurdleRateStr ? parseFloat(hurdleRateStr) : undefined;
  const cashFlows = useMemo(
    () => cashFlowsStr.map((val) => parseFloat(val) || 0),
    [cashFlowsStr]
  );

  const result = useMemo(
    () => calculateIRR({ initialInvestment, cashFlows, hurdleRate }),
    [initialInvestment, cashFlows, hurdleRate]
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
    setHurdleRateStr('12');
    setCashFlowsStr(['30000', '40000', '50000', '40000', '30000']);
  };

  const handleLoadPreset = (preset: 'standard' | 'highreturn' | 'conservative') => {
    if (preset === 'standard') {
      setInitialInvestmentStr('100000');
      setHurdleRateStr('12');
      setCashFlowsStr(['30000', '40000', '50000', '40000', '30000']);
    } else if (preset === 'highreturn') {
      setInitialInvestmentStr('80000');
      setHurdleRateStr('15');
      setCashFlowsStr(['35000', '45000', '55000', '65000']);
    } else if (preset === 'conservative') {
      setInitialInvestmentStr('120000');
      setHurdleRateStr('10');
      setCashFlowsStr(['25000', '28000', '32000', '35000', '38000']);
    }
  };

  const handleExportCsv = () => {
    let csv = 'Discount Rate (%),NPV at Rate\n';
    result.npvProfile.forEach((p) => {
      csv += `${p.rate}%,${p.npv}\n`;
    });
    csv += `\nCalculated IRR,${result.irr !== null ? `${result.irr}%` : 'N/A'}\n`;
    csv += `Hurdle Rate,${hurdleRate !== undefined ? `${hurdleRate}%` : 'None'}\n`;
    csv += `Initial Investment,-${initialInvestment}\n`;
    csv += `Total Cash Inflow,${result.totalInflows}\n`;
    csv += `Net Nominal Gain,${result.netNominalGain}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `irr-analysis.csv`);
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
        {/* Toolbar */}
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
              Standard 5-Yr
            </button>
            <button
              onClick={() => handleLoadPreset('highreturn')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              High Growth 4-Yr
            </button>
            <button
              onClick={() => handleLoadPreset('conservative')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Conservative
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
            <CurrencySelector idPrefix="irr-currency" variant="pill" />
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
              Cash Flow Stream
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
                Outlay at t=0
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                HURDLE RATE BENCHMARK (% P.A.)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={hurdleRateStr}
                onChange={(e) => handleCleanInput(e.target.value, setHurdleRateStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder="12"
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Minimum required rate of return
              </span>
            </div>

            {/* Inflows list */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Expected Inflows
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
                {cashFlowsStr.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium w-16 shrink-0" style={{ color: 'var(--muted)' }}>
                      Year {idx + 1}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={val}
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

          {/* Results Column */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
              Internal Rate of Return
            </h3>

            {/* Primary IRR Card */}
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
                    Calculated Internal Rate of Return (IRR)
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
                    {result.irr !== null ? `${result.irr}%` : 'Undetermined'}
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
                      Meets Hurdle Rate
                    </>
                  ) : result.decision === 'REJECT' ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Below Hurdle Rate
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Undetermined
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--ink)' }}>
                {result.decisionRationale}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  HURDLE SPREAD
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {result.irr !== null && hurdleRate !== undefined
                    ? `${(result.irr - hurdleRate > 0 ? '+' : '')}${(result.irr - hurdleRate).toFixed(2)}%`
                    : 'N/A'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Hurdle benchmark: {hurdleRate !== undefined ? `${hurdleRate}%` : 'None'}
                </span>
              </div>

              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  TOTAL INFLOWS
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {formatAmount(result.totalInflows)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Nominal undiscounted sum
                </span>
              </div>

              <div
                className="p-3.5 rounded-xl border"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
              >
                <span className="text-[11px] font-semibold block" style={{ color: 'var(--muted)' }}>
                  NPV AT CALCULATED IRR
                </span>
                <span className="text-lg font-bold font-mono mt-1 block text-[var(--ink)]">
                  {formatAmount(result.npvAtIrr)}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                  Equates to zero at equilibrium
                </span>
              </div>
            </div>

            {/* NPV Profile Sensitivity Curve Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  NPV Sensitivity Profile Across Discount Rates
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
                      <th className="px-3 py-2 font-semibold">Discount Rate</th>
                      <th className="px-3 py-2 font-semibold text-right">Project NPV</th>
                      <th className="px-3 py-2 font-semibold text-right">Economic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                    {result.npvProfile.map((p) => {
                      const isPositive = p.npv > 0;
                      return (
                        <tr key={p.rate} style={{ backgroundColor: 'var(--surface)' }}>
                          <td className="px-3 py-2 font-medium text-[var(--ink)]">{p.rate}%</td>
                          <td
                            className={`px-3 py-2 text-right font-bold ${
                              isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatAmount(p.npv)}
                          </td>
                          <td className="px-3 py-2 text-right text-[var(--muted)]">
                            {isPositive ? 'Value Accretive' : 'Value Dilutive'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Formula Section */}
        {formulaMeta && (
          <div
            className="p-4 rounded-xl border space-y-2 mt-4"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
              <Info className="w-4 h-4" />
              <span>IRR Mathematical Foundations</span>
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

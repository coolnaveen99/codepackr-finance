import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, Download, Check } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateCagr, CAGR_ENGINE_VERSION } from '../../lib/financial/cagr';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface CagrCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const CagrCalculatorView: React.FC<CagrCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('cagr');

  const [initialValueStr, setInitialValueStr] = useState('100000');
  const [finalValueStr, setFinalValueStr] = useState('250000');
  const [tenureYearsStr, setTenureYearsStr] = useState('5');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const initialValue = parseFloat(initialValueStr) || 0;
  const finalValue = parseFloat(finalValueStr) || 0;
  const tenureYears = parseFloat(tenureYearsStr) || 1;

  const result = useMemo(
    () => calculateCagr({ initialValue, finalValue, tenureYears }),
    [initialValue, finalValue, tenureYears]
  );

  const handleReset = () => {
    setInitialValueStr('100000');
    setFinalValueStr('250000');
    setTenureYearsStr('5');
  };

  const handleExportCsv = () => {
    let csv = 'Year,Projected Portfolio Value,Cumulative Growth\n';
    result.trajectory.forEach((r) => {
      csv += `${r.year},${r.projectedValue.toFixed(2)},${r.cumulativeGrowth.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cagr-projection-${tenureYears}-years.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency & Actions Toolbar */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <CurrencySelector idPrefix="cagr-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              INITIAL INVESTMENT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={initialValueStr}
              onChange={(e) => handleCleanInput(e.target.value, setInitialValueStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="100000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              FINAL VALUE ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={finalValueStr}
              onChange={(e) => handleCleanInput(e.target.value, setFinalValueStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="250000"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                TENURE (YEARS)
              </label>
              <span className="text-xs font-mono font-bold text-[var(--brand)]">{tenureYears} yrs</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={tenureYearsStr}
              onChange={(e) => handleCleanInput(e.target.value, setTenureYearsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="5"
            />
          </div>
        </div>

        {/* Tenure Quick-Select Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-xs" style={{ color: 'var(--muted)' }}>
            Quick Tenures:
          </span>
          {[1, 3, 5, 7, 10, 15, 20].map((yr) => (
            <button
              key={yr}
              onClick={() => setTenureYearsStr(String(yr))}
              className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                tenureYears === yr
                  ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                  : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {yr}Y
            </button>
          ))}
        </div>

        {/* Results Highlight Card */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              CAGR (Annualized)
            </div>
            <div className="text-2xl font-black text-[var(--brand)] font-mono">
              {result.cagrPercent.toFixed(2)}%
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Geometric growth rate
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Absolute Gain
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.totalGain)}
            </div>
            <div className="text-[11px] mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              +{result.absoluteReturnPercent.toFixed(1)}% total
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Capital Multiple
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {result.multipleOfCapital.toFixed(2)}x
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Return on principal
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Terminal Wealth
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.finalValue)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              After {tenureYears} years
            </div>
          </div>
        </div>

        {/* Annual Trajectory Schedule */}
        {result.trajectory.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                Annual Growth Trajectory
              </h3>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:bg-[var(--surface-2)]"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                {copiedCsv ? 'Downloaded CSV' : 'Export CSV'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}>
                    <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>
                      Year
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>
                      Projected Portfolio Value
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>
                      Cumulative Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.trajectory.map((row) => (
                    <tr key={row.year} className="border-b" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-2 px-3 font-mono">
                        {row.year === 0 ? 'Year 0 (Start)' : `Year ${row.year}`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                        {formatAmount(row.projectedValue)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[var(--brand)]">
                        {row.cumulativeGrowth > 0 ? `+${formatAmount(row.cumulativeGrowth)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Methodology & Formula Card */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'CAGR = ((Final Value / Beginning Value) ^ (1 / Tenure)) - 1'}
            </p>
            <p>
              <strong>Assumptions:</strong> Assumes a constant geometric compounding rate over the holding period without interim withdrawals or additions.
            </p>
            <p>
              <strong>Model Version:</strong> {CAGR_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
            <p className="text-[11px]">
              Disclaimer: Historical returns smoothed by CAGR do not account for interim volatility, drawdown risk, or market timing. Provided for educational calculation only.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <TrendingUp className="w-3.5 h-3.5" />
          Want to model ongoing monthly investments? Try our SIP Calculator for periodic accumulation.
        </div>
      </div>
    </div>
  );
};

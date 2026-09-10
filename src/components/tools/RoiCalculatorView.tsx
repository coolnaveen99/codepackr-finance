import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, DollarSign } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateRoi, ROI_ENGINE_VERSION } from '../../lib/financial/roi';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface RoiCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const RoiCalculatorView: React.FC<RoiCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('roi');

  const [initialInvestmentStr, setInitialInvestmentStr] = useState('50000');
  const [finalValueStr, setFinalValueStr] = useState('85000');
  const [additionalCostsStr, setAdditionalCostsStr] = useState('3000');
  const [holdingPeriodYearsStr, setHoldingPeriodYearsStr] = useState('3');

  const initialInvestment = parseFloat(initialInvestmentStr) || 0;
  const finalValue = parseFloat(finalValueStr) || 0;
  const additionalCosts = parseFloat(additionalCostsStr) || 0;
  const holdingPeriodYears = parseFloat(holdingPeriodYearsStr) || 1;

  const result = useMemo(
    () => calculateRoi({ initialInvestment, finalValue, additionalCosts, holdingPeriodYears }),
    [initialInvestment, finalValue, additionalCosts, holdingPeriodYears]
  );

  const handleReset = () => {
    setInitialInvestmentStr('50000');
    setFinalValueStr('85000');
    setAdditionalCostsStr('3000');
    setHoldingPeriodYearsStr('3');
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency Toolbar */}
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
            <CurrencySelector idPrefix="roi-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              INITIAL INVESTMENT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={initialInvestmentStr}
              onChange={(e) => handleCleanInput(e.target.value, setInitialInvestmentStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="50000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              FINAL VALUE / PROCEEDS ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={finalValueStr}
              onChange={(e) => handleCleanInput(e.target.value, setFinalValueStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="85000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ADDITIONAL EXPENSES / FEES ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={additionalCostsStr}
              onChange={(e) => handleCleanInput(e.target.value, setAdditionalCostsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="3000"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                HOLDING DURATION
              </label>
              <span className="text-xs font-mono font-bold text-[var(--brand)]">{holdingPeriodYears} yrs</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={holdingPeriodYearsStr}
              onChange={(e) => handleCleanInput(e.target.value, setHoldingPeriodYearsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="3"
            />
          </div>
        </div>

        {/* Results Highlight Card */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Return on Investment
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                result.roiPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {result.roiPercentage >= 0 ? `+${result.roiPercentage.toFixed(2)}%` : `${result.roiPercentage.toFixed(2)}%`}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Total holding period return
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Annualized ROI (CAGR)
            </div>
            <div className="text-2xl font-bold font-mono text-[var(--brand)]">
              {result.annualizedRoiPercentage.toFixed(2)}%
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Per annum compounded
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Net Profit / Gain
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                result.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatAmount(result.netProfit)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Net of fees & costs
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Capital Multiple
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {result.capitalMultiple.toFixed(2)}x
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Cost basis {formatAmount(result.totalCostBasis)}
            </div>
          </div>
        </div>

        {/* Methodology Card */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'ROI = (Net Return / Cost Basis) * 100'}
            </p>
            <p>
              <strong>Annualized ROI:</strong> Annualized ROI = ((Final Value / Cost Basis) ^ (1 / Years) - 1) * 100.
            </p>
            <p>
              <strong>Model Version:</strong> {ROI_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

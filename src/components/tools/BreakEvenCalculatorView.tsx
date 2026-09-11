import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateBreakEven } from '../../lib/financial/breakEven';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface BreakEvenCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const BreakEvenCalculatorView: React.FC<BreakEvenCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('break-even');

  const [fixedCostsStr, setFixedCostsStr] = useState('50000');
  const [variableCostStr, setVariableCostStr] = useState('30');
  const [sellingPriceStr, setSellingPriceStr] = useState('50');
  const [expectedUnitsStr, setExpectedUnitsStr] = useState('3500');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const fixedCosts = parseFloat(fixedCostsStr) || 0;
  const variableCostPerUnit = parseFloat(variableCostStr) || 0;
  const sellingPricePerUnit = parseFloat(sellingPriceStr) || 0;
  const expectedUnits = expectedUnitsStr ? parseFloat(expectedUnitsStr) : undefined;

  const result = useMemo(
    () => calculateBreakEven({ fixedCosts, variableCostPerUnit, sellingPricePerUnit, expectedUnits }),
    [fixedCosts, variableCostPerUnit, sellingPricePerUnit, expectedUnits]
  );

  const handleReset = () => {
    setFixedCostsStr('50000');
    setVariableCostStr('30');
    setSellingPriceStr('50');
    setExpectedUnitsStr('3500');
  };

  const handleLoadPreset = (preset: 'saas' | 'ecommerce' | 'retail') => {
    if (preset === 'saas') {
      setFixedCostsStr('25000');
      setVariableCostStr('8');
      setSellingPriceStr('49');
      setExpectedUnitsStr('1000');
    } else if (preset === 'ecommerce') {
      setFixedCostsStr('50000');
      setVariableCostStr('30');
      setSellingPriceStr('65');
      setExpectedUnitsStr('2200');
    } else if (preset === 'retail') {
      setFixedCostsStr('18000');
      setVariableCostStr('7');
      setSellingPriceStr('20');
      setExpectedUnitsStr('2000');
    }
  };

  const handleExportCsv = () => {
    let csv = 'Units Sold,Fixed Overhead,Variable Costs,Total Costs,Gross Revenue,Operating Profit\n';
    result.costVolumeCurve.forEach((row) => {
      csv += `${row.units},${row.fixedCost},${row.variableCost},${row.totalCost},${row.revenue},${row.profit}\n`;
    });
    csv += `\nBreak-Even Volume (Units),${result.breakEvenUnits}\n`;
    csv += `Break-Even Revenue,${result.breakEvenRevenue}\n`;
    csv += `Contribution Margin / Unit,${result.contributionMarginPerUnit}\n`;
    csv += `Contribution Margin Ratio,${result.contributionMarginRatio}%\n`;
    csv += `Margin of Safety (Units),${result.marginOfSafetyUnits}\n`;
    csv += `Margin of Safety (%),${result.marginOfSafetyPercent}%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'break-even-analysis.csv');
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
              onClick={() => handleLoadPreset('ecommerce')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              E-Commerce
            </button>
            <button
              onClick={() => handleLoadPreset('saas')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              SaaS Recurring
            </button>
            <button
              onClick={() => handleLoadPreset('retail')}
              className="px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Local Retail
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
            <CurrencySelector idPrefix="breakeven-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
              TOTAL FIXED COSTS ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fixedCostsStr}
              onChange={(e) => handleCleanInput(e.target.value, setFixedCostsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="50000"
            />
            <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
              Rent, salaries, software, overhead
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
              VARIABLE COST / UNIT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={variableCostStr}
              onChange={(e) => handleCleanInput(e.target.value, setVariableCostStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="30"
            />
            <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
              Materials, direct packaging, shipping
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
              SELLING PRICE / UNIT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={sellingPriceStr}
              onChange={(e) => handleCleanInput(e.target.value, setSellingPriceStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="50"
            />
            <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
              Price charged per customer unit
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
              EXPECTED UNIT SALES
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={expectedUnitsStr}
              onChange={(e) => handleCleanInput(e.target.value, setExpectedUnitsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="3500"
            />
            <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
              For Margin of Safety calculation
            </span>
          </div>
        </div>

        {/* Primary Results Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Break-Even Volume
            </span>
            <div className="text-2xl font-extrabold font-mono mt-1 text-[var(--brand)]">
              {result.isAchievable ? `${result.breakEvenUnits.toLocaleString()} Units` : 'Unachievable'}
            </div>
            <span className="text-[11px] text-[var(--muted)] block mt-1">
              {result.isAchievable ? `Requires selling ${result.breakEvenUnits.toLocaleString()} units` : 'Price ≤ Variable cost'}
            </span>
          </div>

          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Break-Even Revenue
            </span>
            <div className="text-2xl font-extrabold font-mono mt-1 text-[var(--ink)]">
              {result.isAchievable ? formatAmount(result.breakEvenRevenue) : 'N/A'}
            </div>
            <span className="text-[11px] text-[var(--muted)] block mt-1">
              Minimum gross turnover needed
            </span>
          </div>

          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Contribution Margin
            </span>
            <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
              {formatAmount(result.contributionMarginPerUnit)}
            </div>
            <span className="text-[11px] text-[var(--muted)] block mt-1">
              Margin Ratio: {result.contributionMarginRatio}%
            </span>
          </div>

          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Margin of Safety
            </span>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                result.marginOfSafetyUnits >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {result.marginOfSafetyUnits >= 0 ? `+${result.marginOfSafetyUnits.toLocaleString()} Units` : `${result.marginOfSafetyUnits.toLocaleString()} Units`}
            </div>
            <span className="text-[11px] text-[var(--muted)] block mt-1">
              Buffer: {result.marginOfSafetyPercent}% above break-even
            </span>
          </div>
        </div>

        {/* Expected Sales Forecast Summary */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between flex-wrap gap-4"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <span className="text-xs font-bold text-[var(--brand)] uppercase tracking-wider block">
              Expected Operating Profit Forecast ({result.expectedUnits.toLocaleString()} Units)
            </span>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Gross Revenue {formatAmount(result.revenueAtExpected)} − Total Operating Costs {formatAmount(result.totalCostAtExpected)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[var(--muted)] block">Projected Profit / (Loss)</span>
            <span
              className={`text-xl font-extrabold font-mono ${
                result.profitAtExpected >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {result.profitAtExpected >= 0 ? `+${formatAmount(result.profitAtExpected)}` : `-${formatAmount(Math.abs(result.profitAtExpected))}`}
            </span>
          </div>
        </div>

        {/* CVP Schedule Table */}
        {result.costVolumeCurve.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Cost-Volume-Profit (CVP) Sensitivity Schedule
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
                    <th className="px-3 py-2 font-semibold">Volume (Units)</th>
                    <th className="px-3 py-2 font-semibold text-right">Fixed Overhead</th>
                    <th className="px-3 py-2 font-semibold text-right">Variable Costs</th>
                    <th className="px-3 py-2 font-semibold text-right">Total Costs</th>
                    <th className="px-3 py-2 font-semibold text-right">Gross Revenue</th>
                    <th className="px-3 py-2 font-semibold text-right">Operating Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  {result.costVolumeCurve.map((row) => {
                    const isProfit = row.profit > 0;
                    const isLoss = row.profit < 0;
                    return (
                      <tr key={row.units} style={{ backgroundColor: 'var(--surface)' }}>
                        <td className="px-3 py-2 font-medium text-[var(--ink)]">{row.units.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-[var(--muted)]">{formatAmount(row.fixedCost)}</td>
                        <td className="px-3 py-2 text-right text-[var(--muted)]">{formatAmount(row.variableCost)}</td>
                        <td className="px-3 py-2 text-right text-[var(--ink)]">{formatAmount(row.totalCost)}</td>
                        <td className="px-3 py-2 text-right text-[var(--ink)]">{formatAmount(row.revenue)}</td>
                        <td
                          className={`px-3 py-2 text-right font-bold ${
                            isProfit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isLoss
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-[var(--ink)]'
                          }`}
                        >
                          {row.profit >= 0 ? `+${formatAmount(row.profit)}` : `-${formatAmount(Math.abs(row.profit))}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Methodology & Formula Section */}
        {formulaMeta && (
          <div
            className="p-4 rounded-xl border space-y-2 mt-4"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
              <Info className="w-4 h-4" />
              <span>Break-Even & CVP Formula Fundamentals</span>
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

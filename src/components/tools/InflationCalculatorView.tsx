import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, AlertCircle, Download, Check } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateInflation, INFLATION_ENGINE_VERSION } from '../../lib/financial/inflation';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface InflationCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const InflationCalculatorView: React.FC<InflationCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('inflation');

  const [currentAmountStr, setCurrentAmountStr] = useState('50000');
  const [inflationRateStr, setInflationRateStr] = useState('6.0');
  const [timeHorizonStr, setTimeHorizonStr] = useState('10');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const currentAmount = parseFloat(currentAmountStr) || 0;
  const annualInflationRate = parseFloat(inflationRateStr) || 0;
  const timeHorizonYears = parseFloat(timeHorizonStr) || 1;

  const result = useMemo(
    () => calculateInflation({ currentAmount, annualInflationRate, timeHorizonYears }),
    [currentAmount, annualInflationRate, timeHorizonYears]
  );

  const handleReset = () => {
    setCurrentAmountStr('50000');
    setInflationRateStr('6.0');
    setTimeHorizonStr('10');
  };

  const handleExportCsv = () => {
    let csv = 'Year,Future Cost of Goods,Real Purchasing Power,Purchasing Power Lost (%)\n';
    result.timeline.forEach((r) => {
      csv += `${r.year},${r.futureCost.toFixed(2)},${r.purchasingPower.toFixed(2)},${r.purchasingPowerLossPercent.toFixed(1)}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inflation-projection-${timeHorizonYears}-years.csv`);
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
            <CurrencySelector idPrefix="inflation-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              CURRENT EXPENSE / AMOUNT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentAmountStr}
              onChange={(e) => handleCleanInput(e.target.value, setCurrentAmountStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="50000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ANNUAL INFLATION RATE (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inflationRateStr}
              onChange={(e) => handleCleanInput(e.target.value, setInflationRateStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="6.0"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                TIME HORIZON (YEARS)
              </label>
              <span className="text-xs font-mono font-bold text-[var(--brand)]">{timeHorizonYears} yrs</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={timeHorizonStr}
              onChange={(e) => handleCleanInput(e.target.value, setTimeHorizonStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="10"
            />
          </div>
        </div>

        {/* Inflation Rate Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold" style={{ color: 'var(--muted)' }}>
            Inflation Presets:
          </span>
          {[
            { label: '4.0% (Central Bank Target)', val: '4.0' },
            { label: '6.0% (India Average)', val: '6.0' },
            { label: '8.0% (Education/Medical)', val: '8.0' },
            { label: '10.0% (High Inflation)', val: '10.0' },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setInflationRateStr(item.val)}
              className={`px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                inflationRateStr === item.val
                  ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                  : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {item.label}
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
              Future Required Cost
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatAmount(result.futureCost)}
            </div>
            <div className="text-[11px] mt-0.5 font-semibold text-rose-500">
              +{result.costIncreasePercentage.toFixed(1)}% price escalation
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Future Purchasing Power
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.futurePurchasingPower)}
            </div>
            <div className="text-[11px] mt-0.5 text-amber-600 dark:text-amber-400 font-semibold">
              -{result.purchasingPowerLossPercentage.toFixed(1)}% real value lost
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Price Doubling Period
            </div>
            <div className="text-2xl font-bold font-mono text-[var(--brand)]">
              {result.ruleOf72DoublingYears > 0 ? `${result.ruleOf72DoublingYears.toFixed(1)} Yrs` : '—'}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Rule of 72 timeline
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Today’s Value
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.currentAmount)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Baseline baseline basket
            </div>
          </div>
        </div>

        {/* Timeline Schedule */}
        {result.timeline.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
                Year-by-Year Inflation Escalation
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
                      Future Cost of Goods
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>
                      Real Purchasing Power of Current Savings
                    </th>
                    <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>
                      Erosion Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.timeline.map((row) => (
                    <tr key={row.year} className="border-b" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-2 px-3 font-mono">
                        {row.year === 0 ? 'Today' : `Year ${row.year}`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                        {formatAmount(row.futureCost)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[var(--ink)]">
                        {formatAmount(row.purchasingPower)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                        {row.purchasingPowerLossPercent > 0 ? `-${row.purchasingPowerLossPercent.toFixed(1)}%` : '0%'}
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
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'Future Cost = PV * (1 + i)^n; Purchasing Power = PV / (1 + i)^n'}
            </p>
            <p>
              <strong>Assumptions:</strong> Constant geometric inflation rate across the duration. Sectoral inflation (e.g. healthcare, college tuition) frequently outpaces general consumer price inflation.
            </p>
            <p>
              <strong>Model Version:</strong> {INFLATION_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
            <p className="text-[11px]">
              Disclaimer: Provided for personal financial estimation and educational planning purposes only. Actual historical inflation fluctuates based on central bank monetary policy and commodity price cycles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Holding uninvested cash in zero-interest accounts guarantees real purchasing power loss over time. Consider inflation-beating asset classes.
        </div>
      </div>
    </div>
  );
};

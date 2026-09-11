import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, Download, Building2, DollarSign, Layers } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateBusinessValuation,
  INDUSTRY_PRESETS,
  ValuationMethod,
} from '../../lib/financial/businessValuation';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface BusinessValuationCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const BusinessValuationCalculatorView: React.FC<BusinessValuationCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('business-valuation');

  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('saas');
  const [method, setMethod] = useState<ValuationMethod>('revenue');
  const [metricValueStr, setMetricValueStr] = useState('2000000');
  const [lowMultipleStr, setLowMultipleStr] = useState('4.0');
  const [baseMultipleStr, setBaseMultipleStr] = useState('7.5');
  const [highMultipleStr, setHighMultipleStr] = useState('12.0');
  const [netDebtStr, setNetDebtStr] = useState('0');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const metricValue = parseFloat(metricValueStr) || 0;
  const lowMultiple = parseFloat(lowMultipleStr) || 2.0;
  const baseMultiple = parseFloat(baseMultipleStr) || 3.5;
  const highMultiple = parseFloat(highMultipleStr) || 5.0;
  const netDebt = parseFloat(netDebtStr) || 0;

  const result = useMemo(
    () =>
      calculateBusinessValuation({
        method,
        metricValue,
        multiples: {
          low: lowMultiple,
          base: baseMultiple,
          high: highMultiple,
        },
        netDebt,
      }),
    [method, metricValue, lowMultiple, baseMultiple, highMultiple, netDebt]
  );

  const handleApplyPreset = (presetKey: string) => {
    setSelectedPresetKey(presetKey);
    const preset = INDUSTRY_PRESETS[presetKey];
    if (preset) {
      setMethod(preset.defaultMethod);
      setLowMultipleStr(preset.multiples.low.toString());
      setBaseMultipleStr(preset.multiples.base.toString());
      setHighMultipleStr(preset.multiples.high.toString());
    }
  };

  const handleReset = () => {
    setSelectedPresetKey('saas');
    setMethod('revenue');
    setMetricValueStr('2000000');
    setLowMultipleStr('4.0');
    setBaseMultipleStr('7.5');
    setHighMultipleStr('12.0');
    setNetDebtStr('0');
  };

  const handleExportCsv = () => {
    let csv = 'Valuation Multiple,Enterprise Value,Equity Value\n';
    result.sensitivityTable.forEach((row) => {
      csv += `${row.multiple}x,${row.enterpriseValue},${row.equityValue}\n`;
    });
    csv += `\nValuation Method,${method.toUpperCase()}\n`;
    csv += `Normalized Financial Metric,${metricValue}\n`;
    csv += `Net Debt,${netDebt}\n`;
    csv += `Base Enterprise Value,${result.scenarios.base.enterpriseValue}\n`;
    csv += `Base Equity Value,${result.scenarios.base.equityValue}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'business-valuation-analysis.csv');
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset parameters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <CurrencySelector idPrefix="valuation-currency" variant="pill" />
          </div>
        </div>

        {/* Industry Presets Selector */}
        <div>
          <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--muted)' }}>
            INDUSTRY BENCHMARK PRESETS
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.values(INDUSTRY_PRESETS).map((p) => {
              const isSelected = selectedPresetKey === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10 font-bold text-[var(--brand)]'
                      : 'hover:bg-[var(--surface-2)] text-[var(--ink)]'
                  }`}
                  style={{ borderColor: isSelected ? 'var(--brand)' : 'var(--line)' }}
                >
                  <span className="block font-semibold truncate">{p.name}</span>
                  <span className="text-[10px] text-[var(--muted)] block mt-0.5">
                    {p.multiples.base}x {p.defaultMethod.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Method & Metric Input */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
                VALUATION METHODOLOGY
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['revenue', 'ebitda', 'sde'] as ValuationMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-1.5 text-xs font-bold rounded-lg border uppercase transition-colors cursor-pointer ${
                      method === m
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                        : 'border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                {method.toUpperCase()} VALUE ({currency.symbol.trim()})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={metricValueStr}
                onChange={(e) => handleCleanInput(e.target.value, setMetricValueStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder="2000000"
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Normalized annual {method === 'revenue' ? 'revenue' : method === 'ebitda' ? 'EBITDA' : 'SDE'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                NET DEBT / (CASH) ({currency.symbol.trim()})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={netDebtStr}
                onChange={(e) => handleCleanInput(e.target.value, setNetDebtStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder="0"
              />
              <span className="text-[11px] block mt-1" style={{ color: 'var(--muted)' }}>
                Total Debt minus Cash (Equity Bridge)
              </span>
            </div>
          </div>

          {/* Multiple Multi-Sliders/Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand)]">
              Valuation Multiple Bands
            </h3>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                CONSERVATIVE MULTIPLE
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={lowMultipleStr}
                  onChange={(e) => handleCleanInput(e.target.value, setLowMultipleStr)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
                <span className="text-xs font-bold text-[var(--muted)]">x</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                BASE MULTIPLE (MARKET AVERAGE)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={baseMultipleStr}
                  onChange={(e) => handleCleanInput(e.target.value, setBaseMultipleStr)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
                <span className="text-xs font-bold text-[var(--muted)]">x</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--muted)' }}>
                OPTIMISTIC MULTIPLE
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={highMultipleStr}
                  onChange={(e) => handleCleanInput(e.target.value, setHighMultipleStr)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
                <span className="text-xs font-bold text-[var(--muted)]">x</span>
              </div>
            </div>
          </div>

          {/* Industry Preset Description Card */}
          <div
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand)] block">
                {INDUSTRY_PRESETS[selectedPresetKey]?.name || 'Industry Profile'}
              </span>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {INDUSTRY_PRESETS[selectedPresetKey]?.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t text-[11px]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              Equity Value = Enterprise Value − Net Debt
            </div>
          </div>
        </div>

        {/* 3 Scenario Results Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conservative */}
          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Conservative ({result.scenarios.conservative.multiple}x)
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>ENTERPRISE VALUE</span>
              <div className="text-xl font-bold font-mono text-[var(--ink)]">
                {formatAmount(result.scenarios.conservative.enterpriseValue)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>IMPLIED EQUITY VALUE</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatAmount(result.scenarios.conservative.equityValue)}
              </div>
            </div>
          </div>

          {/* Base Scenario (Highlighted) */}
          <div
            className="p-5 rounded-2xl border-2 border-[var(--brand)] relative shadow-lg"
            style={{ backgroundColor: 'var(--surface-2)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                Base Case ({result.scenarios.base.multiple}x)
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[var(--brand)] text-white">
                Primary
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>ENTERPRISE VALUE</span>
              <div className="text-2xl font-extrabold font-mono text-[var(--ink)]">
                {formatAmount(result.scenarios.base.enterpriseValue)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>IMPLIED EQUITY VALUE</span>
              <div className="text-2xl font-extrabold font-mono text-[var(--brand)]">
                {formatAmount(result.scenarios.base.equityValue)}
              </div>
            </div>
          </div>

          {/* Optimistic */}
          <div
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Optimistic ({result.scenarios.optimistic.multiple}x)
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>ENTERPRISE VALUE</span>
              <div className="text-xl font-bold font-mono text-[var(--ink)]">
                {formatAmount(result.scenarios.optimistic.enterpriseValue)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <span className="text-[11px] block" style={{ color: 'var(--muted)' }}>IMPLIED EQUITY VALUE</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatAmount(result.scenarios.optimistic.equityValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Multiples Valuation Sensitivity Grid
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
                  <th className="px-3 py-2 font-semibold">Multiple</th>
                  <th className="px-3 py-2 font-semibold text-right">Enterprise Value</th>
                  <th className="px-3 py-2 font-semibold text-right">Net Debt Adjustment</th>
                  <th className="px-3 py-2 font-semibold text-right">Implied Equity Value</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                {result.sensitivityTable.map((row) => (
                  <tr key={row.multiple} style={{ backgroundColor: 'var(--surface)' }}>
                    <td className="px-3 py-2 font-medium text-[var(--ink)]">{row.multiple}x</td>
                    <td className="px-3 py-2 text-right text-[var(--ink)]">{formatAmount(row.enterpriseValue)}</td>
                    <td className="px-3 py-2 text-right text-[var(--muted)]">
                      {netDebt !== 0 ? `-${formatAmount(netDebt)}` : '0'}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatAmount(row.equityValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <span>Valuation Multiples Methodology & Theory</span>
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

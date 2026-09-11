import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Percent, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateWacc, WaccInputs } from '../../lib/financial/wacc';

interface WaccCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const WaccCalculatorView: React.FC<WaccCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [costOfEquityMode, setCostOfEquityMode] = useState<'direct' | 'capm'>('direct');
  const [equityMarketValueStr, setEquityMarketValueStr] = useState('7000000');
  const [costOfEquityStr, setCostOfEquityStr] = useState('11.5');
  const [riskFreeRateStr, setRiskFreeRateStr] = useState('4.2');
  const [betaStr, setBetaStr] = useState('1.15');
  const [equityRiskPremiumStr, setEquityRiskPremiumStr] = useState('5.5');

  const [debtMarketValueStr, setDebtMarketValueStr] = useState('3000000');
  const [preTaxCostOfDebtStr, setPreTaxCostOfDebtStr] = useState('6.5');
  const [corporateTaxRateStr, setCorporateTaxRateStr] = useState('25');

  const equityMarketValue = parseFloat(equityMarketValueStr) || 0;
  const directCostOfEquity = parseFloat(costOfEquityStr) || 0;
  const riskFreeRate = parseFloat(riskFreeRateStr) || 4.2;
  const beta = parseFloat(betaStr) || 1.15;
  const equityRiskPremium = parseFloat(equityRiskPremiumStr) || 5.5;

  const debtMarketValue = parseFloat(debtMarketValueStr) || 0;
  const preTaxCostOfDebt = parseFloat(preTaxCostOfDebtStr) || 0;
  const corporateTaxRate = parseFloat(corporateTaxRateStr) || 0;

  const result = useMemo(() => {
    const inputs: WaccInputs = {
      equityMarketValue,
      costOfEquity: costOfEquityMode === 'direct' ? directCostOfEquity : undefined,
      riskFreeRate,
      beta,
      equityRiskPremium,
      debtMarketValue,
      preTaxCostOfDebt,
      corporateTaxRate,
    };
    return calculateWacc(inputs);
  }, [
    costOfEquityMode,
    equityMarketValue,
    directCostOfEquity,
    riskFreeRate,
    beta,
    equityRiskPremium,
    debtMarketValue,
    preTaxCostOfDebt,
    corporateTaxRate,
  ]);

  const handleReset = () => {
    setCostOfEquityMode('direct');
    setEquityMarketValueStr('7000000');
    setCostOfEquityStr('11.5');
    setRiskFreeRateStr('4.2');
    setBetaStr('1.15');
    setEquityRiskPremiumStr('5.5');
    setDebtMarketValueStr('3000000');
    setPreTaxCostOfDebtStr('6.5');
    setCorporateTaxRateStr('25');
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
        <div className="lg:col-span-6 space-y-5">
          {/* Equity Section */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                1. Cost of Equity (E)
              </h3>
              <div className="flex rounded-lg border p-0.5 text-[11px]" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setCostOfEquityMode('direct')}
                  className={`px-2.5 py-0.5 font-bold rounded-md transition-colors ${
                    costOfEquityMode === 'direct' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Direct %
                </button>
                <button
                  type="button"
                  onClick={() => setCostOfEquityMode('capm')}
                  className={`px-2.5 py-0.5 font-bold rounded-md transition-colors ${
                    costOfEquityMode === 'capm' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  CAPM Model
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Market Value of Equity (E)
              </label>
              <input
                type="text"
                value={equityMarketValueStr}
                onChange={(e) => handleCleanInput(e.target.value, setEquityMarketValueStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="7000000"
              />
            </div>

            {costOfEquityMode === 'direct' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cost of Equity (Re %)
                </label>
                <input
                  type="text"
                  value={costOfEquityStr}
                  onChange={(e) => handleCleanInput(e.target.value, setCostOfEquityStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="11.5"
                />
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border" style={{ borderColor: 'var(--line)' }}>
                <div className="text-[11px] font-semibold text-slate-500">
                  CAPM: Re = Rf + β × ERP
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Risk-free (Rf %)
                    </label>
                    <input
                      type="text"
                      value={riskFreeRateStr}
                      onChange={(e) => handleCleanInput(e.target.value, setRiskFreeRateStr)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs border font-mono"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                      placeholder="4.2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Beta (β)
                    </label>
                    <input
                      type="text"
                      value={betaStr}
                      onChange={(e) => handleCleanInput(e.target.value, setBetaStr)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs border font-mono"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                      placeholder="1.15"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      ERP (Rm - Rf %)
                    </label>
                    <input
                      type="text"
                      value={equityRiskPremiumStr}
                      onChange={(e) => handleCleanInput(e.target.value, setEquityRiskPremiumStr)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs border font-mono"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                      placeholder="5.5"
                    />
                  </div>
                </div>
                <div className="text-right text-xs font-bold text-blue-600 dark:text-blue-400">
                  Computed Re: {result.costOfEquity.toFixed(2)}%
                </div>
              </div>
            )}
          </div>

          {/* Debt Section */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              2. Cost of Debt &amp; Taxes (D)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Market Value of Debt (D)
              </label>
              <input
                type="text"
                value={debtMarketValueStr}
                onChange={(e) => handleCleanInput(e.target.value, setDebtMarketValueStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="3000000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pre-Tax Cost of Debt (Rd %)
                </label>
                <input
                  type="text"
                  value={preTaxCostOfDebtStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPreTaxCostOfDebtStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Tax Rate (Tc %)
                </label>
                <input
                  type="text"
                  value={corporateTaxRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setCorporateTaxRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                After-Tax Cost of Debt: <span className="font-mono font-bold">Rd × (1 - Tc)</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {result.effectiveCostOfDebt.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main WACC Hero Banner */}
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weighted Average Cost of Capital
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Total Firm Capital: {formatAmount(result.totalCapital)}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Firm Hurdle Rate / WACC
              </span>
              <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
                {result.wacc.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Minimum required rate of return for projects of equivalent corporate risk
              </p>
            </div>

            {/* Capital Structure Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-600 dark:text-blue-400">
                  Equity: {(result.equityWeight * 100).toFixed(1)}% ({formatAmount(equityMarketValue)})
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Debt: {(result.debtWeight * 100).toFixed(1)}% ({formatAmount(debtMarketValue)})
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${result.equityWeight * 100}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${result.debtWeight * 100}%` }}
                />
              </div>
            </div>

            {/* Component Contributions Table */}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Component</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Weight (W)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Cost (K)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">Equity (E)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {(result.equityWeight * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {result.costOfEquity.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {result.equityContribution.toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">After-tax Debt (D)</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {(result.debtWeight * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {result.effectiveCostOfDebt.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {result.debtContribution.toFixed(2)}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white">Blended WACC</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">100.0%</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">-</td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 text-sm">
                      {result.wacc.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Shield Benefit */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Debt Interest Tax Shield Benefit
                </span>
                <span className="text-[11px] text-slate-500">
                  Annual rate reduction attributable to corporate interest tax deductibility
                </span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                -{result.taxShieldSavingsRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Methodological Context */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Understanding WACC &amp; Corporate Hurdle Rates
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Capital Structure Weights</span>
            Uses market values of Equity and Debt rather than book values, representing the true cost of raising replacement capital today.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Interest Tax Deductibility</span>
            Because interest on debt is tax-deductible in most jurisdictions, debt cost is adjusted by (1 - Tax Rate), providing a tax shield.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Capital Budgeting Benchmark</span>
            Any corporate capital investment or acquisition with expected IRR exceeding WACC generates positive economic profit (EVA).
          </div>
        </div>
      </div>
    </div>
  );
};

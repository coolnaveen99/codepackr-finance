import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateCapitalGainsTax,
  CapitalGainsInputs,
  AssetClass,
} from '../../lib/financial/capitalGainsTax';

interface CapitalGainsTaxCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const CapitalGainsTaxCalculatorView: React.FC<
  CapitalGainsTaxCalculatorViewProps
> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { formatAmount } = useCurrency();

  const [assetClass, setAssetClass] = useState<AssetClass>('equity');
  const [purchasePriceStr, setPurchasePriceStr] = useState('200000');
  const [salePriceStr, setSalePriceStr] = useState('450000');
  const [transferExpensesStr, setTransferExpensesStr] = useState('1500');
  const [holdingPeriodMonthsStr, setHoldingPeriodMonthsStr] = useState('24');
  const [marginalTaxRateStr, setMarginalTaxRateStr] = useState('30');

  const purchasePrice = parseFloat(purchasePriceStr) || 0;
  const salePrice = parseFloat(salePriceStr) || 0;
  const transferExpenses = parseFloat(transferExpensesStr) || 0;
  const holdingPeriodMonths = parseFloat(holdingPeriodMonthsStr) || 0;
  const marginalTaxRate = parseFloat(marginalTaxRateStr) || 30;

  const result = useMemo(() => {
    const inputs: CapitalGainsInputs = {
      assetClass,
      purchasePrice,
      salePrice,
      transferExpenses,
      holdingPeriodMonths,
      marginalTaxRate,
    };
    return calculateCapitalGainsTax(inputs);
  }, [
    assetClass,
    purchasePrice,
    salePrice,
    transferExpenses,
    holdingPeriodMonths,
    marginalTaxRate,
  ]);

  const handleReset = () => {
    setAssetClass('equity');
    setPurchasePriceStr('200000');
    setSalePriceStr('450000');
    setTransferExpensesStr('1500');
    setHoldingPeriodMonthsStr('24');
    setMarginalTaxRateStr('30');
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
        <div className="lg:col-span-5 space-y-5">
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Transaction Details &amp; Asset Class
            </h3>

            {/* Asset Class Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Asset Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAssetClass('equity')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
                    assetClass === 'equity'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Listed Equity / MF
                </button>
                <button
                  type="button"
                  onClick={() => setAssetClass('real-estate')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
                    assetClass === 'real-estate'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Real Estate / Land
                </button>
                <button
                  type="button"
                  onClick={() => setAssetClass('debt-unlisted')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-colors ${
                    assetClass === 'debt-unlisted'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Debt / Unlisted
                </button>
              </div>
            </div>

            {/* Buy / Sell Prices */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Price
                </label>
                <input
                  type="text"
                  value={purchasePriceStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPurchasePriceStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="200000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sale / Realized Price
                </label>
                <input
                  type="text"
                  value={salePriceStr}
                  onChange={(e) => handleCleanInput(e.target.value, setSalePriceStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="450000"
                />
              </div>
            </div>

            {/* Transfer Expenses */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Expenses (Brokerage, STT, Legal, Stamp Duty)
              </label>
              <input
                type="text"
                value={transferExpensesStr}
                onChange={(e) => handleCleanInput(e.target.value, setTransferExpensesStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="1500"
              />
            </div>

            {/* Holding Period */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Holding Duration (Months)
              </label>
              <input
                type="text"
                value={holdingPeriodMonthsStr}
                onChange={(e) => handleCleanInput(e.target.value, setHoldingPeriodMonthsStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="24"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Threshold for LTCG: {result.thresholdMonths} Months (
                {(result.thresholdMonths / 12).toFixed(0)} year{result.thresholdMonths > 12 ? 's' : ''})
              </span>
            </div>

            {/* Marginal Income Slab Rate */}
            {(assetClass === 'debt-unlisted' || (assetClass === 'real-estate' && result.gainType === 'short-term')) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Marginal Income Tax Slab (%)
                </label>
                <input
                  type="text"
                  value={marginalTaxRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setMarginalTaxRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="30"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-7 space-y-5">
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tax Liability Assessment
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  result.gainType === 'long-term'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {result.gainType} Gain
              </span>
            </div>

            {/* Tax Payable Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Estimated Capital Gains Tax Payable
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.taxPayable)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Applicable Tax Rate: {result.effectiveTaxRate}% on {formatAmount(result.taxableCapitalGain)} taxable gains
              </p>
            </div>

            {/* Financial Ledger Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Net Realized Gain</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.netGainOrLoss)}
                </div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Exemptions Claimed</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatAmount(result.exemptionClaimed)}
                </div>
              </div>
            </div>

            {/* Post-Tax Net Proceeds */}
            <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Post-Tax Net Cash Proceeds
                </span>
                <span className="text-[11px] text-slate-500">
                  Sale proceeds minus expenses and tax payable
                </span>
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {formatAmount(result.netPostTaxProceeds)}
              </div>
            </div>

            {/* Statutory Notes List */}
            {result.notes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border space-y-1.5" style={{ borderColor: 'var(--line)' }}>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Applicable Statutory Provisions (Budget 2024 Amendments)
                </span>
                {result.notes.map((n, i) => (
                  <p key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">&bull;</span>
                    <span>{n}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Capital Gains Tax Framework (Budget 2024 Updates)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Equity LTCG Exemption</span>
            Long-term capital gains on listed shares and equity mutual funds are tax-exempt up to ₹1,25,000 per financial year (increased from ₹1 Lakh in July 2024).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Revised Equity Rates</span>
            STCG under Section 111A is increased to 20% (up from 15%), and LTCG under Section 112A is 12.5% (up from 10%).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Property Without Indexation</span>
            Long-term gains on immovable property held &gt; 24 months are taxed at 12.5% without indexation benefits for properties acquired after July 23, 2024.
          </div>
        </div>
      </div>
    </div>
  );
};

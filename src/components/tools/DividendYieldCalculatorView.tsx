import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Coins, RefreshCw, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateDividendYield,
  DividendYieldInputs,
} from '../../lib/financial/dividendYield';

interface DividendYieldCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const DividendYieldCalculatorView: React.FC<DividendYieldCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [sharePriceStr, setSharePriceStr] = useState('120');
  const [annualDividendPerShareStr, setAnnualDividendPerShareStr] = useState('4.80');
  const [purchasePricePerShareStr, setPurchasePricePerShareStr] = useState('80');
  const [numberOfSharesStr, setNumberOfSharesStr] = useState('500');
  const [holdingYearsStr, setHoldingYearsStr] = useState('10');
  const [annualDividendGrowthRateStr, setAnnualDividendGrowthRateStr] = useState('6.0');
  const [annualStockAppreciationRateStr, setAnnualStockAppreciationRateStr] = useState('5.0');
  const [reinvestDividends, setReinvestDividends] = useState(true);

  const sharePrice = parseFloat(sharePriceStr) || 0;
  const annualDividendPerShare = parseFloat(annualDividendPerShareStr) || 0;
  const purchasePricePerShare = parseFloat(purchasePricePerShareStr) || undefined;
  const numberOfShares = parseFloat(numberOfSharesStr) || 1;
  const holdingYears = parseFloat(holdingYearsStr) || 10;
  const annualDividendGrowthRate = parseFloat(annualDividendGrowthRateStr) || 0;
  const annualStockAppreciationRate = parseFloat(annualStockAppreciationRateStr) || 0;

  const result = useMemo(() => {
    const inputs: DividendYieldInputs = {
      sharePrice,
      annualDividendPerShare,
      purchasePricePerShare,
      numberOfShares,
      holdingYears,
      annualDividendGrowthRate,
      annualStockAppreciationRate,
      reinvestDividends,
    };
    return calculateDividendYield(inputs);
  }, [
    sharePrice,
    annualDividendPerShare,
    purchasePricePerShare,
    numberOfShares,
    holdingYears,
    annualDividendGrowthRate,
    annualStockAppreciationRate,
    reinvestDividends,
  ]);

  const handleReset = () => {
    setSharePriceStr('120');
    setAnnualDividendPerShareStr('4.80');
    setPurchasePricePerShareStr('80');
    setNumberOfSharesStr('500');
    setHoldingYearsStr('10');
    setAnnualDividendGrowthRateStr('6.0');
    setAnnualStockAppreciationRateStr('5.0');
    setReinvestDividends(true);
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
              <Coins className="w-4 h-4 text-blue-500" />
              Stock &amp; Dividend Profile
            </h3>

            {/* Price & Dividend */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Market Price
                </label>
                <input
                  type="text"
                  value={sharePriceStr}
                  onChange={(e) => handleCleanInput(e.target.value, setSharePriceStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Dividend / Share
                </label>
                <input
                  type="text"
                  value={annualDividendPerShareStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualDividendPerShareStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="4.80"
                />
              </div>
            </div>

            {/* Position Size & Cost Basis */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shares Owned
                </label>
                <input
                  type="text"
                  value={numberOfSharesStr}
                  onChange={(e) => handleCleanInput(e.target.value, setNumberOfSharesStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Cost Basis / Share
                </label>
                <input
                  type="text"
                  value={purchasePricePerShareStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPurchasePricePerShareStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="80"
                />
              </div>
            </div>

            {/* Growth & Reinvestment */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dividend Growth (%/yr)
                </label>
                <input
                  type="text"
                  value={annualDividendGrowthRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualDividendGrowthRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Price Growth (%/yr)
                </label>
                <input
                  type="text"
                  value={annualStockAppreciationRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualStockAppreciationRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="5.0"
                />
              </div>
            </div>

            {/* DRIP Reinvestment Toggle */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <button
                type="button"
                onClick={() => setReinvestDividends(!reinvestDividends)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors ${
                  reinvestDividends
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  DRIP Mode (Reinvest All Dividends)
                </span>
                <span>{reinvestDividends ? 'Active' : 'Cash Payout'}</span>
              </button>
            </div>
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
                Income &amp; Total Return Yields
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                DRIP {reinvestDividends ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Dividend Yield Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 border border-emerald-200/60 dark:border-emerald-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Current Forward Dividend Yield
              </span>
              <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
                {result.currentDividendYield.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Annual cash flow: {formatAmount(result.annualDividendIncome)} ({formatAmount(result.monthlyDividendIncome)}/month)
              </p>
            </div>

            {/* Yield on Cost Highlight */}
            {result.yieldOnCost !== undefined && (
              <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Yield on Cost (YOC)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Annual dividend yield based on your original purchase price of {formatAmount(purchasePricePerShare!)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {result.yieldOnCost.toFixed(2)}%
                </div>
              </div>
            )}

            {/* 10-Year DRIP Compounding Result Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 font-medium block">
                  Projected Portfolio Value (Yr {holdingYears})
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.projectedPortfolioValue)}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Ending Shares: {result.endingSharesCount.toFixed(1)} shares
                </span>
              </div>

              <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 font-medium block">
                  Cumulative Dividends Collected
                </span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatAmount(result.cumulativeDividendsReceived)}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Over {holdingYears} years of ownership
                </span>
              </div>
            </div>
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
          The Power of Dividend Growth &amp; DRIP Compounding
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Yield on Cost (YOC)</span>
            As companies raise payouts year after year, your cash return on your original investment capital rises exponentially, often surpassing 10-20% YOC.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">The DRIP Snowball</span>
            Dividend Reinvestment Plans (DRIP) automatically purchase incremental shares each quarter with zero trading fees, accelerating your share accumulation without manual intervention.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Dividend Aristocrats</span>
            Companies in the S&amp;P 500 that have increased dividends for 25+ consecutive years have historically provided superior risk-adjusted returns and inflation protection.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Home, Scale, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateRentVsBuy,
  RentVsBuyInputs,
} from '../../lib/financial/rentVsBuy';

interface RentVsBuyCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const RentVsBuyCalculatorView: React.FC<RentVsBuyCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [homePriceStr, setHomePriceStr] = useState('450000');
  const [downPaymentPercentStr, setDownPaymentPercentStr] = useState('20');
  const [mortgageRateStr, setMortgageRateStr] = useState('6.5');
  const [loanTenureYearsStr, setLoanTenureYearsStr] = useState('30');
  const [homeAppreciationRateStr, setHomeAppreciationRateStr] = useState('4.0');
  const [propertyTaxRateStr, setPropertyTaxRateStr] = useState('1.2');
  const [maintenanceRateStr, setMaintenanceRateStr] = useState('1.0');

  const [initialMonthlyRentStr, setInitialMonthlyRentStr] = useState('2000');
  const [annualRentIncreaseRateStr, setAnnualRentIncreaseRateStr] = useState('4.5');
  const [investmentReturnRateStr, setInvestmentReturnRateStr] = useState('8.0');
  const [timeHorizonYearsStr, setTimeHorizonYearsStr] = useState('10');

  const homePrice = parseFloat(homePriceStr) || 0;
  const downPaymentPercent = parseFloat(downPaymentPercentStr) || 20;
  const mortgageRate = parseFloat(mortgageRateStr) || 0;
  const loanTenureYears = parseFloat(loanTenureYearsStr) || 30;
  const homeAppreciationRate = parseFloat(homeAppreciationRateStr) || 4.0;
  const propertyTaxRate = parseFloat(propertyTaxRateStr) || 1.2;
  const maintenanceRate = parseFloat(maintenanceRateStr) || 1.0;

  const initialMonthlyRent = parseFloat(initialMonthlyRentStr) || 0;
  const annualRentIncreaseRate = parseFloat(annualRentIncreaseRateStr) || 4.5;
  const investmentReturnRate = parseFloat(investmentReturnRateStr) || 8.0;
  const timeHorizonYears = parseFloat(timeHorizonYearsStr) || 10;

  const result = useMemo(() => {
    const inputs: RentVsBuyInputs = {
      homePrice,
      downPaymentPercent,
      mortgageRate,
      loanTenureYears,
      propertyAppreciationRate: homeAppreciationRate,
      annualMaintenanceAndTaxRate: propertyTaxRate + maintenanceRate,
      initialMonthlyRent,
      annualRentInflation: annualRentIncreaseRate,
      investmentReturnRate,
      horizonYears: timeHorizonYears,
    };
    return calculateRentVsBuy(inputs);
  }, [
    homePrice,
    downPaymentPercent,
    mortgageRate,
    loanTenureYears,
    homeAppreciationRate,
    propertyTaxRate,
    maintenanceRate,
    initialMonthlyRent,
    annualRentIncreaseRate,
    investmentReturnRate,
    timeHorizonYears,
  ]);

  const handleReset = () => {
    setHomePriceStr('450000');
    setDownPaymentPercentStr('20');
    setMortgageRateStr('6.5');
    setLoanTenureYearsStr('30');
    setHomeAppreciationRateStr('4.0');
    setPropertyTaxRateStr('1.2');
    setMaintenanceRateStr('1.0');
    setInitialMonthlyRentStr('2000');
    setAnnualRentIncreaseRateStr('4.5');
    setInvestmentReturnRateStr('8.0');
    setTimeHorizonYearsStr('10');
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
          {/* Purchase Parameters */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3.5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Home className="w-4 h-4" />
              1. Home Purchase Assumptions
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Property Price
              </label>
              <input
                type="text"
                value={homePriceStr}
                onChange={(e) => handleCleanInput(e.target.value, setHomePriceStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="450000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Down Payment (%)
                </label>
                <input
                  type="text"
                  value={downPaymentPercentStr}
                  onChange={(e) => handleCleanInput(e.target.value, setDownPaymentPercentStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mortgage Rate (%)
                </label>
                <input
                  type="text"
                  value={mortgageRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setMortgageRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Appreciation (%/yr)
                </label>
                <input
                  type="text"
                  value={homeAppreciationRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setHomeAppreciationRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="4.0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Tax (%/yr)
                </label>
                <input
                  type="text"
                  value={propertyTaxRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPropertyTaxRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="1.2"
                />
              </div>
            </div>
          </div>

          {/* Rent & Opportunity Parameters */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3.5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              2. Rental &amp; Investment Opportunity
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Equivalent Initial Monthly Rent
              </label>
              <input
                type="text"
                value={initialMonthlyRentStr}
                onChange={(e) => handleCleanInput(e.target.value, setInitialMonthlyRentStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="2000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rent Hike (%/yr)
                </label>
                <input
                  type="text"
                  value={annualRentIncreaseRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualRentIncreaseRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="4.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stock Return (%/yr)
                </label>
                <input
                  type="text"
                  value={investmentReturnRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInvestmentReturnRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="8.0"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Analysis Horizon
                </label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {timeHorizonYears} Years
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={timeHorizonYearsStr}
                onChange={(e) => setTimeHorizonYearsStr(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
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
                Long-Term Wealth Comparison ({timeHorizonYears} Years)
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  result.recommendation === 'buy'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {result.recommendation === 'buy' ? 'Buying Favored' : 'Renting + Investing Favored'}
              </span>
            </div>

            {/* Main Decision Hero */}
            <div
              className={`p-5 rounded-2xl border text-center ${
                result.recommendation === 'buy'
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border-blue-200/60 dark:border-blue-800/50'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 border-emerald-200/60 dark:border-emerald-800/50'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">
                Net Wealth Advantage
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.netWealthDifference)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {result.recommendation === 'buy'
                  ? `Buying builds ${formatAmount(result.netWealthDifference)} more equity over ${timeHorizonYears} years after selling costs`
                  : `Renting & investing down payment in market builds ${formatAmount(result.netWealthDifference)} more wealth over ${timeHorizonYears} years`}
              </p>
            </div>

            {/* Ending Net Worth Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                  Buying Scenario Net Worth
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.buyerFinalNetWealth)}
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t" style={{ borderColor: 'var(--line)' }}>
                  <div>Cumulative Outflow: {formatAmount(result.cumulativeBuyerCost)}</div>
                  <div>Final Equity: {formatAmount(result.buyerFinalNetWealth)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  Renting + Investing Net Worth
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.renterFinalNetWealth)}
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t" style={{ borderColor: 'var(--line)' }}>
                  <div>Compounded Portfolio: {formatAmount(result.renterFinalNetWealth)}</div>
                  <div>Total Rent Paid: {formatAmount(result.cumulativeRenterCost)}</div>
                  <div>Initial Seed: {formatAmount(homePrice * (downPaymentPercent / 100))}</div>
                </div>
              </div>
            </div>

            {/* Break-even Horizon Metric */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Purchase Break-Even Horizon
                </span>
                <span className="text-[11px] text-slate-500">
                  Minimum residency duration required to recover closing costs, property taxes, and mortgage interest
                </span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                {result.breakevenYear ? `Year ${result.breakevenYear}` : '15+ Years'}
              </span>
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
          The Mathematics of Rent vs. Buy Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Opportunity Cost of Down Payment</span>
            Every dollar deployed into a 20% down payment is capital removed from diversified equity markets that historically compound at 8–10% annually.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Phantom Ownership Costs</span>
            Homeownership incurs non-equity drag: property taxes, homeowners insurance, HOA fees, maintenance (1-2%/yr), and 6% broker commissions on resale.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Inflation &amp; Rent Escalation</span>
            While a 30-year fixed mortgage locks in your principal and interest forever, market rents rise with inflation, tipping the scale to buying over long horizons.
          </div>
        </div>
      </div>
    </div>
  );
};

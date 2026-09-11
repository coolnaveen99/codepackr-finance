import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, CreditCard, Zap, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateCreditCardPayoff,
  CreditCardPayoffInputs,
} from '../../lib/financial/creditCardPayoff';

interface CreditCardPayoffCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const CreditCardPayoffCalculatorView: React.FC<
  CreditCardPayoffCalculatorViewProps
> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { formatAmount } = useCurrency();

  const [currentBalanceStr, setCurrentBalanceStr] = useState('7500');
  const [annualInterestRateStr, setAnnualInterestRateStr] = useState('22.99');
  const [minimumPaymentPercentStr, setMinimumPaymentPercentStr] = useState('2.5');
  const [floorPaymentAmountStr, setFloorPaymentAmountStr] = useState('35');
  const [extraMonthlyPaymentStr, setExtraMonthlyPaymentStr] = useState('150');

  const currentBalance = parseFloat(currentBalanceStr) || 0;
  const annualInterestRate = parseFloat(annualInterestRateStr) || 0;
  const minimumPaymentPercent = parseFloat(minimumPaymentPercentStr) || 2.5;
  const floorPaymentAmount = parseFloat(floorPaymentAmountStr) || 35;
  const extraMonthlyPayment = parseFloat(extraMonthlyPaymentStr) || 0;

  const result = useMemo(() => {
    const inputs: CreditCardPayoffInputs = {
      currentBalance,
      annualInterestRate,
      minimumPaymentPercent,
      floorPaymentAmount,
      extraMonthlyPayment,
    };
    return calculateCreditCardPayoff(inputs);
  }, [
    currentBalance,
    annualInterestRate,
    minimumPaymentPercent,
    floorPaymentAmount,
    extraMonthlyPayment,
  ]);

  const handleReset = () => {
    setCurrentBalanceStr('7500');
    setAnnualInterestRateStr('22.99');
    setMinimumPaymentPercentStr('2.5');
    setFloorPaymentAmountStr('35');
    setExtraMonthlyPaymentStr('150');
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
              <CreditCard className="w-4 h-4 text-blue-500" />
              Credit Card Balance &amp; APR
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outstanding Balance
              </label>
              <input
                type="text"
                value={currentBalanceStr}
                onChange={(e) => handleCleanInput(e.target.value, setCurrentBalanceStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="7500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Annual Percentage Rate (APR %)
              </label>
              <input
                type="text"
                value={annualInterestRateStr}
                onChange={(e) => handleCleanInput(e.target.value, setAnnualInterestRateStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="22.99"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Min Payment %
                </label>
                <input
                  type="text"
                  value={minimumPaymentPercentStr}
                  onChange={(e) => handleCleanInput(e.target.value, setMinimumPaymentPercentStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Min Floor Amount
                </label>
                <input
                  type="text"
                  value={floorPaymentAmountStr}
                  onChange={(e) => handleCleanInput(e.target.value, setFloorPaymentAmountStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="35"
                />
              </div>
            </div>

            {/* Extra Payment Accelerator */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
              <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                Additional Monthly Payment (Snowball)
              </label>
              <input
                type="text"
                value={extraMonthlyPaymentStr}
                onChange={(e) => handleCleanInput(e.target.value, setExtraMonthlyPaymentStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-emerald-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="150"
              />
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                Extra cash applied directly toward balance principal each month
              </span>
            </div>
          </div>
        </div>

        {/* Right Comparison Card */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interest Savings Hero */}
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Accelerated Debt Payoff Advantage
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Saves {result.yearsSaved} Years
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 border border-emerald-200/60 dark:border-emerald-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Total Interest Saved
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.interestSaved)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                By adding {formatAmount(extraMonthlyPayment)}/mo, payoff time is slashed by {result.monthsSaved} months
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Minimum Payment Only */}
              <div className="p-4 rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    Minimum Payment Only
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Time to Debt Freedom:</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.minimumOnlyStrategy.monthsToPayoff >= 360
                      ? '30+ Years'
                      : `${result.minimumOnlyStrategy.monthsToPayoff} Months (${(
                          result.minimumOnlyStrategy.monthsToPayoff / 12
                        ).toFixed(1)} yrs)`}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Interest Incurred:</span>
                  <div className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
                    {formatAmount(result.minimumOnlyStrategy.totalInterestPaid)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Out-of-Pocket:</span>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {formatAmount(result.minimumOnlyStrategy.totalAmountPaid)}
                  </div>
                </div>
              </div>

              {/* Accelerated Payoff */}
              <div className="p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    With +{formatAmount(extraMonthlyPayment)} Extra
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Time to Debt Freedom:</span>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.acceleratedStrategy.monthsToPayoff} Months (
                    {(result.acceleratedStrategy.monthsToPayoff / 12).toFixed(1)} yrs)
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Interest Incurred:</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatAmount(result.acceleratedStrategy.totalInterestPaid)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Out-of-Pocket:</span>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {formatAmount(result.acceleratedStrategy.totalAmountPaid)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Traps Guidance */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          The Mathematics of Credit Card Minimum Payment Traps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Shrinking Minimums</span>
            Because minimum payments are calculated as a percentage of the diminishing balance, the monthly payment drops each month, prolonging payoff for decades.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Principal Reduction</span>
            In the early years of minimum payments, nearly 80-90% of your check goes purely to bank interest rather than clearing your balance.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Fixed Extra Payments</span>
            Even a modest extra $50 to $150 per month ensures that 100% of the additional funds eliminate principal, causing compound interest to collapse.
          </div>
        </div>
      </div>
    </div>
  );
};

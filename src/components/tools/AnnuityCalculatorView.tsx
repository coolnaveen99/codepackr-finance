import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Calendar, Layers, CheckCircle2, TrendingUp, Table } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateAnnuity,
  AnnuityInputs,
  AnnuityType,
  AnnuityTiming,
} from '../../lib/financial/annuity';

interface AnnuityCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const AnnuityCalculatorView: React.FC<AnnuityCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [annuityType, setAnnuityType] = useState<AnnuityType>('immediate');
  const [timing, setTiming] = useState<AnnuityTiming>('ordinary');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const [principalStr, setPrincipalStr] = useState('300000');
  const [periodicPaymentStr, setPeriodicPaymentStr] = useState('2000');
  const [annualInterestRateStr, setAnnualInterestRateStr] = useState('6.5');
  const [tenureYearsStr, setTenureYearsStr] = useState('20');
  const [deferralYearsStr, setDeferralYearsStr] = useState('5');

  const principal = parseFloat(principalStr) || 0;
  const periodicPayment = parseFloat(periodicPaymentStr) || 0;
  const annualInterestRate = parseFloat(annualInterestRateStr) || 0;
  const tenureYears = parseFloat(tenureYearsStr) || 20;
  const deferralYears = parseFloat(deferralYearsStr) || 0;

  const result = useMemo(() => {
    const inputs: AnnuityInputs = {
      annuityType,
      timing,
      frequency,
      principal: annuityType === 'immediate' ? principal : undefined,
      periodicPayment: annuityType === 'deferred' ? periodicPayment : undefined,
      annualInterestRate,
      tenureYears,
      deferralYears: annuityType === 'deferred' ? deferralYears : undefined,
    };
    return calculateAnnuity(inputs);
  }, [
    annuityType,
    timing,
    frequency,
    principal,
    periodicPayment,
    annualInterestRate,
    tenureYears,
    deferralYears,
  ]);

  const handleReset = () => {
    setAnnuityType('immediate');
    setTiming('ordinary');
    setFrequency('monthly');
    setPrincipalStr('300000');
    setPeriodicPaymentStr('2000');
    setAnnualInterestRateStr('6.5');
    setTenureYearsStr('20');
    setDeferralYearsStr('5');
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
              <Calendar className="w-4 h-4 text-blue-500" />
              Annuity Type &amp; Payout Terms
            </h3>

            {/* Immediate vs Deferred */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contract Structure
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnnuityType('immediate')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    annuityType === 'immediate'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Immediate Payout
                  <span className="block text-[10px] font-normal opacity-80">
                    Lump-sum &rarr; Income Stream
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnnuityType('deferred')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    annuityType === 'deferred'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Deferred Growth
                  <span className="block text-[10px] font-normal opacity-80">
                    Deposit &rarr; Grow &rarr; Corpus
                  </span>
                </button>
              </div>
            </div>

            {/* Principal / Contribution input depending on type */}
            {annuityType === 'immediate' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Starting Lump-Sum Premium
                </label>
                <input
                  type="text"
                  value={principalStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPrincipalStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="300000"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Periodic Recurring Deposit Amount
                </label>
                <input
                  type="text"
                  value={periodicPaymentStr}
                  onChange={(e) => handleCleanInput(e.target.value, setPeriodicPaymentStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="2000"
                />
              </div>
            )}

            {/* Rate & Tenure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guaranteed Rate (%)
                </label>
                <input
                  type="text"
                  value={annualInterestRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualInterestRateStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Term (Years)
                </label>
                <input
                  type="text"
                  value={tenureYearsStr}
                  onChange={(e) => handleCleanInput(e.target.value, setTenureYearsStr)}
                  className="w-full px-3 py-1.5 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="20"
                />
              </div>
            </div>

            {/* Payment Timing (Ordinary vs Due) */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Timing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTiming('ordinary')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-colors ${
                    timing === 'ordinary'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Ordinary (End of Period)
                </button>
                <button
                  type="button"
                  onClick={() => setTiming('due')}
                  className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-colors ${
                    timing === 'due'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Annuity Due (Beginning)
                </button>
              </div>
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
                Guaranteed Cash Flow Summary
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {result.totalPeriods} Payments over {tenureYears} Yrs
              </span>
            </div>

            {/* Main Payout Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                {annuityType === 'immediate' ? 'Monthly Guaranteed Payout' : 'Projected Accumulated Corpus'}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(annuityType === 'immediate' ? result.calculatedPayment : result.calculatedFutureValue)}
                {annuityType === 'immediate' && <span className="text-sm font-normal text-slate-400"> /mo</span>}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Total lifetime payouts distributed: {formatAmount(result.totalPayoutReceived)}
              </p>
            </div>

            {/* Financial Ledger Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Principal Deposited</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.totalPrincipalInvested)}
                </div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Interest Earned</span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatAmount(result.totalInterestEarned)}
                </div>
              </div>
            </div>

            {/* Growth bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{
                    width: `${(result.totalPrincipalInvested / result.totalPayoutReceived) * 100}%`,
                  }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${(result.totalInterestEarned / result.totalPayoutReceived) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Principal ({( (result.totalPrincipalInvested / result.totalPayoutReceived) * 100 ).toFixed(0)}%)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Interest Gain ({( (result.totalInterestEarned / result.totalPayoutReceived) * 100 ).toFixed(0)}%)
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
          Annuity Contract Mechanics &amp; Longevity Protection
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Mortality Pooling</span>
            Annuity insurers pool longevity risk, transforming a fixed sum into guaranteed lifetime income that cannot be outlived even if market conditions crash.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Ordinary vs. Due</span>
            An annuity due pays at the beginning of each period (e.g. lease payments, upfront retirement drawdowns), generating higher compounding than ordinary annuities paid at period-end.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Tax Treatment</span>
            For non-qualified immediate annuities, each payout is divided into tax-free return of principal and taxable interest based on the IRS Exclusion Ratio.
          </div>
        </div>
      </div>
    </div>
  );
};

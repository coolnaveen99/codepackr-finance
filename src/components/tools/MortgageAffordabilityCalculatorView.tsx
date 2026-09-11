import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Home, Scale, DollarSign, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateMortgageAffordability,
  MortgageAffordabilityInputs,
} from '../../lib/financial/mortgageAffordability';

interface MortgageAffordabilityCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const MortgageAffordabilityCalculatorView: React.FC<
  MortgageAffordabilityCalculatorViewProps
> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { formatAmount } = useCurrency();

  const [monthlyIncomeStr, setMonthlyIncomeStr] = useState('8000');
  const [existingMonthlyDebtsStr, setExistingMonthlyDebtsStr] = useState('600');
  const [interestRateStr, setInterestRateStr] = useState('6.75');
  const [tenureYearsStr, setTenureYearsStr] = useState('30');
  const [downPaymentStr, setDownPaymentStr] = useState('60000');
  const [maxDtiStr, setMaxDtiStr] = useState('43');

  const monthlyIncome = parseFloat(monthlyIncomeStr) || 0;
  const existingMonthlyDebts = parseFloat(existingMonthlyDebtsStr) || 0;
  const interestRate = parseFloat(interestRateStr) || 0;
  const tenureYears = parseFloat(tenureYearsStr) || 30;
  const downPayment = parseFloat(downPaymentStr) || 0;
  const maxDtiPercent = parseFloat(maxDtiStr) || 43;

  const result = useMemo(() => {
    const inputs: MortgageAffordabilityInputs = {
      monthlyIncome,
      existingMonthlyDebts,
      interestRate,
      tenureYears,
      downPayment,
      maxDtiPercent,
    };
    return calculateMortgageAffordability(inputs);
  }, [
    monthlyIncome,
    existingMonthlyDebts,
    interestRate,
    tenureYears,
    downPayment,
    maxDtiPercent,
  ]);

  const handleReset = () => {
    setMonthlyIncomeStr('8000');
    setExistingMonthlyDebtsStr('600');
    setInterestRateStr('6.75');
    setTenureYearsStr('30');
    setDownPaymentStr('60000');
    setMaxDtiStr('43');
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
              <Home className="w-4 h-4 text-blue-500" />
              Financial &amp; Mortgage Parameters
            </h3>

            {/* Monthly Income */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gross Monthly Household Income
              </label>
              <input
                type="text"
                value={monthlyIncomeStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlyIncomeStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="8000"
              />
            </div>

            {/* Existing Debts */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Existing Monthly Obligations (Car loans, student debt, EMIs)
              </label>
              <input
                type="text"
                value={existingMonthlyDebtsStr}
                onChange={(e) => handleCleanInput(e.target.value, setExistingMonthlyDebtsStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="600"
              />
            </div>

            {/* Down Payment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Available Down Payment Cash
              </label>
              <input
                type="text"
                value={downPaymentStr}
                onChange={(e) => handleCleanInput(e.target.value, setDownPaymentStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="60000"
              />
            </div>

            {/* Interest Rate & Term */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mortgage Rate (%)
                </label>
                <input
                  type="text"
                  value={interestRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInterestRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="6.75"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Tenure (Years)
                </label>
                <select
                  value={tenureYearsStr}
                  onChange={(e) => setTenureYearsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-medium"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                >
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years (Standard)</option>
                </select>
              </div>
            </div>

            {/* Max DTI Threshold */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Debt-To-Income (DTI) Limit
                </label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {maxDtiStr}%
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="50"
                step="1"
                value={maxDtiStr}
                onChange={(e) => setMaxDtiStr(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Conservative (36%)</span>
                <span>Fannie/Freddie (43%)</span>
                <span>FHA Ceiling (50%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Hero */}
        <div className="lg:col-span-7 space-y-5">
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Purchasing Power Assessment
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Total DTI: {result.projectedTotalDti.toFixed(1)}%
              </span>
            </div>

            {/* Top Primary Metric */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Maximum Home Purchase Budget
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.maxPropertyPrice)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Includes {formatAmount(result.maxLoanAmount)} mortgage borrowing + {formatAmount(downPayment)} down payment
              </p>
            </div>

            {/* Monthly Budget Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">
                  Max Allowable Monthly Mortgage EMI
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.maxAllowableEmi)}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">
                  Total Monthly Obligations (P&amp;I + Existing)
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.maxAllowableEmi + existingMonthlyDebts)}
                  <span className="text-xs font-normal text-slate-400"> /mo</span>
                </div>
              </div>
            </div>

            {/* Income Distribution Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Monthly Income Allocation
              </span>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full transition-all"
                  title="New Mortgage EMI"
                  style={{ width: `${Math.min(100, (result.maxAllowableEmi / monthlyIncome) * 100)}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  title="Existing Debts"
                  style={{ width: `${Math.min(100, (existingMonthlyDebts / monthlyIncome) * 100)}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  title="Residual Discretionary Income"
                  style={{
                    width: `${Math.max(
                      0,
                      100 -
                        ((result.maxAllowableEmi + existingMonthlyDebts) / monthlyIncome) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Mortgage EMI ({((result.maxAllowableEmi / monthlyIncome) * 100).toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Existing Debt ({result.currentDtiWithExistingDebts.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Disposable Net ({Math.max(0, 100 - result.projectedTotalDti).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Lifetime Cost Summary */}
            <div className="p-3.5 rounded-xl border flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  30-Year Lifetime Interest Obligation
                </span>
                <span className="text-[11px] text-slate-500">
                  Total repayments over {tenureYears} years: {formatAmount(result.totalRepayment)}
                </span>
              </div>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                {formatAmount(result.totalInterestPaid)}
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
          Fannie Mae &amp; Banking Underwriting Guidelines
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Back-End DTI Rule</span>
            Most institutional lenders cap back-end debt obligations (housing payment + car loans + credit cards) between 36% and 43% of gross income.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Down Payment Impact</span>
            A higher down payment directly increases property purchasing power dollar-for-dollar without increasing your monthly repayment burden.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Reserves Buffer</span>
            Keep 3 to 6 months of living expenses in an emergency fund outside of your down payment to qualify with prime credit underwriting.
          </div>
        </div>
      </div>
    </div>
  );
};

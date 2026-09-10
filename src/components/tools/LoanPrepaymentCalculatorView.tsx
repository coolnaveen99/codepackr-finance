import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateLoanPrepayment, LoanPrepaymentInput } from '../../lib/financial/loanPrepayment';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  Zap, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  DollarSign, 
  Sparkles,
  Info
} from 'lucide-react';

interface LoanPrepaymentCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const LoanPrepaymentCalculatorView: React.FC<LoanPrepaymentCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('loan-prepayment-calculator');

  const [inputs, setInputs] = useState<LoanPrepaymentInput>({
    loanAmount: 250000,
    annualInterestRate: 6.5,
    loanTenureYears: 25,
    monthlyExtraPayment: 300,
    annualLumpSumPayment: 0,
    oneTimePrepayment: 0,
  });

  const result = useMemo(() => calculateLoanPrepayment(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      loanAmount: 250000,
      annualInterestRate: 6.5,
      loanTenureYears: 25,
      monthlyExtraPayment: 300,
      annualLumpSumPayment: 0,
      oneTimePrepayment: 0,
    });
  };

  const handleCopy = () => {
    const text = `Loan Prepayment & Early Payoff Analysis - CodePackr Finance\n` +
      `Principal Loan: ${formatAmount(inputs.loanAmount)}\n` +
      `Original EMI: ${formatAmount(result.regularEmi)}\n` +
      `Monthly Extra Prepayment: ${formatAmount(inputs.monthlyExtraPayment || 0)}\n` +
      `Total Interest Saved: ${formatAmount(result.totalInterestSaved)}\n` +
      `Tenure Shortened By: ${result.yearsSaved} Years (${result.monthsSaved} Months)\n` +
      `New Payoff Term: ${(result.acceleratedMonths / 12).toFixed(1)} Years (vs ${(result.baselineMonths / 12).toFixed(1)} Years)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Without Prepayment (Baseline)', 'With Extra Prepayments', 'Savings / Reduction'],
      ['Monthly Regular EMI', result.regularEmi, result.regularEmi, '-'],
      ['Extra Monthly Prepayment', 0, inputs.monthlyExtraPayment || 0, '-'],
      ['Total Interest Paid', result.baselineTotalInterest, result.acceleratedTotalInterest, result.totalInterestSaved],
      ['Total Amount Paid', result.baselineTotalPayment, result.acceleratedTotalPayment, result.totalInterestSaved],
      ['Payoff Tenure (Months)', result.baselineMonths, result.acceleratedMonths, result.monthsSaved],
      ['Payoff Tenure (Years)', (result.baselineMonths / 12).toFixed(1), (result.acceleratedMonths / 12).toFixed(1), result.yearsSaved],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loan_prepayment_savings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="loan-prepayment-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Accelerated Debt Elimination
          </span>
          <span className="text-xs text-[var(--muted)]">Interest Mitigation Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="prep-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="prep-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="prep-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-6 space-y-5">
          {/* Baseline Loan Setup */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--brand)]" />
              Existing Loan Details
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="prep-loan-amount" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Loan Principal Amount ({currencyCode})
                </label>
                <input
                  id="prep-loan-amount"
                  type="number"
                  min="1000"
                  step="5000"
                  value={inputs.loanAmount || ''}
                  onChange={(e) => setInputs({ ...inputs, loanAmount: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prep-interest-rate" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    id="prep-interest-rate"
                    type="number"
                    min="0.1"
                    max="40"
                    step="0.1"
                    value={inputs.annualInterestRate || ''}
                    onChange={(e) => setInputs({ ...inputs, annualInterestRate: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="prep-tenure" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Original Tenure (Years)
                  </label>
                  <input
                    id="prep-tenure"
                    type="number"
                    min="1"
                    max="40"
                    step="1"
                    value={inputs.loanTenureYears || ''}
                    onChange={(e) => setInputs({ ...inputs, loanTenureYears: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prepayment Strategy */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--brand)]" />
              Prepayment Strategies
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="prep-extra-monthly" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Extra Monthly Payment ({currencyCode})
                </label>
                <input
                  id="prep-extra-monthly"
                  type="number"
                  min="0"
                  step="50"
                  value={inputs.monthlyExtraPayment || ''}
                  onChange={(e) => setInputs({ ...inputs, monthlyExtraPayment: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prep-annual-lump" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Annual Extra Lump-Sum ({currencyCode})
                  </label>
                  <input
                    id="prep-annual-lump"
                    type="number"
                    min="0"
                    step="500"
                    value={inputs.annualLumpSumPayment || ''}
                    onChange={(e) => setInputs({ ...inputs, annualLumpSumPayment: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="prep-one-time" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    One-Time Principal Payment ({currencyCode})
                  </label>
                  <input
                    id="prep-one-time"
                    type="number"
                    min="0"
                    step="1000"
                    value={inputs.oneTimePrepayment || ''}
                    onChange={(e) => setInputs({ ...inputs, oneTimePrepayment: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Outcomes & Visual Comparisons */}
        <div className="lg:col-span-6 space-y-5">
          {/* Big Savings Highlight Card */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Total Direct Interest Saved
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-emerald-500 tracking-tight">
                    {formatAmount(result.totalInterestSaved)}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {result.payoffAccelerationPercentage}% Payoff Acceleration
              </div>
            </div>

            {/* Time Saved Metric */}
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)] font-medium block">Debt-Free Sooner By</span>
                  <span className="text-lg font-bold text-[var(--ink)]">
                    {result.yearsSaved} Years ({result.monthsSaved} Months)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--muted)] block">New Loan Term</span>
                <span className="text-sm font-bold text-[var(--brand)] font-mono">{(result.acceleratedMonths / 12).toFixed(1)} Years</span>
              </div>
            </div>

            {/* Side by Side Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase">Original Schedule</span>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Monthly EMI</span>
                  <span className="text-base font-bold text-[var(--ink)]">{formatAmount(result.regularEmi)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Total Interest</span>
                  <span className="text-sm font-semibold text-rose-500">{formatAmount(result.baselineTotalInterest)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Total Outlay</span>
                  <span className="text-xs text-[var(--muted)] font-mono">{formatAmount(result.baselineTotalPayment)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-emerald-500/30 space-y-2">
                <span className="text-xs font-semibold text-emerald-500 uppercase">With Prepayments</span>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Effective Monthly Payment</span>
                  <span className="text-base font-bold text-emerald-500">
                    {formatAmount(result.regularEmi + (inputs.monthlyExtraPayment || 0))}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Reduced Interest</span>
                  <span className="text-sm font-semibold text-emerald-500">{formatAmount(result.acceleratedTotalInterest)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--muted)] block">Total Outlay</span>
                  <span className="text-xs text-[var(--muted)] font-mono">{formatAmount(result.acceleratedTotalPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Metadata */}
          {formulaMeta && (
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--brand)]" />
                Prepayment Mathematical Engine
              </h3>
              <p className="text-xs font-mono text-[var(--ink)] bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--line)]">
                {formulaMeta.formulaText}
              </p>
              <div className="text-xs text-[var(--muted)]">
                Every extra dollar applied directly reduces outstanding balance, permanently preventing compounding interest on that principal chunk.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

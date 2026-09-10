import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateDebtToIncome, DebtToIncomeInput } from '../../lib/financial/debtToIncome';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  Scale, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Home, 
  CreditCard, 
  Car, 
  GraduationCap, 
  DollarSign,
  Info
} from 'lucide-react';

interface DebtToIncomeCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const DebtToIncomeCalculatorView: React.FC<DebtToIncomeCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('debt-to-income-calculator');

  const [inputs, setInputs] = useState<DebtToIncomeInput>({
    grossMonthlyIncome: 8000,
    monthlyMortgageRent: 1800,
    monthlyAutoLoan: 400,
    monthlyStudentLoan: 300,
    monthlyCreditCardMin: 150,
    monthlyPersonalLoanOther: 100,
  });

  const result = useMemo(() => calculateDebtToIncome(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      grossMonthlyIncome: 8000,
      monthlyMortgageRent: 1800,
      monthlyAutoLoan: 400,
      monthlyStudentLoan: 300,
      monthlyCreditCardMin: 150,
      monthlyPersonalLoanOther: 100,
    });
  };

  const handleCopy = () => {
    const text = `Debt-to-Income (DTI) Analysis - CodePackr Finance\n` +
      `Gross Monthly Income: ${formatAmount(result.grossMonthlyIncome)}\n` +
      `Total Monthly Debt Obligations: ${formatAmount(result.totalMonthlyDebt)}\n` +
      `Front-End DTI (Housing): ${result.frontEndDtiPercent}%\n` +
      `Back-End DTI (Total Debt): ${result.backEndDtiPercent}%\n` +
      `Lending Assessment: ${result.statusLabel} (${result.statusDescription})\n` +
      `Max Recommended Debt (36% standard): ${formatAmount(result.maxRecommendedDebt36)}\n` +
      `Remaining Discretionary Income: ${formatAmount(result.remainingDiscretionaryIncome)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Amount / Value'],
      ['Gross Monthly Income', result.grossMonthlyIncome],
      ['Housing (Rent/Mortgage)', inputs.monthlyMortgageRent],
      ['Auto Loan Payments', inputs.monthlyAutoLoan],
      ['Student Loan Payments', inputs.monthlyStudentLoan],
      ['Credit Card Minimums', inputs.monthlyCreditCardMin],
      ['Personal Loans & Other Debts', inputs.monthlyPersonalLoanOther],
      ['Total Monthly Debt', result.totalMonthlyDebt],
      ['Front-End DTI (Housing Ratio)', `${result.frontEndDtiPercent}%`],
      ['Back-End DTI (Total Ratio)', `${result.backEndDtiPercent}%`],
      ['Status Rating', result.statusLabel],
      ['Assessment Note', result.statusDescription],
      ['Max Recommended Debt (36% benchmark)', result.maxRecommendedDebt36],
      ['Max Qualified Debt (43% QM Cap)', result.maxQualifiedDebt43],
      ['Remaining Discretionary Income', result.remainingDiscretionaryIncome],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dti_analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'excellent':
      case 'healthy':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      case 'moderate':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div id="dti-calculator-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Mortgage Underwriting & Lending
          </span>
          <span className="text-xs text-[var(--muted)]">Institutional Benchmark Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dti-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="dti-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="dti-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-5">
          {/* Income Section */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--brand)]" />
              Pre-Tax Monthly Gross Income
            </h2>

            <div>
              <label htmlFor="dti-income" className="block text-xs font-medium text-[var(--muted)] mb-1">
                Total Gross Monthly Income ({currencyCode})
              </label>
              <input
                id="dti-income"
                type="number"
                min="0"
                step="500"
                value={inputs.grossMonthlyIncome || ''}
                onChange={(e) => setInputs({ ...inputs, grossMonthlyIncome: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                placeholder="e.g. 8000"
              />
              <p className="text-[11px] text-[var(--muted)] mt-1">Salary before tax, bonuses, freelance, and rental dividends.</p>
            </div>
          </div>

          {/* Monthly Debt Obligations */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--brand)]" />
              Recurring Monthly Debt Obligations
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="dti-mortgage" className="block text-xs font-medium text-[var(--muted)] mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[var(--brand)]" />
                  Monthly Rent or Mortgage (Principal + Interest + Taxes + Ins)
                </label>
                <input
                  id="dti-mortgage"
                  type="number"
                  min="0"
                  step="100"
                  value={inputs.monthlyMortgageRent || ''}
                  onChange={(e) => setInputs({ ...inputs, monthlyMortgageRent: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dti-car" className="block text-xs font-medium text-[var(--muted)] mb-1 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[var(--brand)]" />
                    Auto Loan EMI
                  </label>
                  <input
                    id="dti-car"
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.monthlyAutoLoan || ''}
                    onChange={(e) => setInputs({ ...inputs, monthlyAutoLoan: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>

                <div>
                  <label htmlFor="dti-student" className="block text-xs font-medium text-[var(--muted)] mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--brand)]" />
                    Student Loans
                  </label>
                  <input
                    id="dti-student"
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.monthlyStudentLoan || ''}
                    onChange={(e) => setInputs({ ...inputs, monthlyStudentLoan: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dti-cc" className="block text-xs font-medium text-[var(--muted)] mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[var(--brand)]" />
                    Credit Card Min. Due
                  </label>
                  <input
                    id="dti-cc"
                    type="number"
                    min="0"
                    step="25"
                    value={inputs.monthlyCreditCardMin || ''}
                    onChange={(e) => setInputs({ ...inputs, monthlyCreditCardMin: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>

                <div>
                  <label htmlFor="dti-other" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Personal & Other Debts
                  </label>
                  <input
                    id="dti-other"
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.monthlyPersonalLoanOther || ''}
                    onChange={(e) => setInputs({ ...inputs, monthlyPersonalLoanOther: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ratio & Assessment Display */}
        <div className="lg:col-span-6 space-y-5">
          {/* Primary Result Card */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Back-End DTI (Total Debt Ratio)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-extrabold text-[var(--ink)] tracking-tight">
                    {result.backEndDtiPercent}%
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${getTierColorClass(result.statusTier)}`}>
                {result.statusLabel}
              </div>
            </div>

            {/* Visual DTI Spectrum Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[var(--muted)] font-mono">
                <span>0% (Ideal)</span>
                <span>36% (Standard)</span>
                <span>43% (QM Cap)</span>
                <span>50%+</span>
              </div>
              <div className="h-3 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--line)] relative">
                <div 
                  className={`h-full transition-all duration-300 ${
                    result.backEndDtiPercent <= 35 
                      ? 'bg-emerald-500' 
                      : result.backEndDtiPercent <= 43 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (result.backEndDtiPercent / 60) * 100)}%` }}
                />
              </div>
            </div>

            {/* Front-End vs Back-End Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Front-End (Housing)</span>
                <span className="text-xl font-bold text-[var(--ink)] mt-0.5 block">{result.frontEndDtiPercent}%</span>
                <span className="text-[10px] text-[var(--muted)]">Recommended: ≤ 28%</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Total Monthly Debt</span>
                <span className="text-xl font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.totalMonthlyDebt)}</span>
                <span className="text-[10px] text-[var(--muted)]">All obligations</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Max Safe Debt (36%)</span>
                <span className="text-base font-bold text-emerald-500 mt-0.5 block">{formatAmount(result.maxRecommendedDebt36)}</span>
                <span className="text-[10px] text-[var(--muted)]">Underwriting comfort</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Discretionary Cashflow</span>
                <span className="text-base font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.remainingDiscretionaryIncome)}</span>
                <span className="text-[10px] text-[var(--muted)]">Income minus debt</span>
              </div>
            </div>

            {/* Assessment Note */}
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-start gap-3">
              <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {result.statusDescription}
              </p>
            </div>
          </div>

          {/* Formula & Rules Card */}
          {formulaMeta && (
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--brand)]" />
                Statutory Lending Formula & Limits
              </h3>
              <p className="text-xs font-mono text-[var(--ink)] bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--line)]">
                {formulaMeta.formulaText}
              </p>
              <div className="text-xs text-[var(--muted)] space-y-1 pt-1">
                <div><strong>Standard Mortgage Benchmark:</strong> 28% Front-End / 36% Back-End.</div>
                <div><strong>CFPB Qualified Mortgage (QM) Cap:</strong> 43% Back-End DTI.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

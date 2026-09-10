import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateIndiaIncomeTax,
  TAX_ENGINE_VERSION,
  TAX_JURISDICTION,
  TAX_YEAR,
  TAX_REVIEW_DATE,
} from '../../lib/financial/incomeTax';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface IncomeTaxCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const IncomeTaxCalculatorView: React.FC<IncomeTaxCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('income-tax');

  const [grossIncomeStr, setGrossIncomeStr] = useState('1200000');
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [isSalaried, setIsSalaried] = useState(true);

  // Old regime deductions
  const [sec80CStr, setSec80CStr] = useState('150000');
  const [sec80DStr, setSec80DStr] = useState('25000');
  const [npsStr, setNpsStr] = useState('50000');
  const [hraStr, setHraStr] = useState('100000');
  const [homeLoanStr, setHomeLoanStr] = useState('0');

  const grossIncome = parseFloat(grossIncomeStr) || 0;

  const result = useMemo(() => {
    return calculateIndiaIncomeTax({
      grossAnnualIncome: grossIncome,
      taxRegime,
      isSalaried,
      section80C: parseFloat(sec80CStr) || 0,
      section80D: parseFloat(sec80DStr) || 0,
      section80CCD1B: parseFloat(npsStr) || 0,
      hraExemption: parseFloat(hraStr) || 0,
      homeLoanInterest80EEA: parseFloat(homeLoanStr) || 0,
    });
  }, [grossIncome, taxRegime, isSalaried, sec80CStr, sec80DStr, npsStr, hraStr, homeLoanStr]);

  const handleReset = () => {
    setGrossIncomeStr('1200000');
    setTaxRegime('new');
    setIsSalaried(true);
    setSec80CStr('150000');
    setSec80DStr('25000');
    setNpsStr('50000');
    setHraStr('100000');
    setHomeLoanStr('0');
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Jurisdiction & Tax Badges */}
        <div
          className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--brand)]/10 text-[var(--brand)]">
              Tax Regime Comparison
            </span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Standard Deduction &amp; Slabs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <CurrencySelector idPrefix="tax-currency" variant="pill" />
          </div>
        </div>

        {/* Tax Regime Selector & Salaried Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              CHOOSE TAX REGIME
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaxRegime('new')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  taxRegime === 'new'
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                New Tax Regime (Default)
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime('old')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  taxRegime === 'old'
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Old Regime (With Deductions)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              EMPLOYMENT TYPE
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSalaried(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSalaried
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Salaried Employee
              </button>
              <button
                type="button"
                onClick={() => setIsSalaried(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  !isSalaried
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Self-Employed / Freelancer
              </button>
            </div>
          </div>
        </div>

        {/* Gross Income Input */}
        <div>
          <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
            GROSS ANNUAL INCOME ({currency.symbol.trim()})
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={grossIncomeStr}
            onChange={(e) => handleCleanInput(e.target.value, setGrossIncomeStr)}
            className="w-full px-3.5 py-2.5 text-base font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            placeholder="1200000"
          />
        </div>

        {/* Old Regime Deductions Section (Only if Old Regime chosen) */}
        {taxRegime === 'old' && (
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Old Tax Regime Deductions (Chapter VI-A)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Section 80C (Max ₹1.5L)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sec80CStr}
                  onChange={(e) => handleCleanInput(e.target.value, setSec80CStr)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Section 80D (Health Ins.)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sec80DStr}
                  onChange={(e) => handleCleanInput(e.target.value, setSec80DStr)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  NPS 80CCD(1B) (Max ₹50k)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={npsStr}
                  onChange={(e) => handleCleanInput(e.target.value, setNpsStr)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  HRA Exemption (Sec 10)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={hraStr}
                  onChange={(e) => handleCleanInput(e.target.value, setHraStr)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Home Loan Int. Sec 24(b)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={homeLoanStr}
                  onChange={(e) => handleCleanInput(e.target.value, setHomeLoanStr)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Highlight Card */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Tax Liability
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatAmount(result.totalTaxLiability)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Incl. 4% Cess
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Effective Tax Rate
            </div>
            <div className="text-2xl font-bold font-mono text-[var(--brand)]">
              {result.effectiveTaxRatePercent.toFixed(1)}%
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Of gross earnings
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Net Taxable Income
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.netTaxableIncome)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              After {formatAmount(result.standardDeduction)} Std. Ded.
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Monthly Take-Home
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatAmount(result.monthlyTakeHomePay)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Estimated post-tax monthly
            </div>
          </div>
        </div>

        {/* Tax Slab Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
            Tax Slab Computation ({result.taxRegime.toUpperCase()} REGIME)
          </h4>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Income Slab</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Tax Rate</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Taxable in Slab</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.slabBreakdown.map((row, idx) => (
                  <tr key={idx} className="border-b" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2 px-3 font-mono">{row.slab}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{row.ratePercent}%</td>
                    <td className="py-2 px-3 text-right font-mono">{formatAmount(row.taxableInSlab)}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      {formatAmount(row.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 47 Mandatory Tax Governance Notice */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Country:</strong> {result.jurisdiction} · <strong>Tax Assessment:</strong> {result.taxYear} · <strong>Regime:</strong> {result.taxRegime === 'new' ? 'New Tax Regime (Section 115BAC)' : 'Old Tax Regime'}
            </p>
            <p>
              <strong>Standard Deduction:</strong> {formatAmount(result.standardDeduction)} for salaried employees. Section 87A rebate applies if net taxable income is ≤ ₹7,00,000 under New Regime.
            </p>
            <p>
              <strong>Model Version:</strong> {TAX_ENGINE_VERSION} · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
            <p className="text-[11px] leading-normal text-amber-700 dark:text-amber-300">
              <strong>Statutory Disclaimer:</strong> {result.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

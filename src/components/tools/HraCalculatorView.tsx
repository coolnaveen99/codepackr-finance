import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Home, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateHraExemption, HraInputs } from '../../lib/financial/hra';

interface HraCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const HraCalculatorView: React.FC<HraCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [frequency, setFrequency] = useState<'annual' | 'monthly'>('annual');
  const [basicSalaryStr, setBasicSalaryStr] = useState('600000');
  const [hraReceivedStr, setHraReceivedStr] = useState('240000');
  const [rentPaidStr, setRentPaidStr] = useState('216000');
  const [isMetro, setIsMetro] = useState(true);
  const [taxSlabRateStr, setTaxSlabRateStr] = useState('30');

  const basicSalary = parseFloat(basicSalaryStr) || 0;
  const hraReceived = parseFloat(hraReceivedStr) || 0;
  const rentPaid = parseFloat(rentPaidStr) || 0;
  const taxSlabRate = parseFloat(taxSlabRateStr) || 30;

  const result = useMemo(() => {
    const inputs: HraInputs = {
      basicSalary,
      hraReceived,
      rentPaid,
      isMetro,
      frequency,
      taxSlabRate,
    };
    return calculateHraExemption(inputs);
  }, [basicSalary, hraReceived, rentPaid, isMetro, frequency, taxSlabRate]);

  const handleReset = () => {
    setFrequency('annual');
    setBasicSalaryStr('600000');
    setHraReceivedStr('240000');
    setRentPaidStr('216000');
    setIsMetro(true);
    setTaxSlabRateStr('30');
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
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-500" />
                Salary &amp; Rent Parameters
              </h3>
              <div className="flex rounded-lg border p-0.5 text-[11px]" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFrequency('annual');
                    setBasicSalaryStr('600000');
                    setHraReceivedStr('240000');
                    setRentPaidStr('216000');
                  }}
                  className={`px-2.5 py-0.5 font-bold rounded-md transition-colors ${
                    frequency === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Annual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFrequency('monthly');
                    setBasicSalaryStr('50000');
                    setHraReceivedStr('20000');
                    setRentPaidStr('18000');
                  }}
                  className={`px-2.5 py-0.5 font-bold rounded-md transition-colors ${
                    frequency === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Basic Salary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Basic Salary + DA ({frequency === 'annual' ? 'Per Annum' : 'Per Month'})
              </label>
              <input
                type="text"
                value={basicSalaryStr}
                onChange={(e) => handleCleanInput(e.target.value, setBasicSalaryStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder={frequency === 'annual' ? '600000' : '50000'}
              />
            </div>

            {/* HRA Received */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                HRA Allowance Received from Employer
              </label>
              <input
                type="text"
                value={hraReceivedStr}
                onChange={(e) => handleCleanInput(e.target.value, setHraReceivedStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder={frequency === 'annual' ? '240000' : '20000'}
              />
            </div>

            {/* Actual Rent Paid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Rent Paid to Landlord
              </label>
              <input
                type="text"
                value={rentPaidStr}
                onChange={(e) => handleCleanInput(e.target.value, setRentPaidStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder={frequency === 'annual' ? '216000' : '18000'}
              />
            </div>

            {/* City Type */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                City Accommodation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsMetro(true)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    isMetro
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Metro (50% of Basic)
                  <span className="block text-[10px] font-normal opacity-80">
                    Delhi, Mumbai, Kolkata, Chennai
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMetro(false)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    !isMetro
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Non-Metro (40% of Basic)
                  <span className="block text-[10px] font-normal opacity-80">
                    Bengaluru, Pune, Hyderabad, etc.
                  </span>
                </button>
              </div>
            </div>

            {/* Tax Slab Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Applicable Income Tax Slab (%)
              </label>
              <input
                type="text"
                value={taxSlabRateStr}
                onChange={(e) => handleCleanInput(e.target.value, setTaxSlabRateStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="30"
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
                Section 10(13A) Tax Relief
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Rule 2A Compliant
              </span>
            </div>

            {/* Main Exemption Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800/80 border border-emerald-200/60 dark:border-emerald-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Annual Tax-Exempt HRA Amount
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.exemptHra)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Estimated Annual Tax Saved: <strong className="text-emerald-600 dark:text-emerald-400">{formatAmount(result.annualTaxSavings)}</strong> at {taxSlabRate}% bracket
              </p>
            </div>

            {/* Taxable vs Exempt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Total HRA Received</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {formatAmount(result.actualHra)}
                </div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
                <span className="text-xs text-slate-500 block mb-1 font-medium">Taxable Balance HRA</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {formatAmount(result.taxableHra)}
                </div>
              </div>
            </div>

            {/* 3 Statutory Rules Audit Ledger */}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--line)' }}>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b text-xs font-bold text-slate-700 dark:text-slate-300" style={{ borderColor: 'var(--line)' }}>
                Rule 2A Three-Condition Audit Ledger (Exemption = Least of 3)
              </div>
              <table className="w-full text-xs text-left">
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  <tr className={result.exemptHra === result.actualHra ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      1. Actual HRA Received
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.actualHra)}
                    </td>
                  </tr>
                  <tr className={result.exemptHra === result.rentExcessOverBasic ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      2. Rent Paid minus 10% of Basic
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.rentExcessOverBasic)}
                    </td>
                  </tr>
                  <tr className={result.exemptHra === result.percentageBasicLimit ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      3. {result.percentageUsed}% of Basic Salary ({isMetro ? 'Metro' : 'Non-Metro'})
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.percentageBasicLimit)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t text-[11px] text-slate-500 font-sans" style={{ borderColor: 'var(--line)' }}>
                Limiting condition: <strong className="text-slate-800 dark:text-slate-200">{result.limitingCondition}</strong>
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
          HRA Exemption Legal Provisions &amp; Tax Regimes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Old Tax Regime Only</span>
            HRA tax exemption under Section 10(13A) is claimable exclusively under the Old Tax Regime. The New Tax Regime (Section 115BAC) disallows HRA exemptions.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Landlord PAN Mandate</span>
            If annual rent paid exceeds ₹1,00,000, furnishing your landlord’s Permanent Account Number (PAN) is mandatory to substantiate the deduction.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Parent Rent Payments</span>
            Salaried employees living with parents can pay rent to parents via banking channels and claim HRA, provided parents declare it as rental income.
          </div>
        </div>
      </div>
    </div>
  );
};

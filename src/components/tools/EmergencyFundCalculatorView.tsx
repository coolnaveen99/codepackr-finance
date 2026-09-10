import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateEmergencyFund, EMERGENCY_FUND_ENGINE_VERSION } from '../../lib/financial/emergencyFund';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface EmergencyFundCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const EmergencyFundCalculatorView: React.FC<EmergencyFundCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('emergency-fund');

  const [housingStr, setHousingStr] = useState('25000');
  const [foodStr, setFoodStr] = useState('15000');
  const [utilitiesStr, setUtilitiesStr] = useState('6000');
  const [debtStr, setDebtStr] = useState('12000');
  const [insuranceStr, setInsuranceStr] = useState('4000');
  const [otherStr, setOtherStr] = useState('3000');

  const [coverageMonths, setCoverageMonths] = useState(6);
  const [currentSavingsStr, setCurrentSavingsStr] = useState('150000');
  const [monthlySavingsCapacityStr, setMonthlySavingsCapacityStr] = useState('20000');

  const result = useMemo(() => {
    return calculateEmergencyFund({
      monthlyHousing: parseFloat(housingStr) || 0,
      monthlyFoodGroceries: parseFloat(foodStr) || 0,
      monthlyUtilitiesBills: parseFloat(utilitiesStr) || 0,
      monthlyDebtEmi: parseFloat(debtStr) || 0,
      monthlyInsuranceHealth: parseFloat(insuranceStr) || 0,
      monthlyOtherEssentials: parseFloat(otherStr) || 0,
      coverageMonths,
      currentSavings: parseFloat(currentSavingsStr) || 0,
      monthlySavingsCapacity: parseFloat(monthlySavingsCapacityStr) || 0,
    });
  }, [housingStr, foodStr, utilitiesStr, debtStr, insuranceStr, otherStr, coverageMonths, currentSavingsStr, monthlySavingsCapacityStr]);

  const handleReset = () => {
    setHousingStr('25000');
    setFoodStr('15000');
    setUtilitiesStr('6000');
    setDebtStr('12000');
    setInsuranceStr('4000');
    setOtherStr('3000');
    setCoverageMonths(6);
    setCurrentSavingsStr('150000');
    setMonthlySavingsCapacityStr('20000');
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency & Toolbar */}
        <div
          className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Active Currency:
            </span>
            <span className="text-xs font-mono font-bold text-[var(--brand)] flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--brand)]/10">
              <span>{currency.flag}</span>
              <span>
                {currency.code} ({currency.symbol.trim()})
              </span>
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
            <CurrencySelector idPrefix="emergency-currency" variant="pill" />
          </div>
        </div>

        {/* Coverage Duration Switcher */}
        <div>
          <label className="text-xs font-bold block mb-2" style={{ color: 'var(--ink)' }}>
            TARGET DURATION BUFFER (MONTHS OF ESSENTIAL EXPENSES)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { m: 3, label: '3 Months', sub: 'Dual income / Stable' },
              { m: 6, label: '6 Months', sub: 'Standard recommended' },
              { m: 9, label: '9 Months', sub: 'Single earner / Dependents' },
              { m: 12, label: '12 Months', sub: 'Freelancer / Business' },
            ].map((item) => (
              <button
                key={item.m}
                onClick={() => setCoverageMonths(item.m)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  coverageMonths === item.m
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] shadow-sm'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:border-[var(--brand)]/50'
                }`}
              >
                <div className="text-sm font-bold">{item.label}</div>
                <div className="text-[11px] mt-0.5 opacity-80">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Expense Inputs Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            1. Monthly Non-Discretionary Essentials ({currency.symbol.trim()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Rent / Home Loan EMI
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={housingStr}
                onChange={(e) => handleCleanInput(e.target.value, setHousingStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Food & Groceries
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={foodStr}
                onChange={(e) => handleCleanInput(e.target.value, setFoodStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Electricity & Utility Bills
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={utilitiesStr}
                onChange={(e) => handleCleanInput(e.target.value, setUtilitiesStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Car / Personal Loan EMIs
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={debtStr}
                onChange={(e) => handleCleanInput(e.target.value, setDebtStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Health & Term Insurance Premiums
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={insuranceStr}
                onChange={(e) => handleCleanInput(e.target.value, setInsuranceStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Critical Medications / Essentials
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={otherStr}
                onChange={(e) => handleCleanInput(e.target.value, setOtherStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        </div>

        {/* Current Reserves & Savings Rate */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            2. Current Buffer & Savings Capacity ({currency.symbol.trim()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Current Liquid Emergency Savings
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentSavingsStr}
                onChange={(e) => handleCleanInput(e.target.value, setCurrentSavingsStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                Monthly Savings Capacity For Fund
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={monthlySavingsCapacityStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlySavingsCapacityStr)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>
          </div>
        </div>

        {/* Results Highlight Card */}
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {result.status === 'fully_funded' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : result.status === 'partially_funded' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              )}
              <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                Buffer Status:{' '}
                <span
                  className={
                    result.status === 'fully_funded'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : result.status === 'partially_funded'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }
                >
                  {result.status === 'fully_funded'
                    ? 'Fully Funded (100%)'
                    : result.status === 'partially_funded'
                    ? `Partially Funded (${result.fundedPercentage.toFixed(0)}%)`
                    : `Vulnerable (${result.fundedPercentage.toFixed(0)}%)`}
                </span>
              </span>
            </div>
            {result.monthsToFullFunding !== null && result.fundingGap > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                {result.monthsToFullFunding} months to fully fund
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Target Emergency Fund
              </div>
              <div className="text-2xl font-black text-[var(--brand)] font-mono">
                {formatAmount(result.targetFundAmount)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {coverageMonths} months buffer
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Monthly Essentials
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.monthlyEssentialExpenses)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Baseline monthly burn
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Funding Shortfall Gap
              </div>
              <div
                className={`text-2xl font-bold font-mono ${
                  result.fundingGap > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {result.fundingGap > 0 ? formatAmount(result.fundingGap) : 'Zero Shortfall'}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                {result.fundingGap > 0 ? 'Additional capital required' : 'Fully secured'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Current Buffer
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.currentSavings)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Liquid reserves
              </div>
            </div>
          </div>
        </div>

        {/* Essential Expense Category Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
            Monthly Essentials Breakdown
          </h4>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Category</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Monthly Amount</th>
                  <th className="text-right py-2 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Share of Essentials</th>
                </tr>
              </thead>
              <tbody>
                {result.expenseShares.map((row) => (
                  <tr key={row.category} className="border-b" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2 px-3">{row.category}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold" style={{ color: 'var(--ink)' }}>{formatAmount(row.amount)}</td>
                    <td className="py-2 px-3 text-right font-mono text-[var(--muted)]">{row.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Card */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'Target = Monthly Essential Outflows * Coverage Months'}
            </p>
            <p>
              <strong>Liquidity Best Practice:</strong> Park 50% in high-yield savings / bank sweep-in FDs for instant ATM access, and 50% in low-risk overnight/liquid mutual funds with T+1 redemption.
            </p>
            <p>
              <strong>Model Version:</strong> {EMERGENCY_FUND_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Never invest emergency reserves in volatile stocks or locked-in tax-saving funds (ELSS/PPF). Liquidity and capital safety take absolute priority.
        </div>
      </div>
    </div>
  );
};

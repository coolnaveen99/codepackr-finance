import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Percent } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateSimpleInterest,
  DEFAULT_SIMPLE_INTEREST_INPUTS,
  SIMPLE_INTEREST_MODEL_VERSION,
} from '../../lib/financial/simpleInterest';

interface SimpleInterestCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const DISCLAIMER =
  'This calculator provides an estimate of simple (non-compounding) interest based on the amounts you enter. It does not account for taxes, fees, penalties, or compounding, and is for educational and planning purposes only — not financial or tax advice.';

const LAST_REVIEWED = '2026-09-10';

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  // Strip leading zeros / non-numeric noise, mirroring the pattern used by
  // the other calculators in CalculatorsView.tsx so behavior stays
  // consistent across the app.
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const SimpleInterestCalculatorView: React.FC<SimpleInterestCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();

  const [principalStr, setPrincipalStr] = useState(String(DEFAULT_SIMPLE_INTEREST_INPUTS.principal));
  const [rateStr, setRateStr] = useState(String(DEFAULT_SIMPLE_INTEREST_INPUTS.annualRatePercent));
  const [yearsStr, setYearsStr] = useState(String(DEFAULT_SIMPLE_INTEREST_INPUTS.years));

  const principal = parseFloat(principalStr) || 0;
  const annualRatePercent = parseFloat(rateStr) || 0;
  const years = parseFloat(yearsStr) || 0;

  const result = useMemo(
    () => calculateSimpleInterest({ principal, annualRatePercent, years }),
    [principal, annualRatePercent, years]
  );

  const handleReset = () => {
    setPrincipalStr(String(DEFAULT_SIMPLE_INTEREST_INPUTS.principal));
    setRateStr(String(DEFAULT_SIMPLE_INTEREST_INPUTS.annualRatePercent));
    setYearsStr(String(DEFAULT_SIMPLE_INTEREST_INPUTS.years));
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-3xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency toolbar */}
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
          <CurrencySelector idPrefix="simple-interest-currency" variant="pill" />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              PRINCIPAL AMOUNT ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={principalStr}
              onChange={(e) => handleCleanInput(e.target.value, setPrincipalStr)}
              placeholder="e.g. 100000"
              className="w-full p-2.5 rounded-xl border font-mono text-sm outline-none font-bold"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
            />
            <span className="text-[11px] text-[var(--muted)] mt-1 block">
              {principal > 0 ? formatAmount(principal) : 'Enter principal amount'}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ANNUAL INTEREST RATE (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={rateStr}
              onChange={(e) => handleCleanInput(e.target.value, setRateStr)}
              placeholder="e.g. 8"
              className="w-full p-2.5 rounded-xl border font-mono text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
            />
            <span className="text-[11px] text-[var(--muted)] mt-1 block">{annualRatePercent}% per annum</span>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              TIME PERIOD (YEARS)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={yearsStr}
              onChange={(e) => handleCleanInput(e.target.value, setYearsStr)}
              placeholder="e.g. 5"
              className="w-full p-2.5 rounded-xl border font-mono text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
            />
            <span className="text-[11px] text-[var(--muted)] mt-1 block">Fractional years supported (e.g. 2.5)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-[var(--surface-2)]"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </button>

        {/* Results */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Interest
            </div>
            <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.totalInterest)}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Maturity Amount
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.maturityAmount)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Principal
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.principal)}
            </div>
          </div>
        </div>

        {/* Yearly breakdown */}
        {result.yearlyBreakdown.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <th className="text-left py-2 font-semibold" style={{ color: 'var(--muted)' }}>
                    Year
                  </th>
                  <th className="text-right py-2 font-semibold" style={{ color: 'var(--muted)' }}>
                    Opening Balance
                  </th>
                  <th className="text-right py-2 font-semibold" style={{ color: 'var(--muted)' }}>
                    Interest
                  </th>
                  <th className="text-right py-2 font-semibold" style={{ color: 'var(--muted)' }}>
                    Closing Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="border-b" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2 font-mono">{row.year}</td>
                    <td className="py-2 text-right font-mono">{formatAmount(row.openingBalance)}</td>
                    <td className="py-2 text-right font-mono text-[var(--brand)]">
                      {formatAmount(row.interestForYear)}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold">{formatAmount(row.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Methodology & assumptions (per master-plan requirement: never hide assumptions) */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <strong>Formula:</strong> Simple Interest = (Principal × Rate × Time) ÷ 100. Unlike compound interest,
              simple interest never accrues on previously earned interest — each year earns the same amount.
            </p>
            <p>
              <strong>Model version:</strong> {SIMPLE_INTEREST_MODEL_VERSION} · <strong>Last reviewed:</strong>{' '}
              {LAST_REVIEWED}
            </p>
            <p>{DISCLAIMER}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <Percent className="w-3.5 h-3.5" />
          Need compounding instead? Try the Investment Calculator for compound interest growth.
        </div>
      </div>
    </div>
  );
};

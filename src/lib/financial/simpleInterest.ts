/**
 * CodePackr Finance — Simple Interest Engine
 * -------------------------------------------
 * Pure, framework-free calculation engine (no UI, no rounding during
 * computation — round only for display in the component layer).
 *
 * Formula (standard simple interest, non-compounding):
 *   SI = (P * R * T) / 100
 *   Maturity Amount = P + SI
 *
 * Where:
 *   P = principal (in the active currency's base unit)
 *   R = annual interest rate, in percent (e.g. 6.5 for 6.5%)
 *   T = time, in years (fractional years supported, e.g. 2.5)
 *
 * Rounding rule: none internally. All rounding for display happens in the
 * component layer via `formatAmount` / `toFixed`, matching the rest of the
 * engines in this directory (see `financial/engine.ts`).
 *
 * Edge cases handled:
 *   - Negative or non-finite inputs are clamped to 0 before calculation.
 *   - T = 0 years -> zero interest, maturity = principal.
 *   - Fractional years are supported (T need not be a whole number).
 *
 * Source/methodology: standard simple interest formula as taught in
 * introductory finance/accounting (non-compounding interest on a fixed
 * principal). This is distinct from the Compound Interest engine used by
 * the Investment Calculator (`investment-calculator`), which compounds
 * interest on interest.
 */

export const SIMPLE_INTEREST_MODEL_VERSION = '1.0';

export interface SimpleInterestInputs {
  principal: number;
  annualRatePercent: number;
  years: number;
}

export interface SimpleInterestYearRow {
  year: number; // 1-indexed; may be fractional-labelled for partial final year
  openingBalance: number;
  interestForYear: number;
  cumulativeInterest: number;
  closingBalance: number;
}

export interface SimpleInterestResult {
  version: string;
  principal: number;
  annualRatePercent: number;
  years: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: SimpleInterestYearRow[];
}

const safeNonNegative = (v: number): number => (Number.isFinite(v) && v > 0 ? v : 0);

/**
 * Calculate simple interest and maturity amount for a fixed principal held
 * over a given number of years at a fixed annual rate.
 */
export function calculateSimpleInterest(inputs: SimpleInterestInputs): SimpleInterestResult {
  const principal = safeNonNegative(inputs.principal);
  const annualRatePercent = safeNonNegative(inputs.annualRatePercent);
  const years = safeNonNegative(inputs.years);

  const totalInterest = (principal * annualRatePercent * years) / 100;
  const maturityAmount = principal + totalInterest;

  // Yearly breakdown: simple interest accrues linearly, so each full year
  // contributes an equal slice; a fractional final year contributes a
  // pro-rated slice. This is purely for the display table/chart — the
  // totals above are always computed directly from the formula, not by
  // summing this breakdown, to avoid rounding drift.
  const yearlyBreakdown: SimpleInterestYearRow[] = [];
  const annualInterest = (principal * annualRatePercent) / 100;
  const fullYears = Math.floor(years);
  const remainder = years - fullYears;

  let cumulativeInterest = 0;
  for (let y = 1; y <= fullYears; y++) {
    const openingBalance = principal + cumulativeInterest;
    cumulativeInterest += annualInterest;
    yearlyBreakdown.push({
      year: y,
      openingBalance,
      interestForYear: annualInterest,
      cumulativeInterest,
      closingBalance: principal + cumulativeInterest,
    });
  }

  if (remainder > 0) {
    const partialInterest = annualInterest * remainder;
    const openingBalance = principal + cumulativeInterest;
    cumulativeInterest += partialInterest;
    yearlyBreakdown.push({
      year: fullYears + remainder,
      openingBalance,
      interestForYear: partialInterest,
      cumulativeInterest,
      closingBalance: principal + cumulativeInterest,
    });
  }

  return {
    version: SIMPLE_INTEREST_MODEL_VERSION,
    principal,
    annualRatePercent,
    years,
    totalInterest,
    maturityAmount,
    yearlyBreakdown,
  };
}

export const DEFAULT_SIMPLE_INTEREST_INPUTS: SimpleInterestInputs = {
  principal: 100000,
  annualRatePercent: 8,
  years: 5,
};

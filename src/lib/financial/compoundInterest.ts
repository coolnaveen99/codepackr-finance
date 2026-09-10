/**
 * CodePackr Finance — Compound Interest Calculation Engine
 * --------------------------------------------------------
 * Pure mathematical engine for compound interest with customizable compounding
 * frequencies (daily, monthly, quarterly, semi-annually, annually), optional periodic
 * contributions, and Annual Percentage Yield (APY) calculations.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const COMPOUND_INTEREST_ENGINE_VERSION = '1.1.0';

export type CompoundingFrequency = 1 | 2 | 4 | 12 | 365;

export interface CompoundInterestInputs {
  initialPrincipal: number;
  annualInterestRate: number; // e.g. 7.5 for 7.5%
  tenureYears: number;
  compoundingFrequency: CompoundingFrequency;
  periodicDeposit?: number;
  depositFrequency?: 'monthly' | 'annually';
}

export interface CompoundYearSummary {
  year: number;
  openingBalance: number;
  depositsThisYear: number;
  interestThisYear: number;
  closingBalance: number;
  cumulativeDeposits: number;
  cumulativeInterest: number;
}

export interface CompoundInterestResult {
  initialPrincipal: number;
  totalDeposits: number;
  totalInvested: number; // initialPrincipal + totalDeposits
  totalInterestEarned: number;
  maturityBalance: number;
  effectiveAnnualYieldPercent: number; // APY/EAR
  nominalInterestRate: number;
  tenureYears: number;
  compoundingFrequency: CompoundingFrequency;
  yearlyBreakdown: CompoundYearSummary[];
}

/**
 * Calculates Effective Annual Rate (APY): (1 + r/n)^n - 1
 */
export function calculateEffectiveAnnualRate(nominalRatePercent: number, frequency: CompoundingFrequency): number {
  if (nominalRatePercent <= 0) return 0;
  const r = nominalRatePercent / 100;
  const apy = Math.pow(1 + r / frequency, frequency) - 1;
  return apy * 100;
}

/**
 * Pure calculation of Compound Interest with Periodic Contributions
 */
export function calculateCompoundInterest(inputs: CompoundInterestInputs): CompoundInterestResult {
  const principal = Math.max(0, inputs.initialPrincipal || 0);
  const annualRate = Math.max(0, inputs.annualInterestRate || 0);
  const tenureYears = Math.max(1, Math.round(inputs.tenureYears || 1));
  const frequency = inputs.compoundingFrequency || 12;
  const deposit = Math.max(0, inputs.periodicDeposit || 0);
  const depositFreq = inputs.depositFrequency || 'monthly';

  const ratePerCompound = (annualRate / 100) / frequency;
  const apy = calculateEffectiveAnnualRate(annualRate, frequency);

  let currentBalance = principal;
  let cumulativePeriodicDeposits = 0;
  const yearlyBreakdown: CompoundYearSummary[] = [];

  // Monthly simulation step for precise accounting
  for (let yr = 1; yr <= tenureYears; yr++) {
    const openingBalance = currentBalance;
    let depositsThisYear = 0;

    // Simulate through 12 months for this year
    for (let m = 1; m <= 12; m++) {
      if (deposit > 0) {
        if (depositFreq === 'monthly') {
          currentBalance += deposit;
          cumulativePeriodicDeposits += deposit;
          depositsThisYear += deposit;
        } else if (depositFreq === 'annually' && m === 1) {
          currentBalance += deposit;
          cumulativePeriodicDeposits += deposit;
          depositsThisYear += deposit;
        }
      }

      // Compound interest accrued across the monthly slice
      // Compounding occurs frequency / 12 times per month
      const compoundsThisMonth = frequency / 12;
      if (compoundsThisMonth >= 1) {
        for (let c = 0; c < Math.round(compoundsThisMonth); c++) {
          currentBalance *= (1 + ratePerCompound);
        }
      } else {
        // Less than monthly (e.g. quarterly = 4, annual = 1)
        // Check if this month hits a compounding checkpoint
        if (frequency === 4 && (m === 3 || m === 6 || m === 9 || m === 12)) {
          currentBalance *= (1 + (annualRate / 100) / 4);
        } else if (frequency === 2 && (m === 6 || m === 12)) {
          currentBalance *= (1 + (annualRate / 100) / 2);
        } else if (frequency === 1 && m === 12) {
          currentBalance *= (1 + annualRate / 100);
        }
      }
    }

    const interestThisYear = Math.max(0, currentBalance - openingBalance - depositsThisYear);
    const cumulativeInvestedSoFar = principal + cumulativePeriodicDeposits;
    const cumulativeInterest = Math.max(0, currentBalance - cumulativeInvestedSoFar);

    yearlyBreakdown.push({
      year: yr,
      openingBalance,
      depositsThisYear,
      interestThisYear,
      closingBalance: currentBalance,
      cumulativeDeposits: cumulativePeriodicDeposits,
      cumulativeInterest,
    });
  }

  const maturityBalance = currentBalance;
  const totalInvested = principal + cumulativePeriodicDeposits;
  const totalInterestEarned = Math.max(0, maturityBalance - totalInvested);

  return {
    initialPrincipal: principal,
    totalDeposits: cumulativePeriodicDeposits,
    totalInvested,
    totalInterestEarned,
    maturityBalance,
    effectiveAnnualYieldPercent: apy,
    nominalInterestRate: annualRate,
    tenureYears,
    compoundingFrequency: frequency,
    yearlyBreakdown,
  };
}

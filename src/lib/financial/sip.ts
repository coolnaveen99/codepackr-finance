/**
 * CodePackr Finance — Systematic Investment Plan (SIP) Calculation Engine
 * ----------------------------------------------------------------------
 * Pure mathematical engine for monthly SIP investments, annual step-up
 * compounding, inflation-adjusted purchasing power, and wealth projection.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const SIP_ENGINE_VERSION = '1.1.0';

export interface SipInputs {
  monthlyInvestment: number;
  expectedAnnualReturnRate: number; // e.g. 12 for 12%
  tenureYears: number;
  annualStepUpPercent?: number; // e.g. 10 for 10% increase every 12 months
  annualStepUpAmount?: number; // e.g. 1000 for fixed increase every 12 months
  expectedInflationRate?: number; // e.g. 6 for 6% annual inflation
}

export interface SipYearSummary {
  year: number;
  monthlyDeposit: number;
  annualDeposited: number;
  cumulativeInvested: number;
  cumulativeGains: number;
  endCorpus: number;
  inflationAdjustedCorpus: number;
}

export interface SipResult {
  totalInvested: number;
  wealthGained: number;
  maturityValue: number;
  realPurchasingPower: number;
  nominalReturnPercentage: number; // (wealthGained / totalInvested) * 100
  tenureYears: number;
  startingMonthlyInvestment: number;
  endingMonthlyInvestment: number;
  yearlyBreakdown: SipYearSummary[];
}

/**
 * Calculates standard SIP maturity without step-up using the Annuity Due formula
 */
export function calculateSimpleSipMaturity(monthlyDeposit: number, annualReturnRate: number, tenureYears: number): number {
  if (monthlyDeposit <= 0 || tenureYears <= 0) return 0;
  const n = tenureYears * 12;
  if (annualReturnRate <= 0) return monthlyDeposit * n;

  const i = annualReturnRate / (12 * 100);
  return monthlyDeposit * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

/**
 * Calculates complete SIP projection with optional annual step-up and inflation
 */
export function calculateSip(inputs: SipInputs): SipResult {
  const initialMonthly = Math.max(0, inputs.monthlyInvestment || 0);
  const annualReturn = Math.max(0, inputs.expectedAnnualReturnRate || 0);
  const tenureYears = Math.max(1, Math.round(inputs.tenureYears || 1));
  const stepUpPercent = Math.max(0, inputs.annualStepUpPercent || 0);
  const stepUpAmount = Math.max(0, inputs.annualStepUpAmount || 0);
  const inflationRate = Math.max(0, inputs.expectedInflationRate || 0);

  const monthlyRate = annualReturn / (12 * 100);
  const totalMonths = tenureYears * 12;

  let currentCorpus = 0;
  let cumulativeInvested = 0;
  let currentMonthlyDeposit = initialMonthly;

  const yearlyBreakdown: SipYearSummary[] = [];

  let yearCumulativeInvested = 0;
  let annualDepositedInYear = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // Deposit made at the beginning of the month
    currentCorpus += currentMonthlyDeposit;
    cumulativeInvested += currentMonthlyDeposit;
    annualDepositedInYear += currentMonthlyDeposit;

    // Monthly compound growth applied
    currentCorpus *= (1 + monthlyRate);

    // End of year checkpoint
    if (m % 12 === 0) {
      const year = m / 12;
      yearCumulativeInvested += annualDepositedInYear;

      const inflationDiscountFactor = Math.pow(1 + inflationRate / 100, year);
      const realCorpus = inflationRate > 0 ? currentCorpus / inflationDiscountFactor : currentCorpus;

      yearlyBreakdown.push({
        year,
        monthlyDeposit: currentMonthlyDeposit,
        annualDeposited: annualDepositedInYear,
        cumulativeInvested,
        cumulativeGains: Math.max(0, currentCorpus - cumulativeInvested),
        endCorpus: currentCorpus,
        inflationAdjustedCorpus: realCorpus,
      });

      // Apply annual step-up for the next year if applicable
      if (year < tenureYears) {
        if (stepUpPercent > 0) {
          currentMonthlyDeposit = currentMonthlyDeposit * (1 + stepUpPercent / 100);
        } else if (stepUpAmount > 0) {
          currentMonthlyDeposit += stepUpAmount;
        }
      }

      annualDepositedInYear = 0;
    }
  }

  const maturityValue = currentCorpus;
  const wealthGained = Math.max(0, maturityValue - cumulativeInvested);
  const inflationDiscount = Math.pow(1 + inflationRate / 100, tenureYears);
  const realPurchasingPower = inflationRate > 0 ? maturityValue / inflationDiscount : maturityValue;
  const nominalReturnPercentage = cumulativeInvested > 0 ? (wealthGained / cumulativeInvested) * 100 : 0;

  return {
    totalInvested: cumulativeInvested,
    wealthGained,
    maturityValue,
    realPurchasingPower,
    nominalReturnPercentage,
    tenureYears,
    startingMonthlyInvestment: initialMonthly,
    endingMonthlyInvestment: currentMonthlyDeposit,
    yearlyBreakdown,
  };
}

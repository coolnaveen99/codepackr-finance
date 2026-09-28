/**
 * Fixed Deposit (FD) Calculator Engine
 * Cumulative & non-cumulative, multiple compounding frequencies,
 * senior citizen boost, pre/post-tax, TDS, inflation-adjusted real return.
 * 100% client-side. Illustrative only.
 */

export const FD_ENGINE_VERSION = '1.0.0';

export type CompoundingFreq = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type PayoutType = 'cumulative' | 'monthly' | 'quarterly' | 'yearly';

export interface FdInputs {
  principal: number;
  annualRate: number;
  tenureYears: number;
  tenureMonths?: number;
  compounding: CompoundingFreq;
  payout: PayoutType;
  seniorCitizen?: boolean;
  seniorBoost?: number;
  taxSlabPercent?: number;
  applyTds?: boolean;
  inflationPercent?: number;
}

export interface FdResult {
  effectiveRate: number;
  maturityAmount: number;
  totalInterest: number;
  interestPayoutPerPeriod: number;
  postTaxInterest: number;
  postTaxMaturity: number;
  tdsAmount: number;
  realMaturity: number;
  notes: string[];
}

function periodsPerYear(freq: CompoundingFreq): number {
  switch (freq) {
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'half-yearly': return 2;
    case 'yearly': return 1;
  }
}

export function calculateFd(inputs: FdInputs): FdResult {
  const principal = Math.max(0, inputs.principal);
  let rate = Math.max(0, inputs.annualRate);
  const seniorBoost = inputs.seniorBoost ?? 0.5;
  if (inputs.seniorCitizen) rate += seniorBoost;
  const years = Math.max(0, inputs.tenureYears) + Math.max(0, inputs.tenureMonths ?? 0) / 12;
  const n = periodsPerYear(inputs.compounding);
  const taxSlab = Math.max(0, Math.min(100, inputs.taxSlabPercent ?? 0));
  const inflation = Math.max(0, inputs.inflationPercent ?? 0);
  const notes: string[] = [];

  let maturityAmount = principal;
  let totalInterest = 0;
  let interestPayoutPerPeriod = 0;

  if (inputs.payout === 'cumulative') {
    // A = P (1 + r/n)^(n*t)
    const factor = Math.pow(1 + rate / 100 / n, n * years);
    maturityAmount = principal * factor;
    totalInterest = maturityAmount - principal;
  } else {
    // Non-cumulative: simple periodic interest on principal
    const payoutN =
      inputs.payout === 'monthly' ? 12 : inputs.payout === 'quarterly' ? 4 : 1;
    interestPayoutPerPeriod = (principal * rate) / 100 / payoutN;
    totalInterest = interestPayoutPerPeriod * payoutN * years;
    maturityAmount = principal; // principal returned at end
  }

  // TDS: 10% if interest > 40k (50k senior) — illustrative
  const tdsThreshold = inputs.seniorCitizen ? 50_000 : 40_000;
  let tdsAmount = 0;
  if (inputs.applyTds && totalInterest > tdsThreshold) {
    tdsAmount = totalInterest * 0.1;
    notes.push(
      `TDS @10% applied on interest above ₹${(tdsThreshold / 1000).toFixed(0)}k threshold (illustrative).`
    );
  }

  const taxableInterest = Math.max(0, totalInterest - tdsAmount);
  const taxOnInterest = taxableInterest * (taxSlab / 100);
  const postTaxInterest = totalInterest - tdsAmount - taxOnInterest;
  const postTaxMaturity =
    inputs.payout === 'cumulative'
      ? principal + postTaxInterest
      : principal; // payout already taxed conceptually

  const realMaturity =
    inflation > 0 && years > 0
      ? maturityAmount / Math.pow(1 + inflation / 100, years)
      : maturityAmount;

  if (inputs.seniorCitizen) {
    notes.push(`Senior citizen rate boost of +${seniorBoost}% applied (illustrative; banks vary).`);
  }
  notes.push('Figures are illustrative. Actual bank rates, compounding and TDS rules may differ.');
  notes.push('FD interest is taxable as per your slab. Prefer Form 15G/15H if eligible to avoid TDS.');

  return {
    effectiveRate: rate,
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(totalInterest),
    interestPayoutPerPeriod: Math.round(interestPayoutPerPeriod),
    postTaxInterest: Math.round(postTaxInterest),
    postTaxMaturity: Math.round(postTaxMaturity),
    tdsAmount: Math.round(tdsAmount),
    realMaturity: Math.round(realMaturity),
    notes,
  };
}

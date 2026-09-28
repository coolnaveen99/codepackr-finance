/**
 * Senior Citizens Savings Scheme (SCSS) Calculator Engine
 * Default 8.2% p.a. (Q2 FY 2026-27), quarterly interest payout.
 * Max deposit ₹30 lakh. Tenure 5 years (extendable 3 years).
 * 100% client-side. Illustrative only.
 */

export const SCSS_ENGINE_VERSION = '1.0.0';
export const SCSS_DEFAULT_RATE = 8.2;
export const SCSS_MAX_DEPOSIT = 30_00_000;
export const SCSS_TENURE_YEARS = 5;

export interface ScssInputs {
  deposit: number;
  rate?: number;
  tenureYears?: number;
}

export interface ScssResult {
  rate: number;
  tenureYears: number;
  cappedDeposit: number;
  quarterlyInterest: number;
  annualInterest: number;
  totalInterestOverTenure: number;
  maturityAmount: number;
  notes: string[];
}

export function calculateScss(inputs: ScssInputs): ScssResult {
  let deposit = Math.max(0, inputs.deposit);
  const capped = Math.min(deposit, SCSS_MAX_DEPOSIT);
  const rate = inputs.rate ?? SCSS_DEFAULT_RATE;
  const tenureYears = inputs.tenureYears ?? SCSS_TENURE_YEARS;

  const annualInterest = (capped * rate) / 100;
  const quarterlyInterest = annualInterest / 4;
  const totalInterestOverTenure = annualInterest * tenureYears;
  // Principal returned at maturity; interest paid quarterly during tenure
  const maturityAmount = capped;

  const notes: string[] = [
    `SCSS rate default ${SCSS_DEFAULT_RATE}% p.a. (Govt small-savings, Q2 FY 2026-27). Reviewed quarterly.`,
    `Maximum deposit limit is ₹${(SCSS_MAX_DEPOSIT / 1_00_000).toFixed(0)} lakh (combined accounts).`,
    'Interest is paid quarterly. Principal is returned at end of tenure (5 years; extendable by 3 years).',
    'Eligible: age 60+ (or 55+ on voluntary retirement under conditions). Interest is taxable.',
    'Illustrative only. Confirm with bank / India Post for exact payout schedule.',
  ];
  if (deposit > SCSS_MAX_DEPOSIT) {
    notes.unshift(`Deposit capped at ₹${(SCSS_MAX_DEPOSIT / 1_00_000).toFixed(0)} lakh scheme limit.`);
  }

  return {
    rate,
    tenureYears,
    cappedDeposit: Math.round(capped),
    quarterlyInterest: Math.round(quarterlyInterest),
    annualInterest: Math.round(annualInterest),
    totalInterestOverTenure: Math.round(totalInterestOverTenure),
    maturityAmount: Math.round(maturityAmount),
    notes,
  };
}

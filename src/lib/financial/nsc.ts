/**
 * National Savings Certificate (NSC) Calculator Engine
 * 5-year tenure, default 7.7% p.a. (Q2 FY 2026-27), annually compounded.
 * 80C eligible; interest taxable (reinvested, not paid out).
 * 100% client-side. Illustrative only.
 */

export const NSC_ENGINE_VERSION = '1.0.0';
export const NSC_DEFAULT_RATE = 7.7;
export const NSC_TENURE_YEARS = 5;

export interface NscInputs {
  investment: number;
  rate?: number;
  tenureYears?: number;
}

export interface NscYearRow {
  year: number;
  opening: number;
  interest: number;
  closing: number;
}

export interface NscResult {
  rate: number;
  tenureYears: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: NscYearRow[];
  notes: string[];
}

export function calculateNsc(inputs: NscInputs): NscResult {
  const principal = Math.max(0, inputs.investment);
  const rate = inputs.rate ?? NSC_DEFAULT_RATE;
  const tenureYears = inputs.tenureYears ?? NSC_TENURE_YEARS;

  let balance = principal;
  const yearlyBreakdown: NscYearRow[] = [];

  for (let y = 1; y <= tenureYears; y++) {
    const opening = balance;
    const interest = balance * (rate / 100);
    balance += interest;
    yearlyBreakdown.push({
      year: y,
      opening: Math.round(opening),
      interest: Math.round(interest),
      closing: Math.round(balance),
    });
  }

  const notes: string[] = [
    `NSC rate default ${NSC_DEFAULT_RATE}% p.a. (Govt small-savings, Q2 FY 2026-27). Reviewed quarterly.`,
    'Standard tenure is 5 years. Interest is compounded annually and paid at maturity.',
    'Investment qualifies for Section 80C (old regime). Interest is taxable but deemed reinvested.',
    'Illustrative only. Confirm with India Post / bank for exact maturity value.',
  ];

  return {
    rate,
    tenureYears,
    totalInterest: Math.round(balance - principal),
    maturityAmount: Math.round(balance),
    yearlyBreakdown,
    notes,
  };
}

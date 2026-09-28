/**
 * Sukanya Samriddhi Yojana (SSY) Calculator Engine
 * Girl-child savings scheme. Default rate 8.2% (Q2 FY 2026-27).
 * Deposit till age 15 / 21-year maturity. EEE tax status.
 * 100% client-side. Illustrative only.
 */

export const SSY_ENGINE_VERSION = '1.0.0';
export const SSY_DEFAULT_RATE = 8.2;
export const SSY_MAX_ANNUAL = 150_000;
export const SSY_MIN_ANNUAL = 250;

export interface SsyInputs {
  annualDeposit: number;
  girlAge: number;
  rate?: number;
  existingBalance?: number;
}

export interface SsyYearRow {
  year: number;
  age: number;
  opening: number;
  deposit: number;
  interest: number;
  closing: number;
}

export interface SsyResult {
  rate: number;
  depositYears: number;
  maturityYears: number;
  totalDeposited: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: SsyYearRow[];
  notes: string[];
}

export function calculateSsy(inputs: SsyInputs): SsyResult {
  const rate = inputs.rate ?? SSY_DEFAULT_RATE;
  let annualDeposit = Math.max(0, inputs.annualDeposit);
  if (annualDeposit > 0 && annualDeposit < SSY_MIN_ANNUAL) annualDeposit = SSY_MIN_ANNUAL;
  if (annualDeposit > SSY_MAX_ANNUAL) annualDeposit = SSY_MAX_ANNUAL;

  const girlAge = Math.max(0, Math.min(10, Math.round(inputs.girlAge))); // open before age 10
  // Deposits allowed till girl turns 15 (or 15 years from account opening, whichever earlier — simplified: till age 15)
  const depositYears = Math.max(1, 15 - girlAge);
  // Matures when girl turns 21
  const maturityYears = Math.max(depositYears, 21 - girlAge);

  let balance = Math.max(0, inputs.existingBalance ?? 0);
  let totalDeposited = 0;
  const yearlyBreakdown: SsyYearRow[] = [];

  for (let y = 1; y <= maturityYears; y++) {
    const opening = balance;
    const deposit = y <= depositYears ? annualDeposit : 0;
    balance += deposit;
    totalDeposited += deposit;
    const interest = balance * (rate / 100);
    balance += interest;
    yearlyBreakdown.push({
      year: y,
      age: girlAge + y,
      opening: Math.round(opening),
      deposit: Math.round(deposit),
      interest: Math.round(interest),
      closing: Math.round(balance),
    });
  }

  const notes: string[] = [
    `SSY rate default ${SSY_DEFAULT_RATE}% p.a. (Govt small-savings, Q2 FY 2026-27). Reviewed quarterly.`,
    'EEE tax status: contribution (80C, old regime), interest and maturity are tax-free.',
    'Account can be opened for a girl child below 10 years. Deposits till she turns 15; matures at 21 (or on marriage after 18).',
    'Annual deposit capped at ₹1.5 lakh. Minimum ₹250/year.',
    'Illustrative only. Confirm with bank / India Post for exact passbook interest.',
  ];

  return {
    rate,
    depositYears,
    maturityYears,
    totalDeposited: Math.round(totalDeposited),
    totalInterest: Math.round(balance - totalDeposited - (inputs.existingBalance ?? 0)),
    maturityAmount: Math.round(balance),
    yearlyBreakdown,
    notes,
  };
}

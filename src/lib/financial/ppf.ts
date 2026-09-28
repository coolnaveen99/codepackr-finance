/**
 * Public Provident Fund (PPF) Calculator Engine
 * 15-year base + 5-year extensions, ₹500–₹1.5L annual limit,
 * before-5th deposit rule, year-wise passbook, 80C illustration.
 * Default rate 7.1% (Q2 FY 2026-27). 100% client-side.
 */

export const PPF_ENGINE_VERSION = '1.0.0';
export const PPF_DEFAULT_RATE = 7.1;
export const PPF_MAX_ANNUAL = 150_000;
export const PPF_MIN_ANNUAL = 500;

export interface PpfInputs {
  annualDeposit: number;
  rate?: number;
  tenureYears?: number; // 15, 20, 25...
  existingBalance?: number;
  depositBeforeFifth?: boolean;
  taxSlabPercent?: number; // for 80C savings under old regime
}

export interface PpfYearRow {
  year: number;
  opening: number;
  deposit: number;
  interest: number;
  closing: number;
}

export interface PpfResult {
  rate: number;
  tenureYears: number;
  totalDeposited: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: PpfYearRow[];
  section80cAnnual: number;
  lifetime80cSavings: number;
  notes: string[];
}

export function calculatePpf(inputs: PpfInputs): PpfResult {
  const rate = inputs.rate ?? PPF_DEFAULT_RATE;
  let annualDeposit = Math.max(0, inputs.annualDeposit);
  if (annualDeposit > 0 && annualDeposit < PPF_MIN_ANNUAL) {
    annualDeposit = PPF_MIN_ANNUAL;
  }
  if (annualDeposit > PPF_MAX_ANNUAL) {
    annualDeposit = PPF_MAX_ANNUAL;
  }

  // Tenure: minimum 15, then multiples of 5
  let tenureYears = inputs.tenureYears ?? 15;
  if (tenureYears < 15) tenureYears = 15;
  if (tenureYears > 15) {
    // snap to 15 + 5k
    const extra = tenureYears - 15;
    tenureYears = 15 + Math.ceil(extra / 5) * 5;
  }
  tenureYears = Math.min(tenureYears, 50);

  const existing = Math.max(0, inputs.existingBalance ?? 0);
  const beforeFifth = inputs.depositBeforeFifth !== false; // default true
  const taxSlab = Math.max(0, Math.min(100, inputs.taxSlabPercent ?? 30));

  let balance = existing;
  let totalDeposited = 0;
  const yearlyBreakdown: PpfYearRow[] = [];

  for (let y = 1; y <= tenureYears; y++) {
    const opening = balance;
    // After base 15 years, extension can be with or without contribution.
    // We assume continued contribution unless deposit is 0.
    const deposit = annualDeposit;
    balance += deposit;
    totalDeposited += deposit;

    // Interest: compounded annually. If deposit before 5th of each month
    // for monthly mode, full year interest applies on annual lump for simplicity
    // when treating as annual deposit at start of year.
    // Standard PPF formula uses lowest balance between 5th and end of month,
    // summed monthly then /12. For annual deposit at beginning: full year interest.
    const interest = beforeFifth
      ? balance * (rate / 100)
      : (balance - deposit) * (rate / 100); // late deposit earns less in year 1 of that deposit

    balance += interest;
    yearlyBreakdown.push({
      year: y,
      opening: Math.round(opening),
      deposit: Math.round(deposit),
      interest: Math.round(interest),
      closing: Math.round(balance),
    });
  }

  const maturityAmount = Math.round(balance);
  const totalInterest = Math.round(maturityAmount - existing - totalDeposited);
  const section80cAnnual = Math.min(annualDeposit, PPF_MAX_ANNUAL);
  const lifetime80cSavings = Math.round(
    section80cAnnual * (taxSlab / 100) * tenureYears
  );

  const notes: string[] = [];
  notes.push(
    `PPF rate default ${PPF_DEFAULT_RATE}% p.a. (Govt small-savings rate, Q2 FY 2026-27). Reviewed quarterly.`
  );
  notes.push(
    'EEE tax status: contribution (80C, old regime), interest and maturity are all tax-free.'
  );
  notes.push(
    'Annual deposit capped at ₹1.5 lakh. Minimum ₹500/year to keep account active.'
  );
  if (!beforeFifth) {
    notes.push(
      'Deposit after 5th of the month earns interest only from the following month (simplified annual model).'
    );
  }
  if (tenureYears > 15) {
    notes.push(
      `Tenure includes ${tenureYears - 15}-year extension block(s) beyond the mandatory 15 years.`
    );
  }
  notes.push('Illustrative only. Confirm with bank / India Post for exact passbook interest.');

  return {
    rate,
    tenureYears,
    totalDeposited: Math.round(totalDeposited),
    totalInterest,
    maturityAmount,
    yearlyBreakdown,
    section80cAnnual,
    lifetime80cSavings,
    notes,
  };
}

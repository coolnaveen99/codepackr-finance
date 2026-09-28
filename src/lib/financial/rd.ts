/**
 * Recurring Deposit (RD) Calculator Engine
 * Monthly deposits, quarterly compounding (standard bank RD).
 * Optional annual step-up. 100% client-side.
 */

export const RD_ENGINE_VERSION = '1.0.0';

export interface RdInputs {
  monthlyDeposit: number;
  annualRate: number;
  tenureMonths: number;
  stepUpPercent?: number;
  seniorCitizen?: boolean;
  seniorBoost?: number;
}

export interface RdYearRow {
  year: number;
  deposit: number;
  interest: number;
  closing: number;
}

export interface RdResult {
  effectiveRate: number;
  totalDeposited: number;
  totalInterest: number;
  maturityAmount: number;
  yearlyBreakdown: RdYearRow[];
  notes: string[];
}

export function calculateRd(inputs: RdInputs): RdResult {
  const monthlyDeposit = Math.max(0, inputs.monthlyDeposit);
  let rate = Math.max(0, inputs.annualRate);
  const seniorBoost = inputs.seniorBoost ?? 0.5;
  if (inputs.seniorCitizen) rate += seniorBoost;
  const tenureMonths = Math.max(1, Math.round(inputs.tenureMonths));
  const stepUp = Math.max(0, inputs.stepUpPercent ?? 0);
  const quarterlyRate = rate / 100 / 4;

  let balance = 0;
  let totalDeposited = 0;
  let currentMonthly = monthlyDeposit;
  const yearlyBreakdown: RdYearRow[] = [];
  let yearDeposit = 0;
  let yearInterest = 0;
  let yearOpen = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    if ((m - 1) % 12 === 0) {
      yearOpen = balance;
      yearDeposit = 0;
      yearInterest = 0;
      if (yearIdx > 0 && stepUp > 0) {
        currentMonthly = monthlyDeposit * Math.pow(1 + stepUp / 100, yearIdx);
      }
    }

    balance += currentMonthly;
    totalDeposited += currentMonthly;
    yearDeposit += currentMonthly;

    // Quarterly compounding at end of Mar/Jun/Sep/Dec-like months (every 3rd month)
    if (m % 3 === 0) {
      const interest = balance * quarterlyRate;
      balance += interest;
      yearInterest += interest;
    }

    if (m % 12 === 0 || m === tenureMonths) {
      yearlyBreakdown.push({
        year: yearIdx + 1,
        deposit: Math.round(yearDeposit),
        interest: Math.round(yearInterest),
        closing: Math.round(balance),
      });
    }
  }

  const maturityAmount = Math.round(balance);
  const totalInterest = Math.round(maturityAmount - totalDeposited);
  const notes: string[] = [];
  if (inputs.seniorCitizen) {
    notes.push(`Senior citizen boost +${seniorBoost}% applied (illustrative).`);
  }
  notes.push('Bank RDs typically compound quarterly. Actual bank formulas may vary slightly.');
  notes.push('RD interest is taxable as per your income slab.');

  return {
    effectiveRate: rate,
    totalDeposited: Math.round(totalDeposited),
    totalInterest,
    maturityAmount,
    yearlyBreakdown,
    notes,
  };
}

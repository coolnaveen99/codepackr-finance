/**
 * Systematic Withdrawal Plan (SWP) Calculator Engine
 * Corpus drawdown with fixed or inflation-linked withdrawals.
 * 100% client-side. Illustrative only.
 */

export const SWP_ENGINE_VERSION = '1.0.0';

export interface SwpInputs {
  corpus: number;
  monthlyWithdrawal: number;
  expectedReturnPercent: number;
  tenureYears: number;
  inflationStepUpPercent?: number;
}

export interface SwpYearRow {
  year: number;
  withdrawn: number;
  interest: number;
  closing: number;
}

export interface SwpResult {
  totalWithdrawn: number;
  finalValue: number;
  yearsSurvived: number;
  depleted: boolean;
  yearlyBreakdown: SwpYearRow[];
  notes: string[];
}

export function calculateSwp(inputs: SwpInputs): SwpResult {
  let balance = Math.max(0, inputs.corpus);
  const monthlyReturn = Math.max(0, inputs.expectedReturnPercent) / 100 / 12;
  const tenureMonths = Math.max(1, Math.round(inputs.tenureYears * 12));
  const stepUp = Math.max(0, inputs.inflationStepUpPercent ?? 0);
  let monthlyWd = Math.max(0, inputs.monthlyWithdrawal);

  let totalWithdrawn = 0;
  let yearsSurvived = 0;
  let depleted = false;
  const yearlyBreakdown: SwpYearRow[] = [];
  let yearWithdrawn = 0;
  let yearInterest = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    if ((m - 1) % 12 === 0 && m > 1 && stepUp > 0) {
      monthlyWd *= 1 + stepUp / 100;
    }

    if (balance <= 0) {
      depleted = true;
      break;
    }

    const wd = Math.min(monthlyWd, balance);
    balance -= wd;
    totalWithdrawn += wd;
    yearWithdrawn += wd;

    const interest = balance * monthlyReturn;
    balance += interest;
    yearInterest += interest;

    if (m % 12 === 0 || m === tenureMonths || balance <= 0) {
      yearsSurvived = Math.ceil(m / 12);
      yearlyBreakdown.push({
        year: yearsSurvived,
        withdrawn: Math.round(yearWithdrawn),
        interest: Math.round(yearInterest),
        closing: Math.round(Math.max(0, balance)),
      });
      yearWithdrawn = 0;
      yearInterest = 0;
    }

    if (balance <= 0) {
      depleted = true;
      break;
    }
  }

  if (!depleted) yearsSurvived = inputs.tenureYears;

  const notes: string[] = [
    'SWP returns are market-linked and not guaranteed. Past performance is not indicative of future results.',
    'Equity SWP units held >1 year may attract LTCG tax in India (illustrative note only).',
    'Engine models monthly compounding on remaining corpus after withdrawal.',
  ];
  if (depleted) {
    notes.unshift(`Corpus is projected to deplete in about ${yearsSurvived} year(s) under these assumptions.`);
  }

  return {
    totalWithdrawn: Math.round(totalWithdrawn),
    finalValue: Math.round(Math.max(0, balance)),
    yearsSurvived,
    depleted,
    yearlyBreakdown,
    notes,
  };
}

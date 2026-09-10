/**
 * Time Value of Money (TVM) — Future Value (FV) Calculator Engine
 * 
 * Formula:
 * FV = PV * (1 + r/m)^(m*t) + PMT * [ ((1 + r/m)^(m*t) - 1) / (r/m) ] * (1 + (timing ? r/m : 0))
 */

export const FUTURE_VALUE_ENGINE_VERSION = '1.0.0';

export type CompoundingFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly';
export type DepositTiming = 'end' | 'beginning';

export interface FutureValueInput {
  presentValue: number; // Starting balance (PV)
  periodicDeposit: number; // Deposit amount (PMT)
  depositFrequency: 'monthly' | 'annually';
  annualInterestRate: number; // r in % (e.g. 8 for 8%)
  compoundingFrequency: CompoundingFrequency;
  timeHorizonYears: number; // t
  depositTiming?: DepositTiming; // 'end' (ordinary annuity) or 'beginning' (annuity due)
}

export interface FvYearSchedule {
  year: number;
  totalDeposited: number;
  interestEarnedYear: number;
  totalInterestEarned: number;
  balance: number;
}

export interface FutureValueResult {
  presentValue: number;
  totalDeposits: number;
  totalPrincipalContributed: number;
  totalInterestEarned: number;
  futureValue: number;
  wealthMultiple: number;
  yearlySchedule: FvYearSchedule[];
}

export function calculateFutureValue(input: FutureValueInput): FutureValueResult {
  const PV = Math.max(0, input.presentValue);
  const PMT = Math.max(0, input.periodicDeposit);
  const r = Math.max(0, input.annualInterestRate) / 100;
  const t = Math.max(0.1, input.timeHorizonYears);
  const timing = input.depositTiming || 'end';
  const depFreq = input.depositFrequency || 'monthly';

  // Number of compoundings per year (m)
  const compoundingsPerYear: Record<CompoundingFrequency, number> = {
    'annually': 1,
    'semi-annually': 2,
    'quarterly': 4,
    'monthly': 12,
  };
  const m = compoundingsPerYear[input.compoundingFrequency] || 12;

  // Simulate month by month (12 steps per year) for precision
  const totalMonths = Math.round(t * 12);
  const monthlyEffectiveRate = Math.pow(1 + r / m, m / 12) - 1;

  let balance = PV;
  let totalDeposits = 0;
  let totalInterest = 0;

  const yearlySchedule: FvYearSchedule[] = [];
  let currentYearInterest = 0;
  let currentYearDeposits = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const isDepositMonth = depFreq === 'monthly' || (depFreq === 'annually' && month % 12 === 1);
    const depositThisMonth = isDepositMonth ? PMT : 0;

    if (timing === 'beginning') {
      balance += depositThisMonth;
      totalDeposits += depositThisMonth;
      currentYearDeposits += depositThisMonth;
    }

    const interest = balance * monthlyEffectiveRate;
    balance += interest;
    totalInterest += interest;
    currentYearInterest += interest;

    if (timing === 'end') {
      balance += depositThisMonth;
      totalDeposits += depositThisMonth;
      currentYearDeposits += depositThisMonth;
    }

    if (month % 12 === 0 || month === totalMonths) {
      const yearNum = Math.ceil(month / 12);
      yearlySchedule.push({
        year: yearNum,
        totalDeposited: Math.round((PV + totalDeposits) * 100) / 100,
        interestEarnedYear: Math.round(currentYearInterest * 100) / 100,
        totalInterestEarned: Math.round(totalInterest * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });
      currentYearInterest = 0;
      currentYearDeposits = 0;
    }
  }

  const futureValue = Math.round(balance * 100) / 100;
  const roundedDeposits = Math.round(totalDeposits * 100) / 100;
  const totalPrincipalContributed = Math.round((PV + roundedDeposits) * 100) / 100;
  const totalInterestEarned = Math.round(totalInterest * 100) / 100;
  const wealthMultiple = totalPrincipalContributed > 0 
    ? Math.round((futureValue / totalPrincipalContributed) * 100) / 100 
    : 1;

  return {
    presentValue: PV,
    totalDeposits: roundedDeposits,
    totalPrincipalContributed,
    totalInterestEarned,
    futureValue,
    wealthMultiple,
    yearlySchedule,
  };
}

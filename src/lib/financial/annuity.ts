/**
 * Annuity Calculation Engine (Immediate & Deferred Annuities)
 * Computes:
 * - Immediate Annuity: Given a principal lump sum, calculates regular retirement payouts
 * - Deferred Annuity: Given periodic investments, calculates future accumulated corpus & payouts
 */

export type AnnuityType = 'immediate' | 'deferred';
export type AnnuityTiming = 'ordinary' | 'due';

export interface AnnuityInputs {
  annuityType: AnnuityType;
  timing: AnnuityTiming;
  frequency: 'monthly' | 'quarterly' | 'annual';
  principal?: number; // Starting lump sum (for immediate annuity)
  periodicPayment?: number; // Periodic contribution (for deferred annuity)
  annualInterestRate: number; // Annual interest rate (%)
  tenureYears: number; // Payout / investment duration (years)
  deferralYears?: number; // Accumulation phase before payouts begin
}

export interface AnnuityScheduleRow {
  period: number;
  payment: number;
  interestEarned: number;
  cumulativePaid: number;
  balance: number;
}

export interface AnnuityResult {
  annuityType: AnnuityType;
  totalPeriods: number;
  calculatedPayment: number;
  calculatedFutureValue: number;
  totalPrincipalInvested: number;
  totalPayoutReceived: number;
  totalInterestEarned: number;
  schedule: AnnuityScheduleRow[];
}

export function calculateAnnuity(inputs: AnnuityInputs): AnnuityResult {
  const {
    annuityType,
    timing,
    frequency,
    principal = 0,
    periodicPayment = 0,
    annualInterestRate,
    tenureYears,
    deferralYears = 0,
  } = inputs;

  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const totalPeriods = Math.max(1, Math.round(tenureYears * periodsPerYear));
  const r = Math.max(0.00001, annualInterestRate / 100 / periodsPerYear);
  const timingFactor = timing === 'due' ? 1 + r : 1;

  let calculatedPayment = 0;
  let calculatedFutureValue = 0;
  let totalPrincipalInvested = 0;
  let totalPayoutReceived = 0;
  let totalInterestEarned = 0;
  const schedule: AnnuityScheduleRow[] = [];

  if (annuityType === 'immediate') {
    // Principal is known. Calculate regular payment PMT:
    // PVA = PMT * [ (1 - (1+r)^-n) / r ] * timingFactor
    // => PMT = PVA / ( [ (1 - (1+r)^-n) / r ] * timingFactor )
    const pvFactor = ((1 - Math.pow(1 + r, -totalPeriods)) / r) * timingFactor;
    calculatedPayment = pvFactor > 0 ? principal / pvFactor : 0;
    totalPrincipalInvested = principal;
    totalPayoutReceived = calculatedPayment * totalPeriods;
    totalInterestEarned = Math.max(0, totalPayoutReceived - totalPrincipalInvested);

    let balance = principal;
    let cumulativePaid = 0;

    for (let p = 1; p <= totalPeriods; p++) {
      let interest = 0;
      if (timing === 'due') {
        balance -= calculatedPayment;
        interest = Math.max(0, balance * r);
        balance += interest;
      } else {
        interest = Math.max(0, balance * r);
        balance = Math.max(0, balance + interest - calculatedPayment);
      }
      cumulativePaid += calculatedPayment;

      schedule.push({
        period: p,
        payment: Math.round(calculatedPayment),
        interestEarned: Math.round(interest),
        cumulativePaid: Math.round(cumulativePaid),
        balance: Math.round(balance),
      });
    }
  } else {
    // Deferred annuity: periodic savings into accumulating corpus
    // FVA = PMT * [ ((1+r)^n - 1) / r ] * timingFactor
    const fvFactor = ((Math.pow(1 + r, totalPeriods) - 1) / r) * timingFactor;
    calculatedFutureValue = periodicPayment * fvFactor;

    // If there's an additional deferral period where money grows untouched:
    if (deferralYears > 0) {
      const deferralPeriods = deferralYears * periodsPerYear;
      calculatedFutureValue *= Math.pow(1 + r, deferralPeriods);
    }

    totalPrincipalInvested = periodicPayment * totalPeriods;
    totalPayoutReceived = calculatedFutureValue;
    totalInterestEarned = Math.max(0, calculatedFutureValue - totalPrincipalInvested);

    let balance = 0;
    let cumulativePaid = 0;

    for (let p = 1; p <= totalPeriods; p++) {
      cumulativePaid += periodicPayment;
      let interest = 0;
      if (timing === 'due') {
        balance += periodicPayment;
        interest = balance * r;
        balance += interest;
      } else {
        interest = balance * r;
        balance += periodicPayment + interest;
      }

      schedule.push({
        period: p,
        payment: Math.round(periodicPayment),
        interestEarned: Math.round(interest),
        cumulativePaid: Math.round(cumulativePaid),
        balance: Math.round(balance),
      });
    }
  }

  return {
    annuityType,
    totalPeriods,
    calculatedPayment: Math.round(calculatedPayment),
    calculatedFutureValue: Math.round(calculatedFutureValue),
    totalPrincipalInvested: Math.round(totalPrincipalInvested),
    totalPayoutReceived: Math.max(1, Math.round(totalPayoutReceived)),
    totalInterestEarned: Math.round(totalInterestEarned),
    schedule,
  };
}

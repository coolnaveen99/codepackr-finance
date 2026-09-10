/**
 * CodePackr Finance — Loan & EMI Calculation Engine
 * -------------------------------------------------
 * Pure mathematical engine for reducing balance loan amortization,
 * equated monthly installments, prepayment scenarios, and schedules.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const LOAN_EMI_ENGINE_VERSION = '1.1.0';

export interface LoanEmiInputs {
  principal: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number;
  extraMonthlyPayment?: number; // Optional prepayment added to every EMI
  extraAnnualLumpSum?: number; // Optional prepayment made at the end of each year
}

export interface AmortizationRow {
  month: number;
  year: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  totalPaid: number;
  closingBalance: number;
}

export interface AmortizationYearSummary {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  extraPayment: number;
  totalPaid: number;
  closingBalance: number;
}

export interface PrepaymentImpact {
  originalMonths: number;
  effectiveMonths: number;
  monthsSaved: number;
  originalInterest: number;
  effectiveInterest: number;
  interestSaved: number;
  interestSavedPercentage: number;
}

export interface LoanEmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  tenureMonths: number;
  annualInterestRate: number;
  interestRatioPercentage: number; // (Total Interest / Total Payment) * 100
  amortizationSchedule: AmortizationRow[];
  yearlySchedule: AmortizationYearSummary[];
  prepaymentImpact?: PrepaymentImpact;
}

/**
 * Pure calculation of monthly EMI: P * r * (1+r)^n / ((1+r)^n - 1)
 */
export function calculateBaseMonthlyEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) {
    return principal / tenureMonths;
  }

  const r = annualRate / (12 * 100);
  const factor = Math.pow(1 + r, tenureMonths);
  if (!isFinite(factor) || factor <= 1) {
    return principal / tenureMonths;
  }
  return (principal * r * factor) / (factor - 1);
}

/**
 * Calculates full reducing balance amortization with optional prepayments
 */
export function calculateLoanEmi(inputs: LoanEmiInputs): LoanEmiResult {
  const principal = Math.max(0, inputs.principal || 0);
  const annualInterestRate = Math.max(0, inputs.annualInterestRate || 0);
  const tenureMonths = Math.max(1, Math.round(inputs.tenureMonths || 1));
  const extraMonthly = Math.max(0, inputs.extraMonthlyPayment || 0);
  const extraAnnual = Math.max(0, inputs.extraAnnualLumpSum || 0);

  const baseEmi = calculateBaseMonthlyEmi(principal, annualInterestRate, tenureMonths);

  const monthlyRate = annualInterestRate / (12 * 100);
  let currentBalance = principal;
  const amortizationSchedule: AmortizationRow[] = [];
  const yearlyScheduleMap = new Map<number, AmortizationYearSummary>();

  let totalInterest = 0;
  let totalPayment = 0;
  let month = 1;

  // Track regular without prepayment for comparison
  let originalTotalInterest = 0;
  if (extraMonthly > 0 || extraAnnual > 0) {
    let simBal = principal;
    for (let m = 1; m <= tenureMonths && simBal > 0.01; m++) {
      const interest = simBal * monthlyRate;
      const prin = Math.min(simBal, baseEmi - interest);
      originalTotalInterest += interest;
      simBal -= prin;
    }
  }

  while (currentBalance > 0.005 && month <= tenureMonths * 2) {
    const year = Math.ceil(month / 12);
    const openingBalance = currentBalance;
    const interestPaid = openingBalance * monthlyRate;

    let emiPortion = baseEmi;
    let extraThisMonth = extraMonthly;

    // Add annual lump sum at the 12th, 24th, 36th month etc.
    if (month % 12 === 0 && extraAnnual > 0) {
      extraThisMonth += extraAnnual;
    }

    let principalPaid = emiPortion - interestPaid;

    if (openingBalance + interestPaid < emiPortion + extraThisMonth) {
      // Final payoff
      principalPaid = openingBalance;
      emiPortion = openingBalance + interestPaid;
      extraThisMonth = 0;
    } else {
      principalPaid = Math.min(openingBalance, principalPaid + extraThisMonth);
    }

    const closingBalance = Math.max(0, openingBalance + interestPaid - (emiPortion + (extraThisMonth > 0 ? 0 : 0)) - (extraThisMonth));
    const actualTotalPaid = principalPaid + interestPaid;

    totalInterest += interestPaid;
    totalPayment += actualTotalPaid;
    currentBalance = Math.max(0, openingBalance - principalPaid);

    amortizationSchedule.push({
      month,
      year,
      openingBalance,
      emi: emiPortion,
      principalPaid,
      interestPaid,
      extraPayment: extraThisMonth,
      totalPaid: actualTotalPaid,
      closingBalance: currentBalance,
    });

    // Update yearly aggregation
    let yrSummary = yearlyScheduleMap.get(year);
    if (!yrSummary) {
      yrSummary = {
        year,
        openingBalance,
        principalPaid: 0,
        interestPaid: 0,
        extraPayment: 0,
        totalPaid: 0,
        closingBalance: currentBalance,
      };
      yearlyScheduleMap.set(year, yrSummary);
    }
    yrSummary.principalPaid += principalPaid;
    yrSummary.interestPaid += interestPaid;
    yrSummary.extraPayment += extraThisMonth;
    yrSummary.totalPaid += actualTotalPaid;
    yrSummary.closingBalance = currentBalance;

    month++;
  }

  const effectiveMonths = amortizationSchedule.length;
  const yearlySchedule = Array.from(yearlyScheduleMap.values());
  const interestRatioPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  let prepaymentImpact: PrepaymentImpact | undefined = undefined;
  if (extraMonthly > 0 || extraAnnual > 0) {
    const origInt = originalTotalInterest;
    const intSaved = Math.max(0, origInt - totalInterest);
    const monthsSaved = Math.max(0, tenureMonths - effectiveMonths);
    prepaymentImpact = {
      originalMonths: tenureMonths,
      effectiveMonths,
      monthsSaved,
      originalInterest: origInt,
      effectiveInterest: totalInterest,
      interestSaved: intSaved,
      interestSavedPercentage: origInt > 0 ? (intSaved / origInt) * 100 : 0,
    };
  }

  return {
    monthlyEmi: baseEmi,
    totalInterest,
    totalPayment,
    principal,
    tenureMonths: effectiveMonths,
    annualInterestRate,
    interestRatioPercentage,
    amortizationSchedule,
    yearlySchedule,
    prepaymentImpact,
  };
}

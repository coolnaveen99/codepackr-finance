/**
 * Loan Amortization Schedule Engine
 * 
 * Generates monthly and annual reducing-balance amortization schedules,
 * principal reduction breakdown, cumulative interest, and payoff tracking.
 */

export const LOAN_AMORTIZATION_ENGINE_VERSION = '1.0.0';

export interface LoanAmortizationInput {
  loanAmount: number;
  annualInterestRate: number; // e.g. 7.5%
  loanTenureYears: number;
}

export interface AmortizationMonthRow {
  month: number;
  year: number;
  beginningBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface AmortizationYearRow {
  year: number;
  beginningBalance: number;
  totalEmiPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanAmortizationResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principalToInterestRatio: number;
  interestToPrincipalRatio: number;
  totalMonths: number;
  yearlySchedule: AmortizationYearRow[];
  monthlySchedule: AmortizationMonthRow[];
}

export function calculateLoanAmortization(input: LoanAmortizationInput): LoanAmortizationResult {
  const P = Math.max(0, input.loanAmount);
  const rate = Math.max(0, input.annualInterestRate);
  const years = Math.max(0.1, input.loanTenureYears);

  const totalMonths = Math.round(years * 12);
  const monthlyRate = rate / 100 / 12;

  let monthlyEmi = 0;
  if (monthlyRate === 0) {
    monthlyEmi = totalMonths > 0 ? P / totalMonths : 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyEmi = (P * monthlyRate * factor) / (factor - 1);
  }
  monthlyEmi = Math.round(monthlyEmi * 100) / 100;

  const monthlySchedule: AmortizationMonthRow[] = [];
  const yearlySchedule: AmortizationYearRow[] = [];

  let currentBalance = P;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  let currentYearPrincipal = 0;
  let currentYearInterest = 0;
  let currentYearEmi = 0;
  let yearStartBalance = P;

  for (let m = 1; m <= totalMonths; m++) {
    if (currentBalance <= 0.01) break;

    const beginningBalance = currentBalance;
    const interest = Math.round(currentBalance * monthlyRate * 100) / 100;
    let principal = Math.round((monthlyEmi - interest) * 100) / 100;

    if (m === totalMonths || principal > currentBalance) {
      principal = currentBalance;
    }

    currentBalance = Math.max(0, Math.round((currentBalance - principal) * 100) / 100);
    cumulativeInterest = Math.round((cumulativeInterest + interest) * 100) / 100;
    cumulativePrincipal = Math.round((cumulativePrincipal + principal) * 100) / 100;

    const y = Math.ceil(m / 12);
    currentYearPrincipal += principal;
    currentYearInterest += interest;
    currentYearEmi += principal + interest;

    monthlySchedule.push({
      month: m,
      year: y,
      beginningBalance,
      emi: Math.round((principal + interest) * 100) / 100,
      principalPaid: principal,
      interestPaid: interest,
      endingBalance: currentBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (m % 12 === 0 || m === totalMonths) {
      yearlySchedule.push({
        year: y,
        beginningBalance: yearStartBalance,
        totalEmiPaid: Math.round(currentYearEmi * 100) / 100,
        principalPaid: Math.round(currentYearPrincipal * 100) / 100,
        interestPaid: Math.round(currentYearInterest * 100) / 100,
        endingBalance: currentBalance,
        cumulativeInterest,
        cumulativePrincipal,
      });

      yearStartBalance = currentBalance;
      currentYearPrincipal = 0;
      currentYearInterest = 0;
      currentYearEmi = 0;
    }
  }

  const totalInterest = cumulativeInterest;
  const totalPayment = Math.round((P + totalInterest) * 100) / 100;
  const principalToInterestRatio = totalPayment > 0 ? Math.round((P / totalPayment) * 10000) / 100 : 0;
  const interestToPrincipalRatio = totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 10000) / 100 : 0;

  return {
    monthlyEmi,
    totalInterest,
    totalPayment,
    principalToInterestRatio,
    interestToPrincipalRatio,
    totalMonths,
    yearlySchedule,
    monthlySchedule,
  };
}

/**
 * Loan Prepayment & Payoff Accelerator Engine
 * 
 * Computes exact interest savings, months shaved off loan term,
 * and side-by-side comparison between baseline amortization and prepayment strategy.
 */

export const LOAN_PREPAYMENT_ENGINE_VERSION = '1.0.0';

export interface LoanPrepaymentInput {
  loanAmount: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  loanTenureYears: number;
  monthlyExtraPayment?: number; // Extra paid every month
  annualLumpSumPayment?: number; // Extra paid once every 12 months
  oneTimePrepayment?: number; // Paid at start or specified month
  oneTimePrepaymentMonth?: number; // Month 1-based when one-time payment is made
}

export interface PrepaymentSchedulePoint {
  month: number;
  year: number;
  baselineBalance: number;
  acceleratedBalance: number;
  baselineInterestPaidCumulative: number;
  acceleratedInterestPaidCumulative: number;
  monthlyExtra: number;
}

export interface LoanPrepaymentResult {
  regularEmi: number;
  baselineTotalInterest: number;
  baselineTotalPayment: number;
  baselineMonths: number;
  
  acceleratedTotalInterest: number;
  acceleratedTotalPayment: number;
  acceleratedMonths: number;
  
  totalInterestSaved: number;
  monthsSaved: number;
  yearsSaved: number;
  payoffAccelerationPercentage: number;
  
  scheduleSample: PrepaymentSchedulePoint[];
}

export function calculateLoanPrepayment(input: LoanPrepaymentInput): LoanPrepaymentResult {
  const P = Math.max(0, input.loanAmount);
  const annualRate = Math.max(0, input.annualInterestRate);
  const tenureYears = Math.max(0.1, input.loanTenureYears);
  const monthlyExtra = Math.max(0, input.monthlyExtraPayment || 0);
  const annualLumpSum = Math.max(0, input.annualLumpSumPayment || 0);
  const oneTime = Math.max(0, input.oneTimePrepayment || 0);
  const oneTimeMonth = Math.max(1, input.oneTimePrepaymentMonth || 1);

  const totalMonths = Math.round(tenureYears * 12);
  const monthlyRate = annualRate / 100 / 12;

  // Regular EMI calculation
  let regularEmi = 0;
  if (monthlyRate === 0) {
    regularEmi = totalMonths > 0 ? P / totalMonths : 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    regularEmi = (P * monthlyRate * factor) / (factor - 1);
  }
  regularEmi = Math.round(regularEmi * 100) / 100;

  // 1. Simulate Baseline Schedule
  let baselineBal = P;
  let baselineTotalInterest = 0;
  let baselineMonths = 0;

  for (let m = 1; m <= totalMonths; m++) {
    if (baselineBal <= 0.01) break;
    const interest = baselineBal * monthlyRate;
    baselineTotalInterest += interest;
    const principal = Math.min(baselineBal, regularEmi - interest);
    baselineBal -= principal;
    baselineMonths = m;
  }
  baselineTotalInterest = Math.round(baselineTotalInterest * 100) / 100;
  const baselineTotalPayment = Math.round((P + baselineTotalInterest) * 100) / 100;

  // 2. Simulate Accelerated Schedule with Prepayments
  let accBal = P;
  let acceleratedTotalInterest = 0;
  let acceleratedMonths = 0;
  let totalPrepaymentsMade = 0;

  const scheduleSample: PrepaymentSchedulePoint[] = [];
  let cumBaseInt = 0;
  let cumAccInt = 0;
  let simBaseBal = P;

  for (let m = 1; m <= totalMonths * 2; m++) {
    if (accBal <= 0.01) break;

    const interest = accBal * monthlyRate;
    acceleratedTotalInterest += interest;
    cumAccInt += interest;

    let pay = regularEmi;
    let extraThisMonth = monthlyExtra;

    if (annualLumpSum > 0 && m % 12 === 0) {
      extraThisMonth += annualLumpSum;
    }
    if (oneTime > 0 && m === oneTimeMonth) {
      extraThisMonth += oneTime;
    }

    const principal = pay - interest;
    const totalPrincipalReduction = principal + extraThisMonth;

    if (totalPrincipalReduction >= accBal) {
      totalPrepaymentsMade += Math.max(0, accBal - principal);
      accBal = 0;
    } else {
      accBal -= totalPrincipalReduction;
      totalPrepaymentsMade += extraThisMonth;
    }

    acceleratedMonths = m;

    // Track baseline in lockstep for chart/comparison
    if (simBaseBal > 0.01) {
      const bInt = simBaseBal * monthlyRate;
      cumBaseInt += bInt;
      simBaseBal -= Math.min(simBaseBal, regularEmi - bInt);
    }

    if (m === 1 || m % 12 === 0 || accBal <= 0.01) {
      scheduleSample.push({
        month: m,
        year: Math.ceil(m / 12),
        baselineBalance: Math.round(simBaseBal * 100) / 100,
        acceleratedBalance: Math.round(accBal * 100) / 100,
        baselineInterestPaidCumulative: Math.round(cumBaseInt * 100) / 100,
        acceleratedInterestPaidCumulative: Math.round(cumAccInt * 100) / 100,
        monthlyExtra: extraThisMonth,
      });
    }
  }

  acceleratedTotalInterest = Math.round(acceleratedTotalInterest * 100) / 100;
  const acceleratedTotalPayment = Math.round((P + acceleratedTotalInterest) * 100) / 100;

  const totalInterestSaved = Math.max(0, Math.round((baselineTotalInterest - acceleratedTotalInterest) * 100) / 100);
  const monthsSaved = Math.max(0, baselineMonths - acceleratedMonths);
  const yearsSaved = Math.round((monthsSaved / 12) * 10) / 10;
  const payoffAccelerationPercentage = baselineMonths > 0 
    ? Math.round(((baselineMonths - acceleratedMonths) / baselineMonths) * 1000) / 10 
    : 0;

  return {
    regularEmi,
    baselineTotalInterest,
    baselineTotalPayment,
    baselineMonths,
    acceleratedTotalInterest,
    acceleratedTotalPayment,
    acceleratedMonths,
    totalInterestSaved,
    monthsSaved,
    yearsSaved,
    payoffAccelerationPercentage,
    scheduleSample,
  };
}

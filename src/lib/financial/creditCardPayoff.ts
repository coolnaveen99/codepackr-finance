/**
 * Credit Card Interest & Payoff Engine
 * Compares minimum payment payoff trajectory vs fixed accelerated payments,
 * calculating interest saved, time reduction, and payoff milestones.
 */

export interface CreditCardPayoffInputs {
  currentBalance: number; // Principal card balance ($)
  annualInterestRate: number; // APR (%)
  minimumPaymentPercent: number; // e.g. 2% or 3%
  floorPaymentAmount: number; // e.g. $25 or $35 minimum floor
  extraMonthlyPayment: number; // Additional monthly cash towards debt ($)
  fixedTargetPayment?: number; // Optional fixed payment strategy (e.g. $250/mo)
}

export interface CreditCardScheduleRow {
  month: number;
  startingBalance: number;
  interestCharged: number;
  payment: number;
  principalPaid: number;
  endingBalance: number;
}

export interface PayoffStrategySummary {
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  schedule: CreditCardScheduleRow[];
  neverPayoffWarning: boolean;
}

export interface CreditCardPayoffResult {
  minimumOnlyStrategy: PayoffStrategySummary;
  acceleratedStrategy: PayoffStrategySummary;
  interestSaved: number;
  monthsSaved: number;
  yearsSaved: number;
}

function simulatePayoff(
  initialBalance: number,
  monthlyRate: number,
  mode: 'min' | 'extra',
  minPercent: number,
  floorAmount: number,
  extraMonthly: number
): PayoffStrategySummary {
  let balance = initialBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: CreditCardScheduleRow[] = [];
  const maxMonths = 360; // 30-year safety limit
  let month = 0;
  let neverPayoffWarning = false;

  while (balance > 0.01 && month < maxMonths) {
    month++;
    const startingBalance = balance;
    const interest = balance * monthlyRate;
    totalInterest += interest;

    let payment = 0;
    if (mode === 'min') {
      const percentagePay = balance * (minPercent / 100);
      payment = Math.max(percentagePay, floorAmount);
    } else {
      // Accelerated: minimum + extra
      const percentagePay = balance * (minPercent / 100);
      const basePay = Math.max(percentagePay, floorAmount);
      payment = basePay + extraMonthly;
    }

    // Payment cannot exceed balance + interest
    const fullPayoffAmount = balance + interest;
    if (payment > fullPayoffAmount) {
      payment = fullPayoffAmount;
    }

    // Check if payment covers interest
    if (payment <= interest && balance > 50) {
      neverPayoffWarning = true;
      break;
    }

    const principal = Math.max(0, payment - interest);
    balance = Math.max(0, balance + interest - payment);
    totalPaid += payment;

    if (month <= 120 || balance <= 0.01) {
      schedule.push({
        month,
        startingBalance,
        interestCharged: interest,
        payment,
        principalPaid: principal,
        endingBalance: balance,
      });
    }
  }

  if (month >= maxMonths && balance > 0.01) {
    neverPayoffWarning = true;
  }

  return {
    monthsToPayoff: month,
    totalInterestPaid: totalInterest,
    totalAmountPaid: totalPaid,
    schedule,
    neverPayoffWarning,
  };
}

export function calculateCreditCardPayoff(
  inputs: CreditCardPayoffInputs
): CreditCardPayoffResult {
  const {
    currentBalance,
    annualInterestRate,
    minimumPaymentPercent,
    floorPaymentAmount,
    extraMonthlyPayment,
  } = inputs;

  const balance = Math.max(0, currentBalance);
  const monthlyRate = Math.max(0, annualInterestRate / 100 / 12);
  const minPercent = Math.max(1, minimumPaymentPercent);
  const floorAmount = Math.max(10, floorPaymentAmount);
  const extra = Math.max(0, extraMonthlyPayment);

  const minimumOnlyStrategy = simulatePayoff(
    balance,
    monthlyRate,
    'min',
    minPercent,
    floorAmount,
    0
  );

  const acceleratedStrategy = simulatePayoff(
    balance,
    monthlyRate,
    'extra',
    minPercent,
    floorAmount,
    extra
  );

  const interestSaved = Math.max(
    0,
    minimumOnlyStrategy.totalInterestPaid - acceleratedStrategy.totalInterestPaid
  );
  const monthsSaved = Math.max(
    0,
    minimumOnlyStrategy.monthsToPayoff - acceleratedStrategy.monthsToPayoff
  );
  const yearsSaved = Number((monthsSaved / 12).toFixed(1));

  return {
    minimumOnlyStrategy,
    acceleratedStrategy,
    interestSaved,
    monthsSaved,
    yearsSaved,
  };
}

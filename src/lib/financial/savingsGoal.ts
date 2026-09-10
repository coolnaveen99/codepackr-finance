/**
 * Savings Goal Calculator Engine
 * 
 * Computes monthly contribution needed to reach a targeted future corpus,
 * factoring in initial savings, expected annual returns, and compounding.
 */

export const SAVINGS_GOAL_ENGINE_VERSION = '1.0.0';

export interface SavingsGoalInput {
  targetGoalAmount: number; // e.g. 50,000 or 2,500,000
  initialSavings?: number; // Starting balance (PV)
  timeHorizonYears: number; // Duration to reach goal
  expectedAnnualReturnRate: number; // Annual yield/return %
}

export interface SavingsMilestone {
  percent: number;
  label: string;
  amount: number;
  estimatedMonth: number;
  estimatedYear: number;
}

export interface SavingsGoalResult {
  targetGoalAmount: number;
  initialSavings: number;
  requiredMonthlySavings: number;
  requiredAnnualSavings: number;
  totalSelfContributed: number;
  totalInterestEarned: number;
  interestSharePercent: number;
  milestones: SavingsMilestone[];
  reachEarlyScenario: {
    monthsSaved: number;
    extraMonthlyNeeded: number;
  };
}

export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const FV = Math.max(1, input.targetGoalAmount);
  const PV = Math.max(0, input.initialSavings || 0);
  const years = Math.max(0.25, input.timeHorizonYears);
  const annualRate = Math.max(0, input.expectedAnnualReturnRate) / 100;

  const totalMonths = Math.round(years * 12);
  const monthlyRate = annualRate / 12;

  // FV of initial savings
  const fvOfInitial = PV * Math.pow(1 + monthlyRate, totalMonths);
  const remainingGoal = Math.max(0, FV - fvOfInitial);

  let requiredMonthlySavings = 0;
  if (remainingGoal > 0) {
    if (monthlyRate === 0) {
      requiredMonthlySavings = remainingGoal / totalMonths;
    } else {
      // Ordinary annuity formula for PMT: FV = PMT * [((1+r)^n - 1) / r]
      const annuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
      requiredMonthlySavings = remainingGoal / annuityFactor;
    }
  }

  requiredMonthlySavings = Math.round(requiredMonthlySavings * 100) / 100;
  const requiredAnnualSavings = Math.round(requiredMonthlySavings * 12 * 100) / 100;

  const totalMonthlyContributions = Math.round(requiredMonthlySavings * totalMonths * 100) / 100;
  const totalSelfContributed = Math.round((PV + totalMonthlyContributions) * 100) / 100;
  const totalInterestEarned = Math.max(0, Math.round((FV - totalSelfContributed) * 100) / 100);
  const interestSharePercent = FV > 0 ? Math.round((totalInterestEarned / FV) * 10000) / 100 : 0;

  // Milestones tracking (25%, 50%, 75%, 100%)
  const milestones: SavingsMilestone[] = [];
  const targets = [
    { pct: 25, label: 'Quarterway Marker' },
    { pct: 50, label: 'Halfway Point' },
    { pct: 75, label: 'Three-Quarter Stage' },
    { pct: 100, label: 'Full Goal Achieved' },
  ];

  let simBal = PV;
  let currentTargetIdx = 0;

  for (let m = 1; m <= totalMonths && currentTargetIdx < targets.length; m++) {
    simBal += requiredMonthlySavings;
    simBal += simBal * monthlyRate;

    const currentTgt = targets[currentTargetIdx];
    const threshold = (FV * currentTgt.pct) / 100;

    if (simBal >= threshold || m === totalMonths) {
      milestones.push({
        percent: currentTgt.pct,
        label: currentTgt.label,
        amount: Math.round(threshold * 100) / 100,
        estimatedMonth: m,
        estimatedYear: Math.round((m / 12) * 10) / 10,
      });
      currentTargetIdx++;
    }
  }

  // Reach goal 1 year (or 20%) earlier scenario
  const earlyMonths = Math.max(1, totalMonths - 12);
  let earlyMonthly = 0;
  if (remainingGoal > 0) {
    if (monthlyRate === 0) {
      earlyMonthly = remainingGoal / earlyMonths;
    } else {
      const earlyFactor = (Math.pow(1 + monthlyRate, earlyMonths) - 1) / monthlyRate;
      earlyMonthly = remainingGoal / earlyFactor;
    }
  }
  const extraMonthlyNeeded = Math.max(0, Math.round((earlyMonthly - requiredMonthlySavings) * 100) / 100);

  return {
    targetGoalAmount: FV,
    initialSavings: PV,
    requiredMonthlySavings,
    requiredAnnualSavings,
    totalSelfContributed,
    totalInterestEarned,
    interestSharePercent,
    milestones,
    reachEarlyScenario: {
      monthsSaved: 12,
      extraMonthlyNeeded,
    },
  };
}

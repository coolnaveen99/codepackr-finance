/**
 * CodePackr Finance — FIRE (Financial Independence, Retire Early) Engine
 * ---------------------------------------------------------------------
 * Pure mathematical engine for calculating FIRE numbers (Standard, Lean,
 * Fat, Coast, Barista FIRE), Safe Withdrawal Rates (SWR), and timeline to FI.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const FIRE_ENGINE_VERSION = '1.0.0';

export interface FireInputs {
  currentAge: number;
  currentAnnualExpenses: number;
  currentNetWorth: number;
  annualSavings: number;
  expectedAnnualReturn: number; // % e.g. 10
  expectedInflation: number; // % e.g. 6
  safeWithdrawalRate?: number; // % e.g. 4.0 or 3.5
  baristaAnnualIncome?: number; // Part-time supplemental income
}

export interface FireTrajectoryPoint {
  year: number;
  age: number;
  corpus: number;
  fireTarget: number;
  isFireReached: boolean;
}

export interface FireResult {
  currentAge: number;
  standardFireNumber: number; // Today's money (Expenses * 100 / SWR)
  leanFireNumber: number; // 75% of expenses
  fatFireNumber: number; // 135% of expenses
  baristaFireNumber: number; // Net of barista income
  coastFireNumber: number; // Amount needed right now to compound into FIRE corpus by age 60 without adding a penny
  yearsToFire: number | null;
  ageAtFire: number | null;
  safeWithdrawalRate: number;
  savingsRatePercentage: number;
  trajectory: FireTrajectoryPoint[];
}

/**
 * Pure calculation of FIRE metrics and timeline
 */
export function calculateFire(inputs: FireInputs): FireResult {
  const currentAge = Math.max(18, Math.min(90, inputs.currentAge || 30));
  const annualExpenses = Math.max(0, inputs.currentAnnualExpenses || 0);
  const currentNetWorth = Math.max(0, inputs.currentNetWorth || 0);
  const annualSavings = Math.max(0, inputs.annualSavings || 0);
  const annualReturn = Math.max(0, inputs.expectedAnnualReturn || 10);
  const inflation = Math.max(0, inputs.expectedInflation || 6);
  const swr = Math.max(2.0, Math.min(8.0, inputs.safeWithdrawalRate || 4.0));
  const baristaIncome = Math.max(0, inputs.baristaAnnualIncome || 0);

  // Real return (Fisher equation approximation or exact real rate: (1+r)/(1+i) - 1)
  const realRate = ((1 + annualReturn / 100) / (1 + inflation / 100)) - 1;

  // SWR multiplier (e.g. 4% SWR -> 25x, 3.33% SWR -> 30x)
  const swrMultiplier = 100 / swr;

  // FIRE targets in today's purchasing power
  const standardFireNumber = annualExpenses * swrMultiplier;
  const leanFireNumber = (annualExpenses * 0.75) * swrMultiplier;
  const fatFireNumber = (annualExpenses * 1.35) * swrMultiplier;
  const netExpensesForBarista = Math.max(0, annualExpenses - baristaIncome);
  const baristaFireNumber = netExpensesForBarista * swrMultiplier;

  // Coast FIRE: assume traditional retirement at age 60
  const yearsTo60 = Math.max(0, 60 - currentAge);
  const coastFireNumber = yearsTo60 > 0 && realRate > 0
    ? standardFireNumber / Math.pow(1 + realRate, yearsTo60)
    : standardFireNumber;

  // Timeline simulation in real terms (today's constant money)
  let corpus = currentNetWorth;
  let yearsToFire: number | null = null;
  let ageAtFire: number | null = null;
  const trajectory: FireTrajectoryPoint[] = [];

  const maxSimulationYears = 50;
  for (let yr = 0; yr <= maxSimulationYears; yr++) {
    const age = currentAge + yr;
    const isReached = corpus >= standardFireNumber;

    if (isReached && yearsToFire === null) {
      yearsToFire = yr;
      ageAtFire = age;
    }

    trajectory.push({
      year: yr,
      age,
      corpus,
      fireTarget: standardFireNumber,
      isFireReached: isReached,
    });

    if (yr < maxSimulationYears) {
      // Real growth + real annual savings
      corpus = (corpus * (1 + realRate)) + annualSavings;
    }
  }

  const totalIncome = annualExpenses + annualSavings;
  const savingsRatePercentage = totalIncome > 0 ? (annualSavings / totalIncome) * 100 : 0;

  return {
    currentAge,
    standardFireNumber,
    leanFireNumber,
    fatFireNumber,
    baristaFireNumber,
    coastFireNumber,
    yearsToFire,
    ageAtFire,
    safeWithdrawalRate: swr,
    savingsRatePercentage,
    trajectory,
  };
}

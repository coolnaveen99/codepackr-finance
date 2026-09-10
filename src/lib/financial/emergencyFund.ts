/**
 * CodePackr Finance — Emergency Fund & Liquidity Engine
 * ----------------------------------------------------
 * Pure mathematical engine for sizing non-discretionary emergency reserves,
 * computing coverage duration, shortfall gaps, and time-to-full-funding.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const EMERGENCY_FUND_ENGINE_VERSION = '1.0.0';

export interface EmergencyFundInputs {
  monthlyHousing: number; // Rent or home loan EMI
  monthlyFoodGroceries: number;
  monthlyUtilitiesBills: number; // Electricity, water, internet, phone
  monthlyDebtEmi: number; // Car, student, personal loans
  monthlyInsuranceHealth: number; // Health, term, auto premiums
  monthlyOtherEssentials: number; // Medications, fuel, child essentials
  coverageMonths: number; // e.g. 3, 6, 9, 12 months
  currentSavings: number; // Liquid savings currently set aside
  monthlySavingsCapacity?: number; // How much user can save per month toward the fund
}

export interface ExpenseCategoryShare {
  category: string;
  amount: number;
  percentage: number;
}

export interface EmergencyFundResult {
  monthlyEssentialExpenses: number;
  coverageMonths: number;
  targetFundAmount: number;
  currentSavings: number;
  fundingGap: number;
  fundedPercentage: number;
  monthsToFullFunding: number | null;
  status: 'fully_funded' | 'partially_funded' | 'vulnerable';
  expenseShares: ExpenseCategoryShare[];
}

/**
 * Pure calculation of emergency fund target and gap analysis
 */
export function calculateEmergencyFund(inputs: EmergencyFundInputs): EmergencyFundResult {
  const housing = Math.max(0, inputs.monthlyHousing || 0);
  const food = Math.max(0, inputs.monthlyFoodGroceries || 0);
  const utilities = Math.max(0, inputs.monthlyUtilitiesBills || 0);
  const debt = Math.max(0, inputs.monthlyDebtEmi || 0);
  const insurance = Math.max(0, inputs.monthlyInsuranceHealth || 0);
  const other = Math.max(0, inputs.monthlyOtherEssentials || 0);

  const monthlyEssentialExpenses = housing + food + utilities + debt + insurance + other;
  const coverageMonths = Math.max(1, inputs.coverageMonths || 6);
  const targetFundAmount = monthlyEssentialExpenses * coverageMonths;
  const currentSavings = Math.max(0, inputs.currentSavings || 0);

  const fundingGap = Math.max(0, targetFundAmount - currentSavings);
  const fundedPercentage = targetFundAmount > 0
    ? Math.min(100, (currentSavings / targetFundAmount) * 100)
    : 100;

  const monthlySavings = Math.max(0, inputs.monthlySavingsCapacity || 0);
  let monthsToFullFunding: number | null = null;
  if (fundingGap <= 0) {
    monthsToFullFunding = 0;
  } else if (monthlySavings > 0) {
    monthsToFullFunding = Math.ceil(fundingGap / monthlySavings);
  }

  let status: 'fully_funded' | 'partially_funded' | 'vulnerable' = 'vulnerable';
  if (fundedPercentage >= 100) {
    status = 'fully_funded';
  } else if (fundedPercentage >= 50) {
    status = 'partially_funded';
  }

  const expenseShares: ExpenseCategoryShare[] = [
    { category: 'Housing & Rent', amount: housing, percentage: monthlyEssentialExpenses > 0 ? (housing / monthlyEssentialExpenses) * 100 : 0 },
    { category: 'Food & Groceries', amount: food, percentage: monthlyEssentialExpenses > 0 ? (food / monthlyEssentialExpenses) * 100 : 0 },
    { category: 'Utilities & Bills', amount: utilities, percentage: monthlyEssentialExpenses > 0 ? (utilities / monthlyEssentialExpenses) * 100 : 0 },
    { category: 'Debt & EMI Obligations', amount: debt, percentage: monthlyEssentialExpenses > 0 ? (debt / monthlyEssentialExpenses) * 100 : 0 },
    { category: 'Insurance & Healthcare', amount: insurance, percentage: monthlyEssentialExpenses > 0 ? (insurance / monthlyEssentialExpenses) * 100 : 0 },
    { category: 'Other Critical Essentials', amount: other, percentage: monthlyEssentialExpenses > 0 ? (other / monthlyEssentialExpenses) * 100 : 0 },
  ];

  return {
    monthlyEssentialExpenses,
    coverageMonths,
    targetFundAmount,
    currentSavings,
    fundingGap,
    fundedPercentage,
    monthsToFullFunding,
    status,
    expenseShares,
  };
}

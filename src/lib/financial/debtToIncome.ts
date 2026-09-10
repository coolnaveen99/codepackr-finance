/**
 * Debt-to-Income (DTI) Ratio Calculation Engine
 * 
 * Formula:
 * DTI (%) = (Total Monthly Debt Obligations / Gross Monthly Income) * 100
 * Front-End DTI (%) = (Housing Debt / Gross Monthly Income) * 100
 * Back-End DTI (%) = ((Housing Debt + Recurring Non-Housing Debt) / Gross Monthly Income) * 100
 * 
 * Benchmarks:
 * - < 20%: Excellent (Very low debt burden)
 * - 20% - 35%: Healthy / Manageable (Ideal for credit approval)
 * - 36% - 43%: Borderline / Moderate (Lenders review closely; Fannie Mae/QM standard limit ~43%)
 * - 44% - 49%: High Risk (Difficult to secure conventional loans)
 * - >= 50%: Critical (Severe debt distress)
 */

export const DTI_ENGINE_VERSION = '1.0.0';

export interface DebtToIncomeInput {
  grossMonthlyIncome: number;
  monthlyMortgageRent: number;
  monthlyAutoLoan: number;
  monthlyStudentLoan: number;
  monthlyCreditCardMin: number;
  monthlyPersonalLoanOther: number;
}

export type DtiStatusTier = 'excellent' | 'healthy' | 'moderate' | 'high_risk' | 'critical';
export type DtiInput = DebtToIncomeInput;

export interface DtiBreakdownItem {
  category: string;
  amount: number;
  percentageOfIncome: number;
  percentageOfDebt: number;
}

export interface DebtToIncomeResult {
  grossMonthlyIncome: number;
  totalMonthlyDebt: number;
  frontEndDtiPercent: number; // Housing only
  backEndDtiPercent: number;  // Total debt
  statusTier: DtiStatusTier;
  statusLabel: string;
  statusDescription: string;
  remainingDiscretionaryIncome: number;
  maxRecommendedDebt36: number; // Max debt at 36% benchmark
  maxQualifiedDebt43: number;    // Max debt at 43% benchmark (QM ceiling)
  borrowingRoomRemaining: number;
  debtBreakdown: DtiBreakdownItem[];
}

export function calculateDebtToIncome(input: DebtToIncomeInput): DebtToIncomeResult {
  const grossMonthlyIncome = Math.max(0, input.grossMonthlyIncome);
  const housing = Math.max(0, input.monthlyMortgageRent);
  const auto = Math.max(0, input.monthlyAutoLoan);
  const student = Math.max(0, input.monthlyStudentLoan);
  const creditCard = Math.max(0, input.monthlyCreditCardMin);
  const other = Math.max(0, input.monthlyPersonalLoanOther);

  const totalMonthlyDebt = Math.round((housing + auto + student + creditCard + other) * 100) / 100;
  const remainingDiscretionaryIncome = Math.max(0, Math.round((grossMonthlyIncome - totalMonthlyDebt) * 100) / 100);

  let frontEndDtiPercent = 0;
  let backEndDtiPercent = 0;

  if (grossMonthlyIncome > 0) {
    frontEndDtiPercent = Math.round((housing / grossMonthlyIncome) * 10000) / 100;
    backEndDtiPercent = Math.round((totalMonthlyDebt / grossMonthlyIncome) * 10000) / 100;
  }

  let statusTier: DtiStatusTier = 'healthy';
  let statusLabel = 'Healthy & Manageable';
  let statusDescription = 'Your debt levels are within reasonable borrowing limits.';

  if (backEndDtiPercent < 20) {
    statusTier = 'excellent';
    statusLabel = 'Excellent Financial Health';
    statusDescription = 'Outstanding debt ratio. You have substantial borrowing buffer and discretionary income.';
  } else if (backEndDtiPercent <= 35) {
    statusTier = 'healthy';
    statusLabel = 'Healthy / Manageable';
    statusDescription = 'Most conventional lenders consider this an ideal and easily manageable debt load.';
  } else if (backEndDtiPercent <= 43) {
    statusTier = 'moderate';
    statusLabel = 'Moderate / Near Limit';
    statusDescription = 'Approaching standard lender thresholds (43% Qualified Mortgage limit). Extra loans may face scrutiny.';
  } else if (backEndDtiPercent <= 49) {
    statusTier = 'high_risk';
    statusLabel = 'High Debt Burden';
    statusDescription = 'Significant portion of earnings committed to debt servicing. Loan approvals may require exceptions.';
  } else {
    statusTier = 'critical';
    statusLabel = 'Critical / Debt Distress';
    statusDescription = 'Over half your pre-tax income goes to debt. Prioritize rapid debt repayment and consolidation.';
  }

  const maxRecommendedDebt36 = Math.round(grossMonthlyIncome * 0.36 * 100) / 100;
  const maxQualifiedDebt43 = Math.round(grossMonthlyIncome * 0.43 * 100) / 100;
  const borrowingRoomRemaining = Math.max(0, Math.round((maxQualifiedDebt43 - totalMonthlyDebt) * 100) / 100);

  const items = [
    { category: 'Mortgage / Rent', amount: housing },
    { category: 'Auto Loans', amount: auto },
    { category: 'Student Loans', amount: student },
    { category: 'Credit Card Minimums', amount: creditCard },
    { category: 'Personal & Other Loans', amount: other },
  ];

  const debtBreakdown: DtiBreakdownItem[] = items.map((item) => ({
    category: item.category,
    amount: item.amount,
    percentageOfIncome: grossMonthlyIncome > 0 ? Math.round((item.amount / grossMonthlyIncome) * 10000) / 100 : 0,
    percentageOfDebt: totalMonthlyDebt > 0 ? Math.round((item.amount / totalMonthlyDebt) * 10000) / 100 : 0,
  }));

  return {
    grossMonthlyIncome,
    totalMonthlyDebt,
    frontEndDtiPercent,
    backEndDtiPercent,
    statusTier,
    statusLabel,
    statusDescription,
    remainingDiscretionaryIncome,
    maxRecommendedDebt36,
    maxQualifiedDebt43,
    borrowingRoomRemaining,
    debtBreakdown,
  };
}

export const calculateDti = calculateDebtToIncome;


/**
 * Mortgage Affordability / Home Loan Eligibility Engine
 * Evaluates maximum borrowing capacity based on Debt-To-Income (DTI) / Fixed Obligation to Income Ratio (FOIR).
 */

export interface MortgageAffordabilityInputs {
  monthlyIncome: number; // Gross / Net monthly household income
  existingMonthlyDebts: number; // Car loans, credit cards, student loans, other EMIs
  interestRate: number; // Annual interest rate (%)
  tenureYears: number; // Loan term (years)
  downPayment: number; // Cash available for down payment
  maxDtiPercent?: number; // Allowed DTI/FOIR threshold (e.g. 40% - 50%)
  propertyTaxInsuranceRate?: number; // Annual property tax + home insurance + maintenance buffer (% of property value)
}

export interface MortgageAffordabilityResult {
  maxAllowableEmi: number; // Monthly payment ceiling for the mortgage
  maxLoanAmount: number; // Maximum borrowing principal
  maxPropertyPrice: number; // maxLoanAmount + downPayment
  currentDtiWithExistingDebts: number; // Existing debts / Income (%)
  projectedTotalDti: number; // (Existing + New EMI) / Income (%)
  monthlyPaymentBreakdown: {
    principalAndInterest: number;
    estimatedTaxesAndInsurance: number;
    totalMonthlyHousingCost: number;
  };
  tenureMonths: number;
  totalRepayment: number;
  totalInterestPaid: number;
}

export function calculateMortgageAffordability(
  inputs: MortgageAffordabilityInputs
): MortgageAffordabilityResult {
  const {
    monthlyIncome,
    existingMonthlyDebts,
    interestRate,
    tenureYears,
    downPayment,
    maxDtiPercent = 45,
    propertyTaxInsuranceRate = 1.2,
  } = inputs;

  const income = Math.max(0, monthlyIncome);
  const existingDebts = Math.max(0, existingMonthlyDebts);
  const tenureMonths = Math.max(1, Math.round(tenureYears * 12));
  const r = Math.max(0.0001, interestRate / 100 / 12);
  const dtiLimit = Math.max(10, Math.min(80, maxDtiPercent)) / 100;

  // Maximum allowable total debt obligations
  const maxTotalObligations = income * dtiLimit;
  // Maximum residual EMI available for the new mortgage
  const maxAllowableEmi = Math.max(0, maxTotalObligations - existingDebts);

  // Present Value of Annuity for loan principal:
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  // P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoanAmount = maxAllowableEmi > 0 ? (maxAllowableEmi * (factor - 1)) / (r * factor) : 0;

  const maxPropertyPrice = Math.max(0, maxLoanAmount + Math.max(0, downPayment));

  const estimatedMonthlyTaxesAndInsurance =
    (maxPropertyPrice * (propertyTaxInsuranceRate / 100)) / 12;

  const totalRepayment = maxAllowableEmi * tenureMonths;
  const totalInterestPaid = Math.max(0, totalRepayment - maxLoanAmount);

  const currentDtiWithExistingDebts = income > 0 ? (existingDebts / income) * 100 : 0;
  const projectedTotalDti =
    income > 0 ? ((existingDebts + maxAllowableEmi) / income) * 100 : 0;

  return {
    maxAllowableEmi,
    maxLoanAmount,
    maxPropertyPrice,
    currentDtiWithExistingDebts,
    projectedTotalDti,
    monthlyPaymentBreakdown: {
      principalAndInterest: maxAllowableEmi,
      estimatedTaxesAndInsurance: estimatedMonthlyTaxesAndInsurance,
      totalMonthlyHousingCost: maxAllowableEmi + estimatedMonthlyTaxesAndInsurance,
    },
    tenureMonths,
    totalRepayment,
    totalInterestPaid,
  };
}

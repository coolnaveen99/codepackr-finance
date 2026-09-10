/**
 * Gratuity Calculation Engine
 * 
 * Statutory References:
 * - Payment of Gratuity Act, 1972
 * - Section 10(10) of the Income-tax Act, 1961 (Exemption limit: ₹20,00,000)
 */

export const GRATUITY_ENGINE_VERSION = '1.0.0';
export const GRATUITY_MAX_EXEMPTION_LIMIT = 2000000; // ₹20 Lakhs statutory cap

export interface GratuityInput {
  monthlyBasicPlusDa: number; // Last drawn monthly basic salary + dearness allowance
  completedYearsOfService: number; // Years
  additionalMonths?: number; // Additional months (0-11)
  isCoveredUnderAct: boolean; // Covered under Payment of Gratuity Act, 1972
}

export interface GratuityResult {
  monthlyBasicPlusDa: number;
  tenureYearsCalculated: number;
  isEligibleForGratuity: boolean; // Generally >= 5 continuous years
  isCoveredUnderAct: boolean;
  totalGratuityCalculated: number;
  statutoryExemptLimit: number;
  taxExemptGratuity: number;
  taxableGratuity: number;
  formulaDescription: string;
  statutoryNotice: string;
}

export function calculateGratuity(input: GratuityInput): GratuityResult {
  const salary = Math.max(0, input.monthlyBasicPlusDa);
  const years = Math.max(0, Math.floor(input.completedYearsOfService));
  const months = Math.max(0, Math.min(11, input.additionalMonths || 0));
  const isCovered = input.isCoveredUnderAct;

  // Eligibility: 5 continuous years
  const rawServiceYears = years + months / 12;
  const isEligibleForGratuity = rawServiceYears >= 5;

  let tenureYearsCalculated = years;
  let gratuityAmount = 0;
  let formulaDescription = '';

  if (isCovered) {
    // Covered under Payment of Gratuity Act, 1972:
    // If additional months > 6, round up to next full year.
    tenureYearsCalculated = months > 6 ? years + 1 : years;
    gratuityAmount = (15 * salary * tenureYearsCalculated) / 26;
    formulaDescription = `(15 × Last Drawn Salary [${salary}] × Service Years [${tenureYearsCalculated}]) ÷ 26 working days`;
  } else {
    // Not covered under the Act:
    // Completed full years only (fraction ignored), divided by 30 days.
    tenureYearsCalculated = years;
    gratuityAmount = (15 * salary * tenureYearsCalculated) / 30;
    formulaDescription = `(15 × Last Drawn Salary [${salary}] × Completed Full Years [${tenureYearsCalculated}]) ÷ 30 calendar days`;
  }

  const roundedGratuity = Math.round(gratuityAmount * 100) / 100;
  const taxExemptGratuity = Math.min(roundedGratuity, GRATUITY_MAX_EXEMPTION_LIMIT);
  const taxableGratuity = Math.max(0, Math.round((roundedGratuity - taxExemptGratuity) * 100) / 100);

  const statutoryNotice = isCovered
    ? 'Covered under Payment of Gratuity Act, 1972. Calculated using 26 working days per month. Service beyond 6 months is rounded up.'
    : 'Not covered under Gratuity Act, 1972. Calculated using 30 calendar days per month based on completed full years only.';

  return {
    monthlyBasicPlusDa: salary,
    tenureYearsCalculated,
    isEligibleForGratuity,
    isCoveredUnderAct: isCovered,
    totalGratuityCalculated: roundedGratuity,
    statutoryExemptLimit: GRATUITY_MAX_EXEMPTION_LIMIT,
    taxExemptGratuity,
    taxableGratuity,
    formulaDescription,
    statutoryNotice,
  };
}

/**
 * Salary Hike & Increment Percentage Calculator Engine
 * 
 * Computes percentage hike, new compensation package, monthly salary delta,
 * and real inflation-adjusted purchasing power increment.
 */

export const SALARY_HIKE_ENGINE_VERSION = '1.0.0';

export interface SalaryHikeInput {
  currentSalary: number; // Annual or Monthly depending on mode
  salaryPeriod: 'annual' | 'monthly';
  hikeType: 'percentage' | 'new_salary';
  hikePercentage?: number; // e.g. 15 for 15%
  offeredSalary?: number; // Absolute new amount
  inflationRate?: number; // e.g. 5.5%
}

export interface SalaryHikeResult {
  currentAnnualSalary: number;
  currentMonthlySalary: number;
  newAnnualSalary: number;
  newMonthlySalary: number;
  absoluteAnnualHike: number;
  absoluteMonthlyHike: number;
  hikePercentage: number;
  realHikePercentage: number; // Adjusted for inflation: ((1 + hike)/(1 + inf) - 1) * 100
  hikeTier: 'below_inflation' | 'cost_of_living' | 'standard' | 'high' | 'exceptional';
  hikeTierLabel: string;
}

export function calculateSalaryHike(input: SalaryHikeInput): SalaryHikeResult {
  const rawCurrent = Math.max(0, input.currentSalary);
  const isAnnual = input.salaryPeriod === 'annual';
  const currentAnnualSalary = isAnnual ? rawCurrent : rawCurrent * 12;
  const currentMonthlySalary = currentAnnualSalary / 12;

  let newAnnualSalary = currentAnnualSalary;
  let hikePercentage = 0;

  if (input.hikeType === 'percentage') {
    hikePercentage = Math.max(0, input.hikePercentage || 0);
    newAnnualSalary = currentAnnualSalary * (1 + hikePercentage / 100);
  } else {
    const rawOffered = Math.max(0, input.offeredSalary || 0);
    newAnnualSalary = isAnnual ? rawOffered : rawOffered * 12;
    if (currentAnnualSalary > 0) {
      hikePercentage = ((newAnnualSalary - currentAnnualSalary) / currentAnnualSalary) * 100;
    }
  }

  const newMonthlySalary = newAnnualSalary / 12;
  const absoluteAnnualHike = Math.max(0, newAnnualSalary - currentAnnualSalary);
  const absoluteMonthlyHike = absoluteAnnualHike / 12;

  const inflationRate = Math.max(0, input.inflationRate || 0);
  let realHikePercentage = 0;
  if (inflationRate > 0) {
    const nominalFactor = 1 + hikePercentage / 100;
    const inflationFactor = 1 + inflationRate / 100;
    realHikePercentage = ((nominalFactor / inflationFactor) - 1) * 100;
  } else {
    realHikePercentage = hikePercentage;
  }

  let hikeTier: SalaryHikeResult['hikeTier'] = 'standard';
  let hikeTierLabel = 'Standard Increment';

  if (hikePercentage <= inflationRate) {
    hikeTier = 'below_inflation';
    hikeTierLabel = 'Below Inflation (Real Wage Loss)';
  } else if (hikePercentage <= 8) {
    hikeTier = 'cost_of_living';
    hikeTierLabel = 'Cost-of-Living Adjustment';
  } else if (hikePercentage <= 15) {
    hikeTier = 'standard';
    hikeTierLabel = 'Healthy Corporate Increment';
  } else if (hikePercentage <= 30) {
    hikeTier = 'high';
    hikeTierLabel = 'Promotion / High-Performance Hike';
  } else {
    hikeTier = 'exceptional';
    hikeTierLabel = 'Exceptional / Lateral Switch Hike';
  }

  return {
    currentAnnualSalary: Math.round(currentAnnualSalary * 100) / 100,
    currentMonthlySalary: Math.round(currentMonthlySalary * 100) / 100,
    newAnnualSalary: Math.round(newAnnualSalary * 100) / 100,
    newMonthlySalary: Math.round(newMonthlySalary * 100) / 100,
    absoluteAnnualHike: Math.round(absoluteAnnualHike * 100) / 100,
    absoluteMonthlyHike: Math.round(absoluteMonthlyHike * 100) / 100,
    hikePercentage: Math.round(hikePercentage * 100) / 100,
    realHikePercentage: Math.round(realHikePercentage * 100) / 100,
    hikeTier,
    hikeTierLabel,
  };
}

/**
 * CodePackr Finance — CTC to In-Hand Salary Engine (India)
 * --------------------------------------------------------
 * Pure mathematical engine for converting Cost to Company (CTC) into
 * actual monthly and annual take-home salary, accounting for Employee
 * & Employer Provident Fund (EPF), Gratuity, Professional Tax, and Income Tax.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

import { calculateIndiaIncomeTax } from './incomeTax';

export const CTC_ENGINE_VERSION = '1.0.0';

export interface CtcInputs {
  annualCtc: number;
  basicSalaryPercentage?: number; // e.g. 40 or 50% of CTC (default 40%)
  includeEmployerPf?: boolean; // default true (12% of basic or ₹1,800/mo cap)
  includeGratuity?: boolean; // default true (4.81% of basic)
  professionalTaxAnnual?: number; // default ₹2,400 per year
  taxRegime?: 'new' | 'old';
}

export interface SalaryComponent {
  label: string;
  monthly: number;
  annual: number;
  type: 'earning' | 'deduction';
  description: string;
}

export interface CtcResult {
  annualCtc: number;
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  netInHandMonthly: number;
  netInHandAnnual: number;
  totalMonthlyDeductions: number;
  totalAnnualDeductions: number;
  employeePfAnnual: number;
  employerPfAnnual: number;
  gratuityAnnual: number;
  professionalTaxAnnual: number;
  incomeTaxAnnual: number;
  components: SalaryComponent[];
}

/**
 * Pure calculation of in-hand salary from CTC
 */
export function calculateCtcToInHand(inputs: CtcInputs): CtcResult {
  const ctc = Math.max(0, inputs.annualCtc || 0);
  const basicPct = Math.max(20, Math.min(60, inputs.basicSalaryPercentage || 40)) / 100;
  const basicAnnual = ctc * basicPct;
  const basicMonthly = basicAnnual / 12;

  // Employer PF: 12% of basic salary (or standard capped if desired, but 12% standard)
  const employerPfRate = inputs.includeEmployerPf !== false ? 0.12 : 0;
  const employerPfAnnual = basicAnnual * employerPfRate;

  // Gratuity: 4.81% of basic salary (15/26 * basic / 12 * tenure, approx 4.81% of basic)
  const gratuityRate = inputs.includeGratuity !== false ? 0.0481 : 0;
  const gratuityAnnual = basicAnnual * gratuityRate;

  // Gross Salary = CTC - (Employer PF + Gratuity)
  const grossAnnualSalary = Math.max(0, ctc - employerPfAnnual - gratuityAnnual);
  const grossMonthlySalary = grossAnnualSalary / 12;

  // Employee Deductions:
  // 1. Employee PF (12% of basic)
  const employeePfAnnual = basicAnnual * (inputs.includeEmployerPf !== false ? 0.12 : 0);
  const employeePfMonthly = employeePfAnnual / 12;

  // 2. Professional Tax (~₹200/mo or ₹2,400/yr)
  const profTaxAnnual = inputs.professionalTaxAnnual !== undefined ? inputs.professionalTaxAnnual : 2400;
  const profTaxMonthly = profTaxAnnual / 12;

  // 3. Income Tax TDS (computed using India Income Tax Engine with Gross Salary)
  const taxResult = calculateIndiaIncomeTax({
    grossAnnualIncome: grossAnnualSalary,
    taxRegime: inputs.taxRegime || 'new',
    isSalaried: true,
  });
  const incomeTaxAnnual = taxResult.totalTaxLiability;
  const incomeTaxMonthly = incomeTaxAnnual / 12;

  // Total Employee Deductions
  const totalAnnualDeductions = employeePfAnnual + profTaxAnnual + incomeTaxAnnual;
  const totalMonthlyDeductions = totalAnnualDeductions / 12;

  // In-Hand Take-Home
  const netInHandAnnual = Math.max(0, grossAnnualSalary - totalAnnualDeductions);
  const netInHandMonthly = Math.round(netInHandAnnual / 12);

  const components: SalaryComponent[] = [
    { label: 'Basic Salary', monthly: Math.round(basicMonthly), annual: Math.round(basicAnnual), type: 'earning', description: 'Core statutory wage component' },
    { label: 'House Rent Allowance (HRA)', monthly: Math.round(basicMonthly * 0.5), annual: Math.round(basicAnnual * 0.5), type: 'earning', description: '50% of basic in metros' },
    { label: 'Special & Other Allowances', monthly: Math.round(grossMonthlySalary - (basicMonthly * 1.5)), annual: Math.round(grossAnnualSalary - (basicAnnual * 1.5)), type: 'earning', description: 'Flexible and conveyance allowances' },
    { label: 'Employee Provident Fund (EPF)', monthly: Math.round(employeePfMonthly), annual: Math.round(employeePfAnnual), type: 'deduction', description: 'Mandatory 12% retirement savings' },
    { label: 'Professional Tax', monthly: Math.round(profTaxMonthly), annual: Math.round(profTaxAnnual), type: 'deduction', description: 'State government employment levy' },
    { label: 'Income Tax (TDS)', monthly: Math.round(incomeTaxMonthly), annual: Math.round(incomeTaxAnnual), type: 'deduction', description: 'TDS per Finance Act New Tax Regime' },
  ];

  return {
    annualCtc: ctc,
    grossAnnualSalary,
    grossMonthlySalary,
    netInHandMonthly,
    netInHandAnnual,
    totalMonthlyDeductions,
    totalAnnualDeductions,
    employeePfAnnual,
    employerPfAnnual,
    gratuityAnnual,
    professionalTaxAnnual: profTaxAnnual,
    incomeTaxAnnual,
    components,
  };
}

/**
 * CodePackr Finance — Income Tax Calculation Engine (India)
 * ---------------------------------------------------------
 * Pure mathematical engine for India Income Tax calculation under New & Old Tax Regimes
 * for FY 2025-26 and FY 2026-27 (Assessment Year 2026-27 & 2027-28).
 *
 * Adheres to Section 47 (Tax Disclaimers & Rules) and Phase 6 of Master Plan.
 */

export const TAX_ENGINE_VERSION = '2026-27.1';
export const TAX_JURISDICTION = 'India';
export const TAX_YEAR = 'FY 2026–27 (AY 2027–28)';
export const TAX_REVIEW_DATE = '2026-03-01';

export interface TaxInputs {
  grossAnnualIncome: number;
  taxRegime: 'new' | 'old';
  isSalaried: boolean;
  ageGroup?: 'below60' | 'senior60to80' | 'superSenior80plus';

  // Old regime deductions (ignored if taxRegime === 'new')
  section80C?: number; // Capped at ₹1,50,000 (EPF, PPF, ELSS, Life Insurance)
  section80D?: number; // Health insurance (up to ₹25,000 or ₹50,000)
  section80CCD1B?: number; // NPS extra (up to ₹50,000)
  hraExemption?: number; // House Rent Allowance exemption under Section 10(13A)
  homeLoanInterest80EEA?: number; // Section 24(b) home loan interest up to ₹2,00,000
  otherDeductions?: number;
}

export interface TaxSlabBreakdown {
  slab: string;
  ratePercent: number;
  taxableInSlab: number;
  taxAmount: number;
}

export interface TaxResult {
  jurisdiction: string;
  taxYear: string;
  taxRegime: 'new' | 'old';
  grossIncome: number;
  standardDeduction: number;
  chapterVIAExemptions: number;
  netTaxableIncome: number;
  slabTaxBeforeRebate: number;
  section87aRebate: number;
  taxAfterRebate: number;
  surcharge: number;
  healthAndEducationCess: number; // 4%
  totalTaxLiability: number;
  effectiveTaxRatePercent: number;
  monthlyTakeHomePay: number;
  slabBreakdown: TaxSlabBreakdown[];
  disclaimer: string;
}

/**
 * Calculates India Income Tax liability under New and Old Regimes
 */
export function calculateIndiaIncomeTax(inputs: TaxInputs): TaxResult {
  const gross = Math.max(0, inputs.grossAnnualIncome || 0);
  const regime = inputs.taxRegime || 'new';
  const isSalaried = inputs.isSalaried !== false;

  // 1. Standard deduction: ₹75,000 for New Regime, ₹50,000 for Old Regime
  const standardDeduction = isSalaried ? (regime === 'new' ? 75000 : 50000) : 0;

  // 2. Deductions
  let chapterVIA = 0;
  if (regime === 'old') {
    const sec80C = Math.min(150000, Math.max(0, inputs.section80C || 0));
    const sec80D = Math.min(100000, Math.max(0, inputs.section80D || 0));
    const nps = Math.min(50000, Math.max(0, inputs.section80CCD1B || 0));
    const hra = Math.max(0, inputs.hraExemption || 0);
    const homeLoan = Math.min(200000, Math.max(0, inputs.homeLoanInterest80EEA || 0));
    const other = Math.max(0, inputs.otherDeductions || 0);
    chapterVIA = sec80C + sec80D + nps + hra + homeLoan + other;
  }

  const netTaxableIncome = Math.max(0, gross - standardDeduction - chapterVIA);

  const slabBreakdown: TaxSlabBreakdown[] = [];
  let slabTax = 0;

  if (regime === 'new') {
    // New Tax Regime Slabs (Finance Act)
    // 0 - 3L: 0%
    // 3L - 7L: 5%
    // 7L - 10L: 10%
    // 10L - 12L: 15%
    // 12L - 15L: 20%
    // Above 15L: 30%
    const slabs = [
      { min: 0, max: 300000, rate: 0, label: '₹0 to ₹3,00,000' },
      { min: 300000, max: 700000, rate: 5, label: '₹3,00,001 to ₹7,00,000' },
      { min: 700000, max: 1000000, rate: 10, label: '₹7,00,001 to ₹10,00,000' },
      { min: 1000000, max: 1200000, rate: 15, label: '₹10,00,001 to ₹12,00,000' },
      { min: 1200000, max: 1500000, rate: 20, label: '₹12,00,001 to ₹15,00,000' },
      { min: 1500000, max: Infinity, rate: 30, label: 'Above ₹15,00,000' },
    ];

    for (const s of slabs) {
      if (netTaxableIncome > s.min) {
        const taxable = Math.min(netTaxableIncome, s.max) - s.min;
        const tax = (taxable * s.rate) / 100;
        slabTax += tax;
        slabBreakdown.push({
          slab: s.label,
          ratePercent: s.rate,
          taxableInSlab: taxable,
          taxAmount: tax,
        });
      }
    }
  } else {
    // Old Tax Regime Slabs (general individual)
    // 0 - 2.5L: 0%
    // 2.5L - 5L: 5%
    // 5L - 10L: 20%
    // Above 10L: 30%
    const slabs = [
      { min: 0, max: 250000, rate: 0, label: '₹0 to ₹2,50,000' },
      { min: 250000, max: 500000, rate: 5, label: '₹2,50,001 to ₹5,00,000' },
      { min: 500000, max: 1000000, rate: 20, label: '₹5,00,001 to ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 30, label: 'Above ₹10,00,000' },
    ];

    for (const s of slabs) {
      if (netTaxableIncome > s.min) {
        const taxable = Math.min(netTaxableIncome, s.max) - s.min;
        const tax = (taxable * s.rate) / 100;
        slabTax += tax;
        slabBreakdown.push({
          slab: s.label,
          ratePercent: s.rate,
          taxableInSlab: taxable,
          taxAmount: tax,
        });
      }
    }
  }

  // 3. Section 87A Rebate:
  // Under New Regime: 100% rebate if taxable income <= 7,00,000
  // Under Old Regime: Up to ₹12,500 if taxable income <= 5,00,000
  let rebate87A = 0;
  if (regime === 'new' && netTaxableIncome <= 700000) {
    rebate87A = slabTax;
  } else if (regime === 'old' && netTaxableIncome <= 500000) {
    rebate87A = Math.min(12500, slabTax);
  }

  const taxAfterRebate = Math.max(0, slabTax - rebate87A);

  // 4. Surcharge (if net taxable income > 50 Lakhs)
  let surchargeRate = 0;
  if (netTaxableIncome > 50000000) surchargeRate = regime === 'new' ? 25 : 37;
  else if (netTaxableIncome > 20000000) surchargeRate = 25;
  else if (netTaxableIncome > 10000000) surchargeRate = 15;
  else if (netTaxableIncome > 5000000) surchargeRate = 10;

  const surcharge = (taxAfterRebate * surchargeRate) / 100;

  // 5. Health and Education Cess: 4%
  const cess = ((taxAfterRebate + surcharge) * 4) / 100;
  const totalTaxLiability = Math.round(taxAfterRebate + surcharge + cess);

  const effectiveTaxRatePercent = gross > 0 ? (totalTaxLiability / gross) * 100 : 0;
  const annualTakeHome = Math.max(0, gross - totalTaxLiability);
  const monthlyTakeHomePay = Math.round(annualTakeHome / 12);

  return {
    jurisdiction: TAX_JURISDICTION,
    taxYear: TAX_YEAR,
    taxRegime: regime,
    grossIncome: gross,
    standardDeduction,
    chapterVIAExemptions: chapterVIA,
    netTaxableIncome,
    slabTaxBeforeRebate: slabTax,
    section87aRebate: rebate87A,
    taxAfterRebate,
    surcharge,
    healthAndEducationCess: cess,
    totalTaxLiability,
    effectiveTaxRatePercent,
    monthlyTakeHomePay,
    slabBreakdown,
    disclaimer: 'Tax estimates are computed based on the Finance Act provisions for India (FY 2026-27). This calculation is provided for educational and estimation purposes only and does not constitute formal tax advice. Consult a certified Chartered Accountant or tax professional for your filing.',
  };
}

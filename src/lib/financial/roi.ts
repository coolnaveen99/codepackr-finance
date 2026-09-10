/**
 * CodePackr Finance — Return on Investment (ROI) Calculation Engine
 * -----------------------------------------------------------------
 * Pure mathematical engine for computing net return on capital,
 * annualized holding period return, and capital multiple.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const ROI_ENGINE_VERSION = '1.0.0';

export interface RoiInputs {
  initialInvestment: number;
  finalValue: number;
  additionalCosts?: number; // Fees, commissions, refurbishment, maintenance
  holdingPeriodYears?: number; // Duration asset was held
}

export interface RoiResult {
  initialInvestment: number;
  additionalCosts: number;
  totalCostBasis: number;
  finalValue: number;
  netProfit: number;
  roiPercentage: number;
  annualizedRoiPercentage: number;
  capitalMultiple: number; // e.g. 1.75x
  holdingPeriodYears: number;
}

/**
 * Pure calculation of ROI and Annualized ROI
 */
export function calculateRoi(inputs: RoiInputs): RoiResult {
  const initial = Math.max(0, inputs.initialInvestment || 0);
  const finalVal = Math.max(0, inputs.finalValue || 0);
  const costs = Math.max(0, inputs.additionalCosts || 0);
  const years = Math.max(0, inputs.holdingPeriodYears || 0);

  const totalCostBasis = initial + costs;
  const netProfit = finalVal - totalCostBasis;

  const roiPercentage = totalCostBasis > 0 ? (netProfit / totalCostBasis) * 100 : 0;
  const capitalMultiple = totalCostBasis > 0 ? finalVal / totalCostBasis : 0;

  let annualizedRoiPercentage = 0;
  if (years > 0 && totalCostBasis > 0 && finalVal > 0) {
    const ratio = finalVal / totalCostBasis;
    const annDecimal = Math.pow(ratio, 1 / years) - 1;
    annualizedRoiPercentage = annDecimal * 100;
  } else {
    annualizedRoiPercentage = roiPercentage;
  }

  return {
    initialInvestment: initial,
    additionalCosts: costs,
    totalCostBasis,
    finalValue: finalVal,
    netProfit,
    roiPercentage,
    annualizedRoiPercentage,
    capitalMultiple,
    holdingPeriodYears: years,
  };
}

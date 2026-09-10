/**
 * CodePackr Finance — Inflation & Purchasing Power Engine
 * -------------------------------------------------------
 * Pure mathematical engine for modeling future expense escalation,
 * currency purchasing power erosion, and real vs nominal asset values.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const INFLATION_ENGINE_VERSION = '1.0.0';

export interface InflationInputs {
  currentAmount: number; // e.g. current expense or current static savings
  annualInflationRate: number; // e.g. 6.0 for 6%
  timeHorizonYears: number; // e.g. 10 years
}

export interface InflationYearPoint {
  year: number;
  futureCost: number; // What today's currentAmount will cost in year N
  purchasingPower: number; // What today's currentAmount will be worth in real terms
  purchasingPowerLossPercent: number;
}

export interface InflationResult {
  currentAmount: number;
  annualInflationRate: number;
  timeHorizonYears: number;
  futureCost: number;
  futurePurchasingPower: number;
  costIncreasePercentage: number;
  purchasingPowerLossPercentage: number;
  ruleOf72DoublingYears: number; // Years required for price level to double at current inflation rate
  timeline: InflationYearPoint[];
}

/**
 * Pure calculation of inflation impact
 */
export function calculateInflation(inputs: InflationInputs): InflationResult {
  const currentAmount = Math.max(0, inputs.currentAmount || 0);
  const inflationRate = Math.max(0, inputs.annualInflationRate || 0);
  const years = Math.max(1, Math.round(inputs.timeHorizonYears || 1));

  const i = inflationRate / 100;
  const compoundingMultiplier = Math.pow(1 + i, years);

  const futureCost = currentAmount * compoundingMultiplier;
  const futurePurchasingPower = compoundingMultiplier > 0 ? currentAmount / compoundingMultiplier : currentAmount;
  const costIncreasePercentage = (compoundingMultiplier - 1) * 100;
  const purchasingPowerLossPercentage = currentAmount > 0
    ? ((currentAmount - futurePurchasingPower) / currentAmount) * 100
    : 0;

  const ruleOf72DoublingYears = inflationRate > 0 ? 72 / inflationRate : 0;

  const timeline: InflationYearPoint[] = [];
  for (let yr = 0; yr <= years; yr++) {
    const factor = Math.pow(1 + i, yr);
    const costAtYr = currentAmount * factor;
    const powerAtYr = factor > 0 ? currentAmount / factor : currentAmount;
    const lossAtYr = currentAmount > 0 ? ((currentAmount - powerAtYr) / currentAmount) * 100 : 0;

    timeline.push({
      year: yr,
      futureCost: costAtYr,
      purchasingPower: powerAtYr,
      purchasingPowerLossPercent: lossAtYr,
    });
  }

  return {
    currentAmount,
    annualInflationRate: inflationRate,
    timeHorizonYears: years,
    futureCost,
    futurePurchasingPower,
    costIncreasePercentage,
    purchasingPowerLossPercentage,
    ruleOf72DoublingYears,
    timeline,
  };
}

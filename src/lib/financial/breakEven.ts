/**
 * CodePackr Finance — Break-Even Analysis Engine
 * ----------------------------------------------
 * 100% Client-Side Pure Calculation Engine
 * Formula: Break-Even Units = Fixed Costs / (Selling Price - Variable Cost)
 */

export const BREAK_EVEN_ENGINE_VERSION = '1.0.0';

export interface BreakEvenInput {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  expectedUnits?: number;
}

export interface CostVolumePoint {
  units: number;
  fixedCost: number;
  variableCost: number;
  totalCost: number;
  revenue: number;
  profit: number;
}

export interface BreakEvenResult {
  contributionMarginPerUnit: number;
  contributionMarginRatio: number; // in percent, e.g. 40 = 40%
  breakEvenUnits: number;
  breakEvenRevenue: number;
  isAchievable: boolean;
  expectedUnits: number;
  marginOfSafetyUnits: number;
  marginOfSafetyPercent: number; // in percent
  revenueAtExpected: number;
  totalCostAtExpected: number;
  profitAtExpected: number;
  costVolumeCurve: CostVolumePoint[];
  explanation: string;
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const fixedCosts = Math.max(0, Number(input.fixedCosts) || 0);
  const variableCost = Math.max(0, Number(input.variableCostPerUnit) || 0);
  const price = Math.max(0, Number(input.sellingPricePerUnit) || 0);

  const cmPerUnit = price - variableCost;
  const cmRatio = price > 0 ? (cmPerUnit / price) * 100 : 0;

  if (cmPerUnit <= 0) {
    const expected = Math.max(0, Number(input.expectedUnits) || 1000);
    const revAtExp = expected * price;
    const costAtExp = fixedCosts + expected * variableCost;
    return {
      contributionMarginPerUnit: Number(cmPerUnit.toFixed(2)),
      contributionMarginRatio: Number(cmRatio.toFixed(2)),
      breakEvenUnits: Infinity,
      breakEvenRevenue: Infinity,
      isAchievable: false,
      expectedUnits: expected,
      marginOfSafetyUnits: -expected,
      marginOfSafetyPercent: -100,
      revenueAtExpected: Number(revAtExp.toFixed(2)),
      totalCostAtExpected: Number(costAtExp.toFixed(2)),
      profitAtExpected: Number((revAtExp - costAtExp).toFixed(2)),
      costVolumeCurve: [],
      explanation: 'Selling price per unit must be strictly greater than variable cost per unit to generate a positive contribution margin and cover fixed overhead.',
    };
  }

  const breakEvenUnits = cmPerUnit > 0 ? Math.ceil(fixedCosts / cmPerUnit) : 0;
  const breakEvenRevenue = Number((breakEvenUnits * price).toFixed(2));

  const expectedUnits = input.expectedUnits !== undefined && !isNaN(Number(input.expectedUnits))
    ? Math.max(0, Number(input.expectedUnits))
    : Math.max(10, Math.round(breakEvenUnits * 1.25));

  const marginOfSafetyUnits = Number((expectedUnits - breakEvenUnits).toFixed(0));
  const marginOfSafetyPercent = expectedUnits > 0
    ? Number((((expectedUnits - breakEvenUnits) / expectedUnits) * 100).toFixed(2))
    : 0;

  const revenueAtExpected = Number((expectedUnits * price).toFixed(2));
  const totalCostAtExpected = Number((fixedCosts + expectedUnits * variableCost).toFixed(2));
  const profitAtExpected = Number((revenueAtExpected - totalCostAtExpected).toFixed(2));

  // Generate 8-point Cost-Volume-Profit curve for charts
  const maxUnits = Math.max(expectedUnits * 1.4, breakEvenUnits * 1.5, 100);
  const step = Math.max(1, Math.round(maxUnits / 7));
  const costVolumeCurve: CostVolumePoint[] = [];

  for (let u = 0; u <= maxUnits + step / 2; u += step) {
    const roundedUnits = Math.round(u);
    const vCost = roundedUnits * variableCost;
    const tCost = fixedCosts + vCost;
    const rev = roundedUnits * price;
    costVolumeCurve.push({
      units: roundedUnits,
      fixedCost: fixedCosts,
      variableCost: Number(vCost.toFixed(2)),
      totalCost: Number(tCost.toFixed(2)),
      revenue: Number(rev.toFixed(2)),
      profit: Number((rev - tCost).toFixed(2)),
    });
  }

  const explanation = `To cover total fixed overhead of ${fixedCosts.toLocaleString()}, the business must sell ${breakEvenUnits.toLocaleString()} units (${breakEvenRevenue.toLocaleString()} in gross revenue). Each unit sold yields ${cmPerUnit.toFixed(2)} in contribution margin.`;

  return {
    contributionMarginPerUnit: Number(cmPerUnit.toFixed(2)),
    contributionMarginRatio: Number(cmRatio.toFixed(2)),
    breakEvenUnits,
    breakEvenRevenue,
    isAchievable: true,
    expectedUnits,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
    revenueAtExpected,
    totalCostAtExpected,
    profitAtExpected,
    costVolumeCurve,
    explanation,
  };
}

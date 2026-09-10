/**
 * CodePackr Finance — Compound Annual Growth Rate (CAGR) Calculation Engine
 * ------------------------------------------------------------------------
 * Pure mathematical engine for geometric annualized return, absolute return,
 * multiple on invested capital (MOIC), and annual growth trajectories.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const CAGR_ENGINE_VERSION = '1.0.0';

export interface CagrInputs {
  initialValue: number;
  finalValue: number;
  tenureYears: number;
}

export interface CagrYearPoint {
  year: number;
  projectedValue: number;
  cumulativeGrowth: number;
}

export interface CagrResult {
  cagrPercent: number;
  absoluteReturnPercent: number;
  totalGain: number;
  initialValue: number;
  finalValue: number;
  tenureYears: number;
  multipleOfCapital: number; // e.g. 2.5x
  trajectory: CagrYearPoint[];
}

/**
 * Pure calculation of CAGR: ((finalValue / initialValue) ^ (1 / tenureYears)) - 1
 */
export function calculateCagr(inputs: CagrInputs): CagrResult {
  const initialValue = Math.max(0, inputs.initialValue || 0);
  const finalValue = Math.max(0, inputs.finalValue || 0);
  const tenureYears = Math.max(0.01, inputs.tenureYears || 0.01);

  if (initialValue <= 0 || finalValue <= 0) {
    return {
      cagrPercent: 0,
      absoluteReturnPercent: 0,
      totalGain: finalValue - initialValue,
      initialValue,
      finalValue,
      tenureYears,
      multipleOfCapital: initialValue > 0 ? finalValue / initialValue : 0,
      trajectory: [],
    };
  }

  const ratio = finalValue / initialValue;
  const cagrDecimal = Math.pow(ratio, 1 / tenureYears) - 1;
  const cagrPercent = cagrDecimal * 100;
  const totalGain = finalValue - initialValue;
  const absoluteReturnPercent = (totalGain / initialValue) * 100;
  const multipleOfCapital = ratio;

  const trajectory: CagrYearPoint[] = [];
  const roundedYears = Math.max(1, Math.ceil(tenureYears));

  for (let yr = 0; yr <= roundedYears; yr++) {
    const t = Math.min(yr, tenureYears);
    const projectedValue = initialValue * Math.pow(1 + cagrDecimal, t);
    trajectory.push({
      year: yr,
      projectedValue,
      cumulativeGrowth: projectedValue - initialValue,
    });
  }

  return {
    cagrPercent,
    absoluteReturnPercent,
    totalGain,
    initialValue,
    finalValue,
    tenureYears,
    multipleOfCapital,
    trajectory,
  };
}

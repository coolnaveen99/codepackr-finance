/**
 * CodePackr Finance — Internal Rate of Return (IRR) Engine
 * --------------------------------------------------------
 * 100% Client-Side Pure Calculation Engine
 * Solves: 0 = -I0 + Σ (CF_t / (1 + r)^t)
 * Employs Newton-Raphson with fallback to bounded Bisection search.
 */

export const IRR_ENGINE_VERSION = '1.0.0';

export interface IrrInput {
  initialInvestment: number; // Cash outflow at t=0
  cashFlows: number[]; // Inflows at t=1..n
  guessRate?: number; // Optional initial rate guess in percent (e.g. 10)
  hurdleRate?: number; // Optional required benchmark rate in percent (e.g. 12)
}

export interface NpvProfilePoint {
  rate: number; // in percent, e.g. 10
  npv: number;
}

export interface IrrResult {
  irr: number | null; // in percent (e.g. 15.24 = 15.24%)
  isConverged: boolean;
  npvAtIrr: number;
  totalInflows: number;
  netNominalGain: number;
  decision: 'ACCEPT' | 'REJECT' | 'INDETERMINATE';
  decisionRationale: string;
  hurdleComparison: 'ABOVE' | 'BELOW' | 'EQUAL' | null;
  npvProfile: NpvProfilePoint[];
  iterations: number;
  errorMessage?: string;
}

function npvFunction(rateDec: number, initial: number, flows: number[]): number {
  if (rateDec <= -1) return -Infinity;
  let sum = -initial;
  for (let i = 0; i < flows.length; i++) {
    sum += flows[i] / Math.pow(1 + rateDec, i + 1);
  }
  return sum;
}

function npvDerivative(rateDec: number, flows: number[]): number {
  if (rateDec <= -1) return 0;
  let sum = 0;
  for (let i = 0; i < flows.length; i++) {
    const t = i + 1;
    sum -= (t * flows[i]) / Math.pow(1 + rateDec, t + 1);
  }
  return sum;
}

export function calculateIRR(input: IrrInput): IrrResult {
  const initial = Math.max(0, Number(input.initialInvestment) || 0);
  const flows = (Array.isArray(input.cashFlows) ? input.cashFlows : []).map((v) => Number(v) || 0);
  const hurdleRate = input.hurdleRate !== undefined && !isNaN(Number(input.hurdleRate)) ? Number(input.hurdleRate) : null;
  const initialGuess = (Number(input.guessRate) || 10) / 100;

  const totalInflows = flows.reduce((acc, c) => acc + c, 0);
  const netNominalGain = totalInflows - initial;

  // Validation: Need at least one negative outflow (initial > 0) and at least one positive inflow
  const hasInflow = flows.some((c) => c > 0);
  if (initial <= 0 || !hasInflow || flows.length === 0) {
    return {
      irr: null,
      isConverged: false,
      npvAtIrr: 0,
      totalInflows,
      netNominalGain,
      decision: 'INDETERMINATE',
      decisionRationale: 'IRR requires an initial cash investment (outflow) followed by positive cash inflows.',
      hurdleComparison: null,
      npvProfile: [],
      iterations: 0,
      errorMessage: 'Invalid cash flows: requires initial investment and at least one positive return.',
    };
  }

  // 1. Newton-Raphson Attempt
  let rate = Math.max(-0.9, Math.min(1.0, initialGuess));
  let iterations = 0;
  const maxIterations = 80;
  const tolerance = 1e-7;
  let converged = false;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    const fVal = npvFunction(rate, initial, flows);
    if (Math.abs(fVal) < tolerance) {
      converged = true;
      break;
    }
    const fPrime = npvDerivative(rate, flows);
    if (Math.abs(fPrime) < 1e-12) break;

    const nextRate = rate - fVal / fPrime;
    if (Math.abs(nextRate - rate) < tolerance) {
      rate = nextRate;
      converged = true;
      break;
    }

    if (nextRate <= -0.999 || nextRate > 100 || isNaN(nextRate)) {
      break; // Diverged, switch to bisection
    }
    rate = nextRate;
  }

  // 2. Bisection Fallback if Newton-Raphson did not converge
  if (!converged) {
    let low = -0.99;
    let high = 10.0; // up to 1000%
    let fLow = npvFunction(low, initial, flows);
    let fHigh = npvFunction(high, initial, flows);

    // Expand upper bound if needed
    if (fLow * fHigh > 0) {
      for (const candidateHigh of [25.0, 50.0, 100.0]) {
        high = candidateHigh;
        fHigh = npvFunction(high, initial, flows);
        if (fLow * fHigh <= 0) break;
      }
    }

    if (fLow * fHigh <= 0) {
      for (let i = 0; i < 100; i++) {
        iterations++;
        const mid = (low + high) / 2;
        const fMid = npvFunction(mid, initial, flows);
        if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
          rate = mid;
          converged = true;
          break;
        }
        if (fLow * fMid < 0) {
          high = mid;
          fHigh = fMid;
        } else {
          low = mid;
          fLow = fMid;
        }
      }
    }
  }

  const finalIrrPct = converged ? Number((rate * 100).toFixed(2)) : null;
  const npvAtIrr = converged ? Number(npvFunction(rate, initial, flows).toFixed(2)) : 0;

  let hurdleComparison: 'ABOVE' | 'BELOW' | 'EQUAL' | null = null;
  let decision: 'ACCEPT' | 'REJECT' | 'INDETERMINATE' = 'INDETERMINATE';
  let decisionRationale = '';

  if (converged && finalIrrPct !== null) {
    if (hurdleRate !== null) {
      if (finalIrrPct > hurdleRate + 0.01) {
        hurdleComparison = 'ABOVE';
        decision = 'ACCEPT';
        decisionRationale = `Project IRR (${finalIrrPct}%) exceeds the required hurdle rate (${hurdleRate}%). Recommended for capital allocation.`;
      } else if (finalIrrPct < hurdleRate - 0.01) {
        hurdleComparison = 'BELOW';
        decision = 'REJECT';
        decisionRationale = `Project IRR (${finalIrrPct}%) fails to clear the required hurdle rate (${hurdleRate}%). Destroys relative economic value.`;
      } else {
        hurdleComparison = 'EQUAL';
        decision = 'ACCEPT';
        decisionRationale = `Project IRR (${finalIrrPct}%) exactly matches the required hurdle rate (${hurdleRate}%).`;
      }
    } else {
      if (finalIrrPct > 0) {
        decision = 'ACCEPT';
        decisionRationale = `Project produces a positive internal rate of return of ${finalIrrPct}%. Compare against your corporate cost of capital.`;
      } else {
        decision = 'REJECT';
        decisionRationale = `Project produces a negative internal rate of return (${finalIrrPct}%). Net cash return is less than initial investment.`;
      }
    }
  } else {
    decisionRationale = 'No real internal rate of return could be solved for this series of cash flows.';
  }

  // Generate NPV profile points across discount rates (0% to 40%)
  const npvProfile: NpvProfilePoint[] = [];
  const profileSteps = [0, 5, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40];
  for (const step of profileSteps) {
    npvProfile.push({
      rate: step,
      npv: Number(npvFunction(step / 100, initial, flows).toFixed(2)),
    });
  }

  return {
    irr: finalIrrPct,
    isConverged: converged,
    npvAtIrr,
    totalInflows: Number(totalInflows.toFixed(2)),
    netNominalGain: Number(netNominalGain.toFixed(2)),
    decision,
    decisionRationale,
    hurdleComparison,
    npvProfile,
    iterations,
  };
}

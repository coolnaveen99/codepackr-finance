/**
 * CodePackr Finance — Net Present Value (NPV) Calculation Engine
 * -------------------------------------------------------------
 * 100% Client-Side Pure Calculation Engine
 * Formula: NPV = -InitialInvestment + Σ (CF_t / (1 + r)^t)
 */

export const NPV_ENGINE_VERSION = '1.0.0';

export interface NpvInput {
  initialInvestment: number;
  discountRate: number; // in percent, e.g. 10 = 10%
  cashFlows: number[];
}

export interface NpvCashFlowItem {
  year: number;
  cashFlow: number;
  discountFactor: number;
  presentValue: number;
  cumulativePv: number;
}

export interface NpvResult {
  npv: number;
  totalPV: number;
  presentValues: NpvCashFlowItem[];
  profitabilityIndex: number;
  decision: 'ACCEPT' | 'REJECT' | 'NEUTRAL';
  decisionRationale: string;
  nominalNetProfit: number;
  totalNominalInflows: number;
  paybackPeriodYears: number | null;
  discountedPaybackPeriodYears: number | null;
}

export function calculateNPV(input: NpvInput): NpvResult {
  const initial = Math.max(0, Number(input.initialInvestment) || 0);
  const ratePct = Number(input.discountRate) || 0;
  const rateDec = ratePct / 100;
  const flows = Array.isArray(input.cashFlows) ? input.cashFlows : [];

  const presentValues: NpvCashFlowItem[] = [];
  let cumulativePv = 0;
  let totalNominalInflows = 0;
  let paybackPeriodYears: number | null = null;
  let discountedPaybackPeriodYears: number | null = null;
  let cumulativeNominal = 0;

  flows.forEach((cfRaw, idx) => {
    const year = idx + 1;
    const cf = Number(cfRaw) || 0;
    totalNominalInflows += cf;

    // Discount factor = 1 / (1 + r)^t
    let discountFactor = 1;
    if (rateDec > -1) {
      discountFactor = 1 / Math.pow(1 + rateDec, year);
    } else {
      discountFactor = 0;
    }

    const presentValue = cf * discountFactor;
    cumulativePv += presentValue;
    cumulativeNominal += cf;

    if (paybackPeriodYears === null && cumulativeNominal >= initial && initial > 0) {
      // Linear interpolation within the year
      const priorNominal = cumulativeNominal - cf;
      const needed = initial - priorNominal;
      const fraction = cf > 0 ? Math.min(1, Math.max(0, needed / cf)) : 0;
      paybackPeriodYears = Number((year - 1 + fraction).toFixed(2));
    }

    if (discountedPaybackPeriodYears === null && cumulativePv >= initial && initial > 0) {
      const priorPv = cumulativePv - presentValue;
      const needed = initial - priorPv;
      const fraction = presentValue > 0 ? Math.min(1, Math.max(0, needed / presentValue)) : 0;
      discountedPaybackPeriodYears = Number((year - 1 + fraction).toFixed(2));
    }

    presentValues.push({
      year,
      cashFlow: Number(cf.toFixed(2)),
      discountFactor: Number(discountFactor.toFixed(4)),
      presentValue: Number(presentValue.toFixed(2)),
      cumulativePv: Number(cumulativePv.toFixed(2)),
    });
  });

  const totalPV = Number(cumulativePv.toFixed(2));
  const npv = Number((totalPV - initial).toFixed(2));
  const nominalNetProfit = Number((totalNominalInflows - initial).toFixed(2));

  let profitabilityIndex = 1;
  if (initial > 0) {
    profitabilityIndex = Number((totalPV / initial).toFixed(3));
  } else if (totalPV > 0) {
    profitabilityIndex = Infinity;
  }

  let decision: 'ACCEPT' | 'REJECT' | 'NEUTRAL' = 'NEUTRAL';
  let decisionRationale = 'NPV is zero: the project yields exactly the required rate of return without added economic profit.';

  if (npv > 0.001) {
    decision = 'ACCEPT';
    decisionRationale = `Project generates an economic surplus of ${npv.toLocaleString()} above the ${ratePct}% cost of capital.`;
  } else if (npv < -0.001) {
    decision = 'REJECT';
    decisionRationale = `Project falls short of the ${ratePct}% hurdle rate by ${Math.abs(npv).toLocaleString()}, destroying economic value.`;
  }

  return {
    npv,
    totalPV,
    presentValues,
    profitabilityIndex,
    decision,
    decisionRationale,
    nominalNetProfit,
    totalNominalInflows: Number(totalNominalInflows.toFixed(2)),
    paybackPeriodYears,
    discountedPaybackPeriodYears,
  };
}

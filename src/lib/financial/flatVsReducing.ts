/**
 * Flat vs Reducing Rate Interest Comparison
 * Shows true EMI / interest under flat rate vs reducing balance.
 * 100% client-side.
 */

export const FLAT_VS_REDUCING_ENGINE_VERSION = '1.0.0';

export interface FlatVsReducingInputs {
  principal: number;
  annualRatePercent: number;
  tenureMonths: number;
}

export interface FlatVsReducingResult {
  principal: number;
  tenureMonths: number;
  flatAnnualRate: number;
  flatTotalInterest: number;
  flatEmi: number;
  flatTotalPayment: number;
  reducingEmi: number;
  reducingTotalInterest: number;
  reducingTotalPayment: number;
  /** Approximate equivalent reducing rate for same EMI as flat */
  approxEquivalentReducingRate: number;
  interestDifference: number;
  notes: string[];
}

function reducingEmi(P: number, annualRate: number, n: number): number {
  if (n <= 0) return 0;
  if (annualRate <= 0) return P / n;
  const r = annualRate / 12 / 100;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateFlatVsReducing(inputs: FlatVsReducingInputs): FlatVsReducingResult {
  const P = Math.max(0, inputs.principal);
  const rate = Math.max(0, inputs.annualRatePercent);
  const n = Math.max(1, Math.round(inputs.tenureMonths));

  // Flat rate: interest = P * rate% * years; EMI = (P + interest) / n
  const years = n / 12;
  const flatTotalInterest = P * (rate / 100) * years;
  const flatTotalPayment = P + flatTotalInterest;
  const flatEmi = flatTotalPayment / n;

  // Reducing balance EMI at same nominal rate
  const redEmi = reducingEmi(P, rate, n);
  const reducingTotalPayment = redEmi * n;
  const reducingTotalInterest = reducingTotalPayment - P;

  // Rough equivalent reducing rate that matches flat EMI (binary search)
  let lo = 0;
  let hi = rate * 3 || 50;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const e = reducingEmi(P, mid, n);
    if (e > flatEmi) hi = mid;
    else lo = mid;
  }
  const approxEquivalentReducingRate = Math.round(((lo + hi) / 2) * 100) / 100;

  const notes = [
    'Flat rate calculates interest on the full principal for the entire tenure — common in some personal loans / dealer financing.',
    'Reducing (diminishing) balance calculates interest only on outstanding principal — standard bank home/car loans.',
    'A flat rate looks lower but usually costs more; compare total interest and the approximate equivalent reducing rate.',
  ];

  return {
    principal: Math.round(P),
    tenureMonths: n,
    flatAnnualRate: rate,
    flatTotalInterest: Math.round(flatTotalInterest),
    flatEmi: Math.round(flatEmi),
    flatTotalPayment: Math.round(flatTotalPayment),
    reducingEmi: Math.round(redEmi),
    reducingTotalInterest: Math.round(reducingTotalInterest),
    reducingTotalPayment: Math.round(reducingTotalPayment),
    approxEquivalentReducingRate,
    interestDifference: Math.round(flatTotalInterest - reducingTotalInterest),
    notes,
  };
}

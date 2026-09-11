/**
 * Weighted Average Cost of Capital (WACC) Calculation Engine
 * Formula: WACC = (E / V) * Re + (D / V) * Rd * (1 - Tc)
 * Optional CAPM for Cost of Equity: Re = Rf + Beta * (Rm - Rf)
 */

export interface WaccInputs {
  equityMarketValue: number; // E ($)
  costOfEquity?: number; // Re (%)
  // CAPM Inputs (if Re not provided directly)
  riskFreeRate?: number; // Rf (%)
  beta?: number; // β
  equityRiskPremium?: number; // ERP or (Rm - Rf) (%)

  debtMarketValue: number; // D ($)
  preTaxCostOfDebt: number; // Rd (%)
  corporateTaxRate: number; // Tc (%)
}

export interface WaccResult {
  wacc: number; // (%)
  costOfEquity: number; // Re (%)
  effectiveCostOfDebt: number; // Rd * (1 - Tc) (%)
  totalCapital: number; // V = E + D
  equityWeight: number; // E / V (0 - 1)
  debtWeight: number; // D / V (0 - 1)
  equityContribution: number; // (E / V) * Re (%)
  debtContribution: number; // (D / V) * Rd * (1 - Tc) (%)
  taxShieldSavingsRate: number; // Rd * Tc (%)
}

export function calculateWacc(inputs: WaccInputs): WaccResult {
  const {
    equityMarketValue,
    costOfEquity: directRe,
    riskFreeRate = 4.2,
    beta = 1.1,
    equityRiskPremium = 5.5,
    debtMarketValue,
    preTaxCostOfDebt,
    corporateTaxRate,
  } = inputs;

  // Derive Cost of Equity Re
  let costOfEquity = directRe !== undefined ? directRe : riskFreeRate + beta * equityRiskPremium;
  costOfEquity = Math.max(0, costOfEquity);

  const tc = Math.max(0, Math.min(100, corporateTaxRate)) / 100;
  const rd = Math.max(0, preTaxCostOfDebt);
  const effectiveCostOfDebt = rd * (1 - tc);

  const e = Math.max(0, equityMarketValue);
  const d = Math.max(0, debtMarketValue);
  const totalCapital = e + d;

  if (totalCapital <= 0) {
    return {
      wacc: costOfEquity,
      costOfEquity,
      effectiveCostOfDebt,
      totalCapital: 0,
      equityWeight: 1,
      debtWeight: 0,
      equityContribution: costOfEquity,
      debtContribution: 0,
      taxShieldSavingsRate: rd * tc,
    };
  }

  const equityWeight = e / totalCapital;
  const debtWeight = d / totalCapital;

  const equityContribution = equityWeight * costOfEquity;
  const debtContribution = debtWeight * effectiveCostOfDebt;
  const wacc = equityContribution + debtContribution;
  const taxShieldSavingsRate = debtWeight * rd * tc;

  return {
    wacc,
    costOfEquity,
    effectiveCostOfDebt,
    totalCapital,
    equityWeight,
    debtWeight,
    equityContribution,
    debtContribution,
    taxShieldSavingsRate,
  };
}

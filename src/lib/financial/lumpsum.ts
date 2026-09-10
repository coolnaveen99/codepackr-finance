/**
 * Lumpsum Mutual Fund & Stock Investment Calculator Engine
 * 
 * Formula:
 * FV = PV * (1 + r)^n
 * Wealth Gain = FV - PV
 * Wealth Multiple = FV / PV
 * Real (Inflation-Adjusted) FV = FV / (1 + i)^n
 */

export const LUMPSUM_ENGINE_VERSION = '1.0.0';

export interface LumpsumInput {
  totalInvestment: number; // Principal (PV)
  expectedAnnualReturnRate: number; // e.g. 12%
  timeHorizonYears: number; // n
  inflationRate?: number; // Optional inflation rate, e.g. 6%
}

export interface LumpsumYearBreakdown {
  year: number;
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  realPurchasingPower: number;
}

export interface LumpsumResult {
  totalInvested: number;
  estimatedReturns: number;
  totalMaturityValue: number;
  wealthMultiple: number;
  realMaturityValue: number;
  yearlyBreakdown: LumpsumYearBreakdown[];
}

export function calculateLumpsum(input: LumpsumInput): LumpsumResult {
  const PV = Math.max(0, input.totalInvestment);
  const r = Math.max(0, input.expectedAnnualReturnRate) / 100;
  const n = Math.max(1, Math.round(input.timeHorizonYears));
  const inflation = Math.max(0, input.inflationRate || 0) / 100;

  const yearlyBreakdown: LumpsumYearBreakdown[] = [];

  for (let y = 1; y <= n; y++) {
    const totalVal = PV * Math.pow(1 + r, y);
    const returns = totalVal - PV;
    const realVal = totalVal / Math.pow(1 + inflation, y);

    yearlyBreakdown.push({
      year: y,
      investedAmount: PV,
      estimatedReturns: Math.round(returns * 100) / 100,
      totalValue: Math.round(totalVal * 100) / 100,
      realPurchasingPower: Math.round(realVal * 100) / 100,
    });
  }

  const finalRow = yearlyBreakdown[yearlyBreakdown.length - 1] || {
    totalValue: PV,
    estimatedReturns: 0,
    realPurchasingPower: PV,
  };

  const totalMaturityValue = finalRow.totalValue;
  const estimatedReturns = finalRow.estimatedReturns;
  const realMaturityValue = finalRow.realPurchasingPower;
  const wealthMultiple = PV > 0 ? Math.round((totalMaturityValue / PV) * 100) / 100 : 1;

  return {
    totalInvested: PV,
    estimatedReturns,
    totalMaturityValue,
    wealthMultiple,
    realMaturityValue,
    yearlyBreakdown,
  };
}

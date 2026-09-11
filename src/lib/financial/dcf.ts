/**
 * Discounted Cash Flow (DCF) Valuation Engine
 * Computes Enterprise Value, Equity Value, and sensitivity matrices using Gordon Growth or Exit Multiples.
 */

export interface DcfInputs {
  initialFcf: number; // Year 1 Free Cash Flow ($)
  growthRate: number; // Forecast CAGR (%)
  forecastYears: number; // Horizon (3 - 10 years)
  wacc: number; // Discount rate (%)
  terminalMethod: 'growth' | 'multiple';
  terminalGrowthRate: number; // Gordon Growth rate (%)
  exitMultiple: number; // Exit multiple (e.g. 10x EBITDA / FCF)
  netDebt: number; // Total Debt minus Cash ($)
  sharesOutstanding?: number; // Optional shares count to compute per-share value
}

export interface DcfYearBreakdown {
  year: number;
  fcf: number;
  discountFactor: number;
  presentValue: number;
  cumulativePv: number;
}

export interface DcfSensitivityCell {
  wacc: number;
  terminalParam: number; // terminal growth or exit multiple
  enterpriseValue: number;
  equityValue: number;
  perShareValue?: number;
}

export interface DcfResult {
  enterpriseValue: number;
  equityValue: number;
  pvExplicitFcfs: number;
  terminalValue: number;
  pvTerminalValue: number;
  terminalValuePercentage: number;
  perShareValue?: number;
  cashFlows: DcfYearBreakdown[];
  sensitivityMatrix: DcfSensitivityCell[];
}

export function calculateDcf(inputs: DcfInputs): DcfResult {
  const {
    initialFcf,
    growthRate,
    forecastYears,
    wacc,
    terminalMethod,
    terminalGrowthRate,
    exitMultiple,
    netDebt,
    sharesOutstanding,
  } = inputs;

  const r = Math.max(0.001, wacc / 100);
  const gForecast = growthRate / 100;
  const gTerm = terminalGrowthRate / 100;
  const n = Math.max(1, Math.min(20, Math.round(forecastYears)));

  const cashFlows: DcfYearBreakdown[] = [];
  let currentFcf = initialFcf;
  let pvExplicitFcfs = 0;

  for (let t = 1; t <= n; t++) {
    if (t > 1) {
      currentFcf = currentFcf * (1 + gForecast);
    }
    const discountFactor = 1 / Math.pow(1 + r, t);
    const pv = currentFcf * discountFactor;
    pvExplicitFcfs += pv;

    cashFlows.push({
      year: t,
      fcf: currentFcf,
      discountFactor,
      presentValue: pv,
      cumulativePv: pvExplicitFcfs,
    });
  }

  const finalYearFcf = currentFcf;
  let terminalValue = 0;

  if (terminalMethod === 'multiple') {
    terminalValue = finalYearFcf * Math.max(0, exitMultiple);
  } else {
    // Gordon Growth Model: TV = (FCF_n * (1 + g)) / (WACC - g)
    const effectiveSpread = Math.max(0.005, r - gTerm);
    terminalValue = (finalYearFcf * (1 + gTerm)) / effectiveSpread;
  }

  const pvTerminalValue = terminalValue / Math.pow(1 + r, n);
  const enterpriseValue = pvExplicitFcfs + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;
  const perShareValue =
    sharesOutstanding && sharesOutstanding > 0 ? equityValue / sharesOutstanding : undefined;

  const terminalValuePercentage =
    enterpriseValue > 0 ? (pvTerminalValue / enterpriseValue) * 100 : 0;

  // Build 5x5 Sensitivity Matrix (WACC ±2% vs Terminal Parameter)
  const sensitivityMatrix: DcfSensitivityCell[] = [];
  const waccDeltas = [-2, -1, 0, 1, 2];
  const termDeltas =
    terminalMethod === 'multiple' ? [-2, -1, 0, 1, 2] : [-1.0, -0.5, 0, 0.5, 1.0];

  for (const dw of waccDeltas) {
    const testWacc = Math.max(1, wacc + dw);
    const testR = testWacc / 100;

    for (const dt of termDeltas) {
      const testParam =
        terminalMethod === 'multiple'
          ? Math.max(1, exitMultiple + dt)
          : Math.max(0, Math.min(testWacc - 0.5, terminalGrowthRate + dt));

      // Re-evaluate PV of explicit FCFs
      let testPvExplicit = 0;
      let f = initialFcf;
      for (let t = 1; t <= n; t++) {
        if (t > 1) f *= 1 + gForecast;
        testPvExplicit += f / Math.pow(1 + testR, t);
      }

      let testTv = 0;
      if (terminalMethod === 'multiple') {
        testTv = f * testParam;
      } else {
        const testG = testParam / 100;
        testTv = (f * (1 + testG)) / Math.max(0.005, testR - testG);
      }

      const testPvTv = testTv / Math.pow(1 + testR, n);
      const testEv = testPvExplicit + testPvTv;
      const testEq = testEv - netDebt;

      sensitivityMatrix.push({
        wacc: testWacc,
        terminalParam: testParam,
        enterpriseValue: testEv,
        equityValue: testEq,
        perShareValue:
          sharesOutstanding && sharesOutstanding > 0 ? testEq / sharesOutstanding : undefined,
      });
    }
  }

  return {
    enterpriseValue,
    equityValue,
    pvExplicitFcfs,
    terminalValue,
    pvTerminalValue,
    terminalValuePercentage,
    perShareValue,
    cashFlows,
    sensitivityMatrix,
  };
}

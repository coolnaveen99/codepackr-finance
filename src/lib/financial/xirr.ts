/**
 * XIRR Calculator Engine
 * Extended Internal Rate of Return for irregular cash flows.
 * Newton-Raphson on NPV = 0. 100% client-side.
 */

export const XIRR_ENGINE_VERSION = '1.0.0';

export interface XirrCashFlow {
  date: string; // YYYY-MM-DD
  amount: number; // negative = investment/outflow, positive = return/inflow
}

export interface XirrResult {
  xirr: number | null; // annual rate as decimal e.g. 0.15 = 15%
  xirrPercent: number | null;
  converged: boolean;
  iterations: number;
  npvAtRate: number;
  notes: string[];
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
}

function npv(rate: number, flows: { t: number; amount: number }[]): number {
  return flows.reduce((sum, f) => sum + f.amount / Math.pow(1 + rate, f.t), 0);
}

function npvDerivative(rate: number, flows: { t: number; amount: number }[]): number {
  return flows.reduce((sum, f) => {
    if (f.t === 0) return sum;
    return sum - (f.t * f.amount) / Math.pow(1 + rate, f.t + 1);
  }, 0);
}

export function calculateXirr(cashFlows: XirrCashFlow[]): XirrResult {
  const notes: string[] = [
    'XIRR is the annualized return for investments with irregular dates and amounts.',
    'Use negative amounts for money invested (outflows) and positive for redemptions/dividends (inflows).',
    'Illustrative solver only — matches Excel XIRR within typical tolerance.',
  ];

  const parsed = cashFlows
    .map((c) => ({
      date: new Date(c.date + 'T00:00:00'),
      amount: c.amount,
    }))
    .filter((c) => !isNaN(c.date.getTime()) && c.amount !== 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (parsed.length < 2) {
    return {
      xirr: null,
      xirrPercent: null,
      converged: false,
      iterations: 0,
      npvAtRate: 0,
      notes: [...notes, 'Need at least two cash flows with non-zero amounts.'],
    };
  }

  const hasNeg = parsed.some((p) => p.amount < 0);
  const hasPos = parsed.some((p) => p.amount > 0);
  if (!hasNeg || !hasPos) {
    return {
      xirr: null,
      xirrPercent: null,
      converged: false,
      iterations: 0,
      npvAtRate: 0,
      notes: [...notes, 'Need both negative (investments) and positive (returns) cash flows.'],
    };
  }

  const first = parsed[0].date;
  const flows = parsed.map((p) => ({
    t: daysBetween(first, p.date) / 365,
    amount: p.amount,
  }));

  let rate = 0.1;
  let converged = false;
  let iterations = 0;
  const maxIter = 100;
  const tol = 1e-7;

  for (let i = 0; i < maxIter; i++) {
    iterations = i + 1;
    const f = npv(rate, flows);
    const df = npvDerivative(rate, flows);
    if (Math.abs(df) < 1e-12) break;
    const next = rate - f / df;
    if (!isFinite(next) || next <= -0.9999) {
      rate = rate / 2;
      continue;
    }
    if (Math.abs(next - rate) < tol) {
      rate = next;
      converged = Math.abs(npv(rate, flows)) < 1e-4;
      break;
    }
    rate = next;
  }

  const finalNpv = npv(rate, flows);
  if (!converged) converged = Math.abs(finalNpv) < 1e-3;

  if (!converged || !isFinite(rate)) {
    return {
      xirr: null,
      xirrPercent: null,
      converged: false,
      iterations,
      npvAtRate: finalNpv,
      notes: [...notes, 'Solver did not converge — try different cash flows or dates.'],
    };
  }

  return {
    xirr: rate,
    xirrPercent: Math.round(rate * 10000) / 100,
    converged: true,
    iterations,
    npvAtRate: finalNpv,
    notes,
  };
}

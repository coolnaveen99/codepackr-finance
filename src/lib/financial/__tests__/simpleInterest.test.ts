import { describe, it, expect } from 'vitest';
import {
  calculateSimpleInterest,
  SIMPLE_INTEREST_MODEL_VERSION,
  DEFAULT_SIMPLE_INTEREST_INPUTS,
} from '../simpleInterest';

describe('calculateSimpleInterest', () => {
  it('matches the textbook formula SI = P*R*T/100 for a known test vector', () => {
    // P=100000, R=8%, T=5 years -> SI = 100000*8*5/100 = 40000
    const result = calculateSimpleInterest({ principal: 100000, annualRatePercent: 8, years: 5 });
    expect(result.totalInterest).toBe(40000);
    expect(result.maturityAmount).toBe(140000);
  });

  it('matches a second independent test vector', () => {
    // P=250000, R=6.5%, T=3 years -> SI = 250000*6.5*3/100 = 48750
    const result = calculateSimpleInterest({ principal: 250000, annualRatePercent: 6.5, years: 3 });
    expect(result.totalInterest).toBeCloseTo(48750, 6);
    expect(result.maturityAmount).toBeCloseTo(298750, 6);
  });

  it('stamps the current model version', () => {
    const result = calculateSimpleInterest(DEFAULT_SIMPLE_INTEREST_INPUTS);
    expect(result.version).toBe(SIMPLE_INTEREST_MODEL_VERSION);
  });

  it('returns zero interest when years is 0', () => {
    const result = calculateSimpleInterest({ principal: 50000, annualRatePercent: 10, years: 0 });
    expect(result.totalInterest).toBe(0);
    expect(result.maturityAmount).toBe(50000);
    expect(result.yearlyBreakdown).toHaveLength(0);
  });

  it('returns zero interest when the rate is 0', () => {
    const result = calculateSimpleInterest({ principal: 50000, annualRatePercent: 0, years: 10 });
    expect(result.totalInterest).toBe(0);
    expect(result.maturityAmount).toBe(50000);
  });

  it('clamps negative principal, rate, and years to 0 instead of producing negative interest', () => {
    const result = calculateSimpleInterest({ principal: -1000, annualRatePercent: -5, years: -2 });
    expect(result.principal).toBe(0);
    expect(result.annualRatePercent).toBe(0);
    expect(result.years).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.maturityAmount).toBe(0);
  });

  it('clamps non-finite inputs (NaN/Infinity) to 0 rather than propagating them', () => {
    const result = calculateSimpleInterest({
      principal: NaN,
      annualRatePercent: Infinity,
      years: 5,
    });
    expect(Number.isFinite(result.totalInterest)).toBe(true);
    expect(result.totalInterest).toBe(0);
  });

  it('supports fractional years and pro-rates the final partial year', () => {
    // P=100000, R=10%, T=2.5 years -> SI = 100000*10*2.5/100 = 25000
    const result = calculateSimpleInterest({ principal: 100000, annualRatePercent: 10, years: 2.5 });
    expect(result.totalInterest).toBeCloseTo(25000, 6);

    // 2 full years + 1 partial (0.5) year row
    expect(result.yearlyBreakdown).toHaveLength(3);
    const lastRow = result.yearlyBreakdown[2];
    expect(lastRow.year).toBeCloseTo(2.5, 6);
    // Partial year interest should be half of a full year's interest (10000/2)
    expect(lastRow.interestForYear).toBeCloseTo(5000, 6);
  });

  it('produces a yearly breakdown whose cumulative interest sums to the total interest', () => {
    const result = calculateSimpleInterest({ principal: 100000, annualRatePercent: 8, years: 5 });
    const lastRow = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
    expect(lastRow.cumulativeInterest).toBeCloseTo(result.totalInterest, 6);
    expect(lastRow.closingBalance).toBeCloseTo(result.maturityAmount, 6);
  });

  it('gives every year an equal interest slice (linear accrual, unlike compound interest)', () => {
    const result = calculateSimpleInterest({ principal: 100000, annualRatePercent: 8, years: 4 });
    const interestSlices = result.yearlyBreakdown.map((r) => r.interestForYear);
    // All four full-year slices should be identical (8000 each), since
    // simple interest never compounds on prior interest.
    for (const slice of interestSlices) {
      expect(slice).toBeCloseTo(8000, 6);
    }
  });
});

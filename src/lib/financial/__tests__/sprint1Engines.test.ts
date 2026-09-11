import { describe, it, expect } from 'vitest';
import { calculateNPV } from '../npv';
import { calculateIRR } from '../irr';
import { calculateBreakEven } from '../breakEven';
import { calculateBusinessValuation } from '../businessValuation';

describe('Sprint 1 Engines — Business & Valuation Foundation', () => {
  describe('NPV Calculator Engine', () => {
    it('calculates classic textbook NPV correctly', () => {
      // Outflow 100,000, Inflows [30000, 40000, 50000, 40000, 30000], discount 10%
      const res = calculateNPV({
        initialInvestment: 100000,
        discountRate: 10,
        cashFlows: [30000, 40000, 50000, 40000, 30000],
      });

      expect(res.decision).toBe('ACCEPT');
      expect(res.totalPV).toBeGreaterThan(130000);
      expect(res.npv).toBeGreaterThan(30000);
      expect(res.profitabilityIndex).toBeGreaterThan(1.3);
      expect(res.presentValues.length).toBe(5);
      expect(res.paybackPeriodYears).not.toBeNull();
      expect(res.discountedPaybackPeriodYears).not.toBeNull();
    });

    it('handles negative NPV when inflows fail to cover discount rate', () => {
      const res = calculateNPV({
        initialInvestment: 100000,
        discountRate: 15,
        cashFlows: [20000, 20000, 20000],
      });

      expect(res.decision).toBe('REJECT');
      expect(res.npv).toBeLessThan(0);
      expect(res.profitabilityIndex).toBeLessThan(1.0);
    });

    it('handles zero discount rate', () => {
      const res = calculateNPV({
        initialInvestment: 50000,
        discountRate: 0,
        cashFlows: [20000, 20000, 20000],
      });

      expect(res.totalPV).toBe(60000);
      expect(res.npv).toBe(10000);
      expect(res.profitabilityIndex).toBe(1.2);
    });

    it('handles empty cash flows', () => {
      const res = calculateNPV({
        initialInvestment: 50000,
        discountRate: 10,
        cashFlows: [],
      });

      expect(res.totalPV).toBe(0);
      expect(res.npv).toBe(-50000);
      expect(res.decision).toBe('REJECT');
    });
  });

  describe('IRR Calculator Engine', () => {
    it('solves textbook IRR accurately with Newton-Raphson', () => {
      // Outflow 100,000, Inflows [30000, 40000, 50000, 40000, 30000]
      const res = calculateIRR({
        initialInvestment: 100000,
        cashFlows: [30000, 40000, 50000, 40000, 30000],
        hurdleRate: 12,
      });

      expect(res.isConverged).toBe(true);
      expect(res.irr).not.toBeNull();
      // Textbook IRR for this series is approximately 22% - 24%
      expect(res.irr!).toBeGreaterThan(20);
      expect(res.irr!).toBeLessThan(26);
      expect(res.decision).toBe('ACCEPT');
      expect(res.hurdleComparison).toBe('ABOVE');
      expect(Math.abs(res.npvAtIrr)).toBeLessThan(1.0);
    });

    it('correctly flags project when IRR is below Hurdle Rate', () => {
      const res = calculateIRR({
        initialInvestment: 100000,
        cashFlows: [30000, 40000, 50000, 40000, 30000],
        hurdleRate: 30,
      });

      expect(res.isConverged).toBe(true);
      expect(res.hurdleComparison).toBe('BELOW');
      expect(res.decision).toBe('REJECT');
    });

    it('handles impossible cash flows with no positive returns', () => {
      const res = calculateIRR({
        initialInvestment: 100000,
        cashFlows: [0, 0, 0],
      });

      expect(res.isConverged).toBe(false);
      expect(res.irr).toBeNull();
      expect(res.decision).toBe('INDETERMINATE');
    });
  });

  describe('Break-Even Calculator Engine', () => {
    it('calculates break-even units and revenue accurately', () => {
      // Fixed 50,000, Variable 30, Selling 50 => CM = 20
      // BE Units = 50,000 / 20 = 2,500 units. BE Revenue = 2,500 * 50 = 125,000
      const res = calculateBreakEven({
        fixedCosts: 50000,
        variableCostPerUnit: 30,
        sellingPricePerUnit: 50,
        expectedUnits: 3000,
      });

      expect(res.isAchievable).toBe(true);
      expect(res.contributionMarginPerUnit).toBe(20);
      expect(res.contributionMarginRatio).toBe(40);
      expect(res.breakEvenUnits).toBe(2500);
      expect(res.breakEvenRevenue).toBe(125000);
      expect(res.marginOfSafetyUnits).toBe(500);
      expect(res.marginOfSafetyPercent).toBeCloseTo(16.67, 1);
      expect(res.profitAtExpected).toBe(10000); // 3000 * 20 - 50000 = 10000
    });

    it('handles unachievable break-even when variable cost >= price', () => {
      const res = calculateBreakEven({
        fixedCosts: 50000,
        variableCostPerUnit: 60,
        sellingPricePerUnit: 50,
        expectedUnits: 1000,
      });

      expect(res.isAchievable).toBe(false);
      expect(res.breakEvenUnits).toBe(Infinity);
      expect(res.contributionMarginPerUnit).toBe(-10);
    });
  });

  describe('Business Valuation Calculator Engine', () => {
    it('computes low, base, and high enterprise and equity values with net debt', () => {
      const res = calculateBusinessValuation({
        method: 'ebitda',
        metricValue: 2000000,
        multiples: { low: 4.0, base: 5.5, high: 7.5 },
        netDebt: 1500000,
      });

      expect(res.scenarios.conservative.enterpriseValue).toBe(8000000);
      expect(res.scenarios.conservative.equityValue).toBe(6500000); // 8M - 1.5M

      expect(res.scenarios.base.enterpriseValue).toBe(11000000);
      expect(res.scenarios.base.equityValue).toBe(9500000); // 11M - 1.5M

      expect(res.scenarios.optimistic.enterpriseValue).toBe(15000000);
      expect(res.scenarios.optimistic.equityValue).toBe(13500000); // 15M - 1.5M

      expect(res.sensitivityTable.length).toBe(7);
    });

    it('handles net cash (negative net debt) which increases equity value', () => {
      const res = calculateBusinessValuation({
        method: 'revenue',
        metricValue: 5000000,
        multiples: { low: 3.0, base: 5.0, high: 8.0 },
        netDebt: -1000000, // 1M net cash
      });

      expect(res.scenarios.base.enterpriseValue).toBe(25000000);
      expect(res.scenarios.base.equityValue).toBe(26000000); // 25M - (-1M) = 26M
    });
  });
});

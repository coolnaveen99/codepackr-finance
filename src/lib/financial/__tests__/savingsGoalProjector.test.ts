import { describe, it, expect } from 'vitest';
import {
  calculateRequiredPMT,
  calculateMonthsToReachGoal,
  projectSavingsGoal,
  SAVINGS_VEHICLES,
} from '../savingsGoalProjector';

describe('Savings Goal Projector Engine', () => {
  it('correctly calculates required PMT for ₹1,00,000 in 6 months with ₹0 saved', () => {
    // Zero rate check: 100,000 / 6 = 16,666.67
    const zeroRatePmt = calculateRequiredPMT(100000, 0, 0, 6);
    expect(zeroRatePmt).toBeCloseTo(16666.67, 1);

    // Savings account at 3.5%
    const savingsPmt = calculateRequiredPMT(100000, 0, 3.5, 6);
    expect(savingsPmt).toBeLessThan(16666.67);
    expect(savingsPmt).toBeGreaterThan(16500);

    // Ultra Short fund at 7.2%
    const ultraShortPmt = calculateRequiredPMT(100000, 0, 7.2, 6);
    expect(ultraShortPmt).toBeLessThan(savingsPmt);
    expect(ultraShortPmt).toBeGreaterThan(16300);
  });

  it('handles already saved (PV) properly', () => {
    // If goal is 100,000 and already saved is 100,000, PMT should be 0
    const pmt = calculateRequiredPMT(100000, 100000, 6.5, 6);
    expect(pmt).toBe(0);

    // If goal is 100,000 and already saved is 40,000
    const pmtWithPv = calculateRequiredPMT(100000, 40000, 6.5, 6);
    const pmtWithoutPv = calculateRequiredPMT(100000, 0, 6.5, 6);
    expect(pmtWithPv).toBeLessThan(pmtWithoutPv);
    expect(pmtWithPv).toBeGreaterThan(9500);
  });

  it('evaluates all 6 comparison vehicles', () => {
    const result = projectSavingsGoal({
      targetGoalAmount: 100000,
      timeHorizonMonths: 6,
      alreadySaved: 0,
      showPostTax: false,
      taxSlabPercent: 30,
    });

    expect(result.plans.length).toBe(6);
    expect(result.plans.map(p => p.vehicle.id)).toEqual([
      'savings-account',
      'recurring-deposit',
      'fixed-deposit',
      'liquid-fund',
      'ultra-short-fund',
      'arbitrage-fund',
    ]);

    // Higher return must yield lower required PMT
    const savingsPlan = result.plans.find(p => p.vehicle.id === 'savings-account')!;
    const rdPlan = result.plans.find(p => p.vehicle.id === 'recurring-deposit')!;
    const ultraPlan = result.plans.find(p => p.vehicle.id === 'ultra-short-fund')!;

    expect(savingsPlan.requiredMonthlyPMT).toBeGreaterThan(rdPlan.requiredMonthlyPMT);
    expect(rdPlan.requiredMonthlyPMT).toBeGreaterThan(ultraPlan.requiredMonthlyPMT);

    // Monthly schedule must have 6 entries
    expect(savingsPlan.schedule.length).toBe(6);
    expect(savingsPlan.schedule[5].closingBalance).toBeCloseTo(100000, 0);
  });

  it('correctly applies post-tax equity advantage to Arbitrage Funds', () => {
    const preTax = projectSavingsGoal({
      targetGoalAmount: 100000,
      timeHorizonMonths: 6,
      alreadySaved: 0,
      showPostTax: false,
      taxSlabPercent: 30,
    });

    const postTax = projectSavingsGoal({
      targetGoalAmount: 100000,
      timeHorizonMonths: 6,
      alreadySaved: 0,
      showPostTax: true,
      taxSlabPercent: 30,
    });

    const fdPost = postTax.plans.find(p => p.vehicle.id === 'fixed-deposit')!;
    const arbPost = postTax.plans.find(p => p.vehicle.id === 'arbitrage-fund')!;

    // FD: 6.5% * (1 - 0.30) = 4.55%
    expect(fdPost.effectiveAnnualRate).toBeCloseTo(4.55, 2);

    // Arbitrage: 7.0% taxed as Equity STCG (20%), so 7.0% * (1 - 0.20) = 5.60%
    expect(arbPost.effectiveAnnualRate).toBeCloseTo(5.60, 2);

    // Because Arbitrage has higher post-tax yield (5.60% vs 4.55%), its required PMT is lower
    expect(arbPost.requiredMonthlyPMT).toBeLessThan(fdPost.requiredMonthlyPMT);
  });

  it('calculates capacity feasibility and extra months needed', () => {
    const result = projectSavingsGoal({
      targetGoalAmount: 100000,
      timeHorizonMonths: 6,
      alreadySaved: 0,
      monthlyCapacity: 15000, // User can only save 15k/mo while ~16.4k is needed
      showPostTax: false,
      taxSlabPercent: 30,
    });

    const plan = result.plans[0];
    expect(plan.capacityAnalysis).toBeDefined();
    expect(plan.capacityAnalysis?.status).toBe('tight'); // 15k is ~90% of ~16.5k
    expect(plan.capacityAnalysis?.differencePerMonth).toBeLessThan(0); // shortfall
    expect(plan.capacityAnalysis?.extraMonthsNeededAtCapacity).toBeGreaterThanOrEqual(1);
  });

  it('handles edge cases gracefully', () => {
    // Already saved is greater than goal
    const resultSurplus = projectSavingsGoal({
      targetGoalAmount: 50000,
      timeHorizonMonths: 6,
      alreadySaved: 60000,
      showPostTax: false,
      taxSlabPercent: 30,
    });
    expect(resultSurplus.plans[0].requiredMonthlyPMT).toBe(0);

    // 1 month horizon
    const result1m = projectSavingsGoal({
      targetGoalAmount: 100000,
      timeHorizonMonths: 1,
      alreadySaved: 0,
      showPostTax: false,
      taxSlabPercent: 30,
    });
    expect(result1m.plans[0].requiredMonthlyPMT).toBe(100000);
    expect(result1m.plans[0].schedule.length).toBe(1);
  });
});

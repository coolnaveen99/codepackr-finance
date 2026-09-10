import { describe, it, expect } from 'vitest';
import {
  simulateAccumulation,
  simulateRetirement,
  computeRequiredCorpus,
  computeRequiredSip,
  computeFinancialIndependenceAge,
  calculateFinancialPlan,
  DEFAULT_FINANCIAL_INPUTS,
  FINANCIAL_MODEL_VERSION,
  FinancialInputs,
} from '../engine';

/**
 * Base inputs are cloned per-test so overrides never leak between cases.
 * Where a test needs a "clean room" scenario (no debt, no emergency fund,
 * no pension) it starts from ZERO_INPUTS instead so unrelated fields can't
 * quietly change the expected outcome.
 */
const ZERO_INPUTS: FinancialInputs = {
  clientName: 'Test',
  currentAge: 30,
  retirementAge: 30, // overridden per test
  lifeExpectancy: 30, // overridden per test
  annualIncome: 0,
  incomeGrowth: 0,
  annualExpenses: 0,
  inflation: 0,
  currentCorpus: 0,
  monthlySip: 0,
  sipStepUp: 0,
  annualLumpSum: 0,
  preReturn: 0,
  postReturn: 0,
  emergencyFund: 0,
  emergencyMonths: 0,
  totalDebt: 0,
  annualDebtPayment: 0,
  annualRetirementIncome: 0,
};

const clone = (overrides: Partial<FinancialInputs> = {}): FinancialInputs => ({
  ...ZERO_INPUTS,
  ...overrides,
});

describe('simulateAccumulation', () => {
  it('matches the closed-form annuity-due formula for a single year of SIP', () => {
    // Contribution happens BEFORE growth is applied each month, so this is
    // an annuity-due: FV = P * (1+r) * [(1+r)^n - 1] / r
    const inputs = clone({
      currentAge: 30,
      retirementAge: 31, // 1 year = 12 months
      monthlySip: 1000,
      preReturn: 12, // 12% annual
    });

    const { finalCorpus, totalContributions } = simulateAccumulation(inputs);

    const annualRate = 0.12;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const n = 12;
    const expectedFV =
      1000 * (1 + monthlyRate) * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);

    expect(finalCorpus).toBeCloseTo(expectedFV, 6);
    expect(totalContributions).toBe(12000); // 12 months * 1000, no step-up
  });

  it('returns the current corpus unchanged when there are zero years to retirement', () => {
    const inputs = clone({
      currentAge: 45,
      retirementAge: 45,
      currentCorpus: 500000,
      monthlySip: 20000,
      preReturn: 10,
    });

    const { finalCorpus, rows, totalContributions, totalGrowth } = simulateAccumulation(inputs);

    expect(finalCorpus).toBe(500000);
    expect(rows).toHaveLength(0);
    expect(totalContributions).toBe(0);
    expect(totalGrowth).toBe(0);
  });

  it('grows a lump-sum-only corpus (no SIP) at exactly the compounded annual rate', () => {
    // With monthlySip=0, the monthly compounding loop still applies growth
    // every month, so this must equal (1+annual)^years, not simple interest.
    const inputs = clone({
      currentAge: 30,
      retirementAge: 33, // 3 years
      currentCorpus: 100000,
      preReturn: 8,
    });

    const { finalCorpus } = simulateAccumulation(inputs);
    const expected = 100000 * Math.pow(1.08, 3);

    expect(finalCorpus).toBeCloseTo(expected, 6);
  });

  it('applies the annual SIP step-up geometrically, not linearly', () => {
    const inputs = clone({
      currentAge: 30,
      retirementAge: 33, // 3 years
      monthlySip: 1000,
      sipStepUp: 10, // +10% each year
      preReturn: 0, // isolate step-up effect from growth
    });

    const { rows } = simulateAccumulation(inputs);

    // Year 1 contribution: 1000/mo * 12 = 12000
    // Year 2 contribution: 1000*1.10/mo * 12 = 13200
    // Year 3 contribution: 1000*1.10^2/mo * 12 = 14520
    expect(rows[0].annualContribution).toBeCloseTo(12000, 6);
    expect(rows[1].annualContribution).toBeCloseTo(13200, 6);
    expect(rows[2].annualContribution).toBeCloseTo(14520, 6);
  });

  it('adds the annual lump sum to contributions and corpus at year end', () => {
    const inputs = clone({
      currentAge: 30,
      retirementAge: 31,
      monthlySip: 0,
      annualLumpSum: 50000,
      preReturn: 0,
    });

    const { finalCorpus, totalContributions } = simulateAccumulation(inputs);
    expect(finalCorpus).toBe(50000);
    expect(totalContributions).toBe(50000);
  });
});

describe('simulateRetirement', () => {
  it('depletes immediately when there is no corpus and a positive expense', () => {
    const inputs = clone({
      retirementAge: 60,
      lifeExpectancy: 65, // 5 retirement years
      annualExpenses: 100000,
    });

    const { depletionAge, rows } = simulateRetirement(0, 100000, inputs);

    expect(depletionAge).toBe(61); // retirementAge + 1
    expect(rows[0].closingCorpus).toBe(0); // clamped, never negative
  });

  it('never depletes when retirement income fully covers expenses and growth is non-negative', () => {
    const inputs = clone({
      retirementAge: 60,
      lifeExpectancy: 90, // 30 retirement years
      annualExpenses: 100000,
      annualRetirementIncome: 100000,
      postReturn: 5,
      inflation: 0, // keep income == expenses every year
    });

    // firstYearExpense passed in must match how retirementIncome is grown
    // (both scaled by inflation from currentAge to retirementAge -> 0 here)
    const { depletionAge, endCorpus, rows } = simulateRetirement(1000000, 100000, inputs);

    expect(depletionAge).toBeNull();
    expect(endCorpus).toBeGreaterThan(1000000); // grows since withdrawal ~ 0
    // withdrawal should be ~0 every year since income offsets expense
    for (const row of rows) {
      expect(row.withdrawal).toBeCloseTo(0, 6);
    }
  });

  it('produces exactly zero retirement years when retirementAge >= lifeExpectancy', () => {
    const inputs = clone({ retirementAge: 65, lifeExpectancy: 65, annualExpenses: 50000 });
    const { rows, depletionAge, endCorpus } = simulateRetirement(1000000, 50000, inputs);

    expect(rows).toHaveLength(0);
    expect(depletionAge).toBeNull();
    expect(endCorpus).toBe(1000000);
  });
});

describe('computeRequiredCorpus', () => {
  it('converges to expense * retirementYears when return and inflation are both zero', () => {
    // With 0% growth and 0% inflation, required corpus is just the sum of
    // constant withdrawals: E * years (to the nearest $1, since the binary
    // search stops once the bracket is under 1 unit wide).
    const inputs = clone({
      retirementAge: 60,
      lifeExpectancy: 65, // 5 years
      annualExpenses: 100000,
      postReturn: 0,
      inflation: 0,
    });

    const required = computeRequiredCorpus(100000, inputs);
    expect(required).toBeCloseTo(500000, 0);
  });

  it('requires a smaller corpus when retirement income offsets part of the expense', () => {
    const base = clone({
      retirementAge: 60,
      lifeExpectancy: 65,
      annualExpenses: 100000,
      postReturn: 0,
      inflation: 0,
    });
    const withPension = clone({ ...base, annualRetirementIncome: 40000 });

    const requiredBase = computeRequiredCorpus(100000, base);
    const requiredWithPension = computeRequiredCorpus(100000, withPension);

    expect(requiredWithPension).toBeLessThan(requiredBase);
  });

  it('returns near-0 when there are no retirement years to fund', () => {
    // The binary search only guarantees convergence to within 1 unit of the
    // true bracket width (see the `hi - lo < 1` stop condition in the
    // engine), so assert "under 1", not an exact 0.
    const inputs = clone({ retirementAge: 65, lifeExpectancy: 65, annualExpenses: 100000 });
    const required = computeRequiredCorpus(100000, inputs);
    expect(required).toBeGreaterThanOrEqual(0);
    expect(required).toBeLessThan(1);
  });
});

describe('computeRequiredSip', () => {
  it('returns the current SIP unchanged when the plan is already fully funded', () => {
    const inputs = clone({
      currentAge: 30,
      retirementAge: 40,
      currentCorpus: 10_000_000,
      monthlySip: 5000,
      preReturn: 8,
    });

    const required = computeRequiredSip(1_000_000, inputs); // far below what's already funded
    expect(required).toBe(inputs.monthlySip);
  });

  it('solves a SIP whose simulated corpus meets (not wildly overshoots) the target', () => {
    const inputs = clone({
      currentAge: 30,
      retirementAge: 40, // 10 years
      preReturn: 10,
    });

    const target = 5_000_000;
    const requiredSip = computeRequiredSip(target, inputs);
    const achieved = simulateAccumulation(inputs, { monthlySip: requiredSip }).finalCorpus;

    expect(achieved).toBeGreaterThanOrEqual(target - 1);
    // Binary search converges within 1 unit of SIP; achieved shouldn't
    // overshoot the target by more than what one extra rupee of monthly
    // SIP over 10 years could plausibly add.
    expect(achieved).toBeLessThan(target * 1.001);
  });
});

describe('computeFinancialIndependenceAge', () => {
  it('returns currentAge + 1 when already fully funded for immediate retirement', () => {
    const inputs = clone({
      currentAge: 50,
      lifeExpectancy: 90,
      currentCorpus: 100_000_000, // way more than needed
      annualExpenses: 100000,
      postReturn: 5,
    });

    expect(computeFinancialIndependenceAge(inputs)).toBe(51);
  });

  it('returns null when the corpus can never fund retirement before life expectancy', () => {
    const inputs = clone({
      currentAge: 50,
      lifeExpectancy: 55, // very little runway
      currentCorpus: 0,
      monthlySip: 0,
      annualExpenses: 100000,
    });

    expect(computeFinancialIndependenceAge(inputs)).toBeNull();
  });
});

describe('calculateFinancialPlan (integration)', () => {
  it('stamps the current model version on every plan', () => {
    const plan = calculateFinancialPlan(DEFAULT_FINANCIAL_INPUTS);
    expect(plan.version).toBe(FINANCIAL_MODEL_VERSION);
  });

  it('keeps fundingRatio internally consistent with projected/required corpus', () => {
    const plan = calculateFinancialPlan(DEFAULT_FINANCIAL_INPUTS);
    const expectedRatio =
      plan.requiredCorpus > 0 ? plan.projectedCorpus / plan.requiredCorpus : 0;
    expect(plan.fundingRatio).toBeCloseTo(expectedRatio, 9);
  });

  it('never produces NaN/Infinity anywhere in scores or top-level numeric fields', () => {
    const plan = calculateFinancialPlan(DEFAULT_FINANCIAL_INPUTS);
    const numericFields = [
      plan.annualSavings,
      plan.savingsRate,
      plan.investmentRate,
      plan.expenseRatio,
      plan.requiredEmergencyFund,
      plan.emergencyCoverage,
      plan.debtToAnnualIncome,
      plan.projectedCorpus,
      plan.requiredCorpus,
      plan.fundingRatio,
      plan.requiredMonthlySip,
      plan.scores.financialHealth,
      plan.scores.retirementReadiness,
    ];
    for (const value of numericFields) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it('does not divide by zero when annualIncome is 0 (all ratios fall back to 0)', () => {
    const inputs: FinancialInputs = { ...DEFAULT_FINANCIAL_INPUTS, annualIncome: 0 };
    const plan = calculateFinancialPlan(inputs);
    expect(plan.savingsRate).toBe(0);
    expect(plan.investmentRate).toBe(0);
    expect(plan.expenseRatio).toBe(0);
    expect(Number.isFinite(plan.scores.financialHealth)).toBe(true);
  });

  it('keeps financialHealth score within the documented 0-100 bounds', () => {
    // Try a spread of plausible and extreme inputs to catch out-of-range scores.
    const variants: Partial<FinancialInputs>[] = [
      {},
      { annualIncome: 100, annualExpenses: 100000, totalDebt: 10_000_000 },
      { currentCorpus: 0, monthlySip: 0, annualIncome: 1_000_000, annualExpenses: 999_999 },
      { emergencyFund: 100_000_000 },
    ];
    for (const overrides of variants) {
      const plan = calculateFinancialPlan({ ...DEFAULT_FINANCIAL_INPUTS, ...overrides });
      expect(plan.scores.financialHealth).toBeGreaterThanOrEqual(0);
      expect(plan.scores.financialHealth).toBeLessThanOrEqual(100);
    }
  });

  it('produces recommendations ranked by descending fundingRatioAfter', () => {
    // Force a shortfall so recommendations are generated (not the single
    // "on-track" short-circuit).
    const inputs: FinancialInputs = {
      ...DEFAULT_FINANCIAL_INPUTS,
      monthlySip: 1000,
      currentCorpus: 0,
    };
    const plan = calculateFinancialPlan(inputs);

    expect(plan.recommendations.length).toBeGreaterThan(0);
    for (let i = 1; i < plan.recommendations.length; i++) {
      expect(plan.recommendations[i].fundingRatioAfter).toBeLessThanOrEqual(
        plan.recommendations[i - 1].fundingRatioAfter
      );
    }
    // Priority should be reassigned 1..n after sorting.
    plan.recommendations.forEach((rec, i) => expect(rec.priority).toBe(i + 1));
  });

  it('short-circuits to a single on-track recommendation when already funded', () => {
    const inputs: FinancialInputs = {
      ...DEFAULT_FINANCIAL_INPUTS,
      currentCorpus: 1_000_000_000, // absurdly overfunded
    };
    const plan = calculateFinancialPlan(inputs);
    expect(plan.recommendations).toHaveLength(1);
    expect(plan.recommendations[0].id).toBe('on-track');
  });

  it('falls back to "Valued Client" when clientName is blank or whitespace', () => {
    const inputs: FinancialInputs = { ...DEFAULT_FINANCIAL_INPUTS, clientName: '   ' };
    const plan = calculateFinancialPlan(inputs);
    expect(plan.clientName).toBe('Valued Client');
    expect(plan.inputs.clientName).toBe('Valued Client');
  });
});

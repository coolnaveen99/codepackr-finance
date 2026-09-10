import { describe, it, expect } from 'vitest';
import { calculateLoanEmi, calculateBaseMonthlyEmi } from '../loanEmi';
import { calculateSip, calculateSimpleSipMaturity } from '../sip';
import { calculateCompoundInterest, calculateEffectiveAnnualRate } from '../compoundInterest';
import { calculateCagr } from '../cagr';
import { calculateInflation } from '../inflation';
import { calculateEmergencyFund } from '../emergencyFund';
import { calculateNetWorth } from '../netWorth';
import { calculateRoi } from '../roi';
import { calculateFire } from '../fire';
import { calculateIndiaIncomeTax } from '../incomeTax';
import { calculateCtcToInHand } from '../ctcToInHand';

describe('Loan EMI Engine', () => {
  it('calculates standard loan EMI accurately', () => {
    // Principal 1,00,000, 10% annual, 12 months
    // Standard EMI is approx 8,791.59
    const emi = calculateBaseMonthlyEmi(100000, 10, 12);
    expect(Math.round(emi)).toBe(8792);

    const result = calculateLoanEmi({
      principal: 100000,
      annualInterestRate: 10,
      tenureMonths: 12,
    });
    expect(Math.round(result.monthlyEmi)).toBe(8792);
    expect(result.amortizationSchedule.length).toBe(12);
    expect(Math.round(result.totalInterest)).toBe(5499);
    expect(Math.round(result.totalPayment)).toBe(105499);
  });

  it('handles zero interest rate as principal / months', () => {
    const emi = calculateBaseMonthlyEmi(120000, 0, 12);
    expect(emi).toBe(10000);
  });

  it('calculates prepayment savings correctly', () => {
    const result = calculateLoanEmi({
      principal: 1000000,
      annualInterestRate: 9,
      tenureMonths: 120, // 10 years
      extraMonthlyPayment: 2000,
    });
    expect(result.prepaymentImpact).toBeDefined();
    expect(result.prepaymentImpact!.monthsSaved).toBeGreaterThan(0);
    expect(result.prepaymentImpact!.interestSaved).toBeGreaterThan(0);
  });
});

describe('SIP Calculation Engine', () => {
  it('calculates standard SIP maturity correctly', () => {
    // ₹10,000/mo, 12% p.a., 10 years (120 months)
    const maturity = calculateSimpleSipMaturity(10000, 12, 10);
    // Standard SIP maturity for 10k at 12% for 10 yrs is ~₹23.23 Lakhs
    expect(Math.round(maturity)).toBe(2323391);

    const result = calculateSip({
      monthlyInvestment: 10000,
      expectedAnnualReturnRate: 12,
      tenureYears: 10,
    });
    expect(result.totalInvested).toBe(1200000);
    expect(Math.round(result.maturityValue)).toBe(2323391);
    expect(Math.round(result.wealthGained)).toBe(1123391);
    expect(result.yearlyBreakdown.length).toBe(10);
  });

  it('calculates SIP with annual step-up', () => {
    const result = calculateSip({
      monthlyInvestment: 10000,
      expectedAnnualReturnRate: 12,
      tenureYears: 5,
      annualStepUpPercent: 10,
    });
    // With 10% annual step-up, total invested > 5 * 12 * 10,000 (6,00,000)
    expect(result.totalInvested).toBeGreaterThan(600000);
    expect(result.yearlyBreakdown[1].monthlyDeposit).toBe(11000);
  });
});

describe('Compound Interest Engine', () => {
  it('computes annual compounding correctly', () => {
    // 10,000 at 10% for 2 years compounded annually = 10,000 * 1.1^2 = 12,100
    const result = calculateCompoundInterest({
      initialPrincipal: 10000,
      annualInterestRate: 10,
      tenureYears: 2,
      compoundingFrequency: 1,
    });
    expect(Math.round(result.maturityBalance)).toBe(12100);
    expect(Math.round(result.totalInterestEarned)).toBe(2100);
  });

  it('computes APY correctly for monthly compounding', () => {
    // 12% nominal compounded monthly -> APY is approx 12.68%
    const apy = calculateEffectiveAnnualRate(12, 12);
    expect(Number(apy.toFixed(2))).toBe(12.68);
  });
});

describe('CAGR Engine', () => {
  it('calculates CAGR accurately', () => {
    // 1,00,000 grows to 2,00,000 in 5 years -> CAGR is approx 14.87%
    const result = calculateCagr({
      initialValue: 100000,
      finalValue: 200000,
      tenureYears: 5,
    });
    expect(Number(result.cagrPercent.toFixed(2))).toBe(14.87);
    expect(result.totalGain).toBe(100000);
    expect(result.multipleOfCapital).toBe(2);
  });

  it('handles edge case of zero tenure gracefully', () => {
    const result = calculateCagr({
      initialValue: 100000,
      finalValue: 200000,
      tenureYears: 0,
    });
    expect(result.totalGain).toBe(100000);
  });
});

describe('Inflation Engine', () => {
  it('calculates future cost and purchasing power erosion', () => {
    // Today's 1,00,000 at 6% inflation over 10 years
    // Future cost = 1,00,000 * (1.06)^10 = ~1,79,085
    const result = calculateInflation({
      currentAmount: 100000,
      annualInflationRate: 6,
      timeHorizonYears: 10,
    });
    expect(Math.round(result.futureCost)).toBe(179085);
    expect(Math.round(result.futurePurchasingPower)).toBe(55839);
    expect(result.ruleOf72DoublingYears).toBe(12);
  });
});

describe('Emergency Fund Engine', () => {
  it('calculates target fund and shortfall accurately', () => {
    const result = calculateEmergencyFund({
      monthlyHousing: 25000,
      monthlyFoodGroceries: 15000,
      monthlyUtilitiesBills: 5000,
      monthlyDebtEmi: 10000,
      monthlyInsuranceHealth: 3000,
      monthlyOtherEssentials: 2000,
      coverageMonths: 6,
      currentSavings: 180000,
      monthlySavingsCapacity: 20000,
    });
    // Total monthly essentials = 60,000
    // 6 months target = 3,60,000
    // Current savings = 1,80,000 -> shortfall = 1,80,000
    expect(result.monthlyEssentialExpenses).toBe(60000);
    expect(result.targetFundAmount).toBe(360000);
    expect(result.fundingGap).toBe(180000);
    expect(result.fundedPercentage).toBe(50);
    expect(result.monthsToFullFunding).toBe(9); // 1,80,000 / 20,000 = 9 months
  });
});

describe('Net Worth Engine', () => {
  it('calculates assets, liabilities, and net worth correctly', () => {
    const result = calculateNetWorth({
      assets: {
        cashAndBank: 100000,
        fixedDepositsAndBonds: 200000,
        equitiesAndMutualFunds: 500000,
        retirementAccounts: 300000,
        realEstate: 5000000,
        preciousMetals: 200000,
        otherAssets: 0,
      },
      liabilities: {
        homeMortgage: 2500000,
        vehicleLoans: 300000,
        personalAndStudentLoans: 0,
        creditCardDues: 25000,
        otherLiabilities: 0,
      },
    });
    expect(result.totalAssets).toBe(6300000);
    expect(result.totalLiabilities).toBe(2825000);
    expect(result.netWorth).toBe(3475000);
    expect(result.debtToAssetRatio).toBeCloseTo(44.84, 1);
  });
});

describe('ROI Engine', () => {
  it('calculates simple and annualized ROI', () => {
    const result = calculateRoi({
      initialInvestment: 100000,
      finalValue: 150000,
      holdingPeriodYears: 3,
    });
    expect(result.roiPercentage).toBe(50);
    expect(result.capitalMultiple).toBe(1.5);
    expect(Number(result.annualizedRoiPercentage.toFixed(2))).toBe(14.47);
  });
});

describe('FIRE Engine', () => {
  it('computes standard, lean, and fat FIRE targets correctly', () => {
    // Annual expenses ₹12,00,000, SWR 4% -> Standard FIRE = 25 * 12L = 3 Crore
    const result = calculateFire({
      currentAge: 30,
      currentAnnualExpenses: 1200000,
      currentNetWorth: 5000000,
      annualSavings: 600000,
      expectedAnnualReturn: 12,
      expectedInflation: 6,
      safeWithdrawalRate: 4,
    });
    expect(result.standardFireNumber).toBe(30000000);
    expect(result.leanFireNumber).toBe(22500000);
    expect(result.fatFireNumber).toBe(40500000);
    expect(result.yearsToFire).toBeDefined();
  });
});

describe('India Income Tax Engine', () => {
  it('calculates zero tax for income up to 7.75L under New Regime due to standard deduction + 87A rebate', () => {
    const result = calculateIndiaIncomeTax({
      grossAnnualIncome: 775000,
      taxRegime: 'new',
      isSalaried: true,
    });
    // Gross: 7,75,000 - 75,000 standard deduction = 7,00,000 taxable.
    // Taxable <= 7,00,000 gets 100% Section 87A rebate -> Tax Liability = 0
    expect(result.netTaxableIncome).toBe(700000);
    expect(result.totalTaxLiability).toBe(0);
  });

  it('calculates correct tax above 7.75L under New Regime', () => {
    const result = calculateIndiaIncomeTax({
      grossAnnualIncome: 1075000,
      taxRegime: 'new',
      isSalaried: true,
    });
    // Gross: 10,75,000 - 75,000 std ded = 10,00,000 taxable.
    // 0-3L: 0
    // 3L-7L (4L @ 5%): 20,000
    // 7L-10L (3L @ 10%): 30,000
    // Total slab tax = 50,000
    // 4% cess = 2,000
    // Total tax = 52,000
    expect(result.netTaxableIncome).toBe(1000000);
    expect(result.slabTaxBeforeRebate).toBe(50000);
    expect(result.totalTaxLiability).toBe(52000);
  });
});

describe('CTC to In-Hand Engine', () => {
  it('calculates deductions and in-hand pay accurately', () => {
    const result = calculateCtcToInHand({
      annualCtc: 1200000, // 12 LPA
      basicSalaryPercentage: 40, // Basic = 4.8 LPA
      includeEmployerPf: true,
      includeGratuity: true,
      taxRegime: 'new',
    });
    expect(result.annualCtc).toBe(1200000);
    expect(result.netInHandMonthly).toBeGreaterThan(0);
    expect(result.components.length).toBeGreaterThan(0);
  });
});

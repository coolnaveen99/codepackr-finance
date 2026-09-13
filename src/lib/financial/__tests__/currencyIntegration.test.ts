import { describe, it, expect } from 'vitest';
import { CURRENCIES, getCurrency, formatCurrencyAmount } from '../../currency';
import { calculateLoanEmi } from '../loanEmi';
import { calculateSip } from '../sip';
import { calculateCompoundInterest } from '../compoundInterest';
import { calculateIndiaIncomeTax } from '../incomeTax';
import { calculateGratuity } from '../gratuity';
import { calculateSalaryHike } from '../salaryHike';
import { calculateSimpleInterest } from '../simpleInterest';

describe('Currency & Input Valuation Integrity Tests', () => {
  it('treats 10,000 in INR strictly as 10,000 face value without foreign exchange scaling', () => {
    const inr = getCurrency('INR');
    expect(inr.symbol).toBe('₹');
    expect(inr.code).toBe('INR');

    // 10,000 entered by user must format to ₹10,000.00 or ₹10,000
    const formattedWithDecimals = formatCurrencyAmount(10000, inr, { decimals: 2 });
    expect(formattedWithDecimals).toBe('₹10,000.00');

    const formattedNoDecimals = formatCurrencyAmount(10000, inr, { decimals: 0 });
    expect(formattedNoDecimals).toBe('₹10,000');

    // Must NEVER multiply by 83.5 (the old bug would have yielded ₹835,000)
    expect(formattedWithDecimals).not.toContain('835');
    expect(formattedNoDecimals).not.toContain('835');
  });

  it('correctly uses Indian Lakhs and Crores grouping (en-IN) for INR', () => {
    const inr = getCurrency('INR');

    // 1 Lakh = 100,000 -> 1,00,000
    expect(formatCurrencyAmount(100000, inr, { decimals: 0 })).toBe('₹1,00,000');

    // 10 Lakhs = 1,000,000 -> 10,00,000
    expect(formatCurrencyAmount(1000000, inr, { decimals: 0 })).toBe('₹10,00,000');

    // 1 Crore = 10,000,000 -> 1,00,00,000
    expect(formatCurrencyAmount(10000000, inr, { decimals: 0 })).toBe('₹1,00,00,000');
  });

  it('formats USD, EUR, GBP, JPY accurately without cross-conversion', () => {
    const usd = getCurrency('USD');
    const eur = getCurrency('EUR');
    const gbp = getCurrency('GBP');
    const jpy = getCurrency('JPY');

    expect(formatCurrencyAmount(10000, usd, { decimals: 2 })).toBe('$10,000.00');
    expect(formatCurrencyAmount(10000, eur, { decimals: 2 })).toBe('€10,000.00');
    expect(formatCurrencyAmount(10000, gbp, { decimals: 2 })).toBe('£10,000.00');
    expect(formatCurrencyAmount(10000, jpy, { decimals: 0 })).toBe('¥10,000');
  });

  it('calculates Loan EMI directly on entered amount (e.g. ₹10,000)', () => {
    const inr = getCurrency('INR');
    const emiResult = calculateLoanEmi({
      principal: 10000,
      annualInterestRate: 8.5,
      tenureMonths: 12,
    });

    // For ₹10,000 principal at 8.5% for 12 months:
    // Monthly rate = 0.085 / 12 = 0.0070833
    // EMI is around 872.20
    expect(emiResult.monthlyEmi).toBeGreaterThan(850);
    expect(emiResult.monthlyEmi).toBeLessThan(900);
    expect(emiResult.totalPayment).toBeGreaterThan(10000);
    expect(emiResult.totalPayment).toBeLessThan(11000);

    // Formatted EMI should be approx ₹872.20
    const formattedEmi = formatCurrencyAmount(emiResult.monthlyEmi, inr, { decimals: 2 });
    expect(formattedEmi).toBe(`₹${emiResult.monthlyEmi.toFixed(2)}`);
  });

  it('calculates SIP investment returns directly on ₹10,000 monthly contribution', () => {
    const inr = getCurrency('INR');
    const sipResult = calculateSip({
      monthlyInvestment: 10000,
      expectedAnnualReturnRate: 12,
      tenureYears: 1,
    });

    // In 1 year (12 months), total invested is exactly 120,000
    expect(sipResult.totalInvested).toBe(120000);
    expect(sipResult.maturityValue).toBeGreaterThan(120000);
    expect(sipResult.maturityValue).toBeLessThan(135000);

    const formattedInvested = formatCurrencyAmount(sipResult.totalInvested, inr, { decimals: 0 });
    expect(formattedInvested).toBe('₹1,20,000');
  });

  it('calculates Income Tax in India slabs accurately without USD scaling', () => {
    // If a user enters ₹10,000 annual income, tax must be ₹0 because of basic exemption & standard deduction
    const lowIncomeTax = calculateIndiaIncomeTax({
      grossAnnualIncome: 10000,
      taxRegime: 'new',
      isSalaried: true,
    });
    expect(lowIncomeTax.totalTaxLiability).toBe(0);
    expect(lowIncomeTax.netTaxableIncome).toBe(0);

    // If user enters standard ₹12,00,000 salary under New Regime:
    // Standard deduction = 75,000 -> Taxable = 11,25,000
    // Slabs:
    // 0 - 3L: 0
    // 3L - 7L: 5% of 4L = 20,000
    // 7L - 10L: 10% of 3L = 30,000
    // 10L - 11.25L: 15% of 1.25L = 18,750
    // Total slab tax = 68,750 + 4% cess (2,750) = 71,500
    const regularIncomeTax = calculateIndiaIncomeTax({
      grossAnnualIncome: 1200000,
      taxRegime: 'new',
      isSalaried: true,
    });
    expect(regularIncomeTax.standardDeduction).toBe(75000);
    expect(regularIncomeTax.netTaxableIncome).toBe(1125000);
    expect(regularIncomeTax.totalTaxLiability).toBe(71500);
  });

  it('calculates Gratuity accurately for ₹10,000 salary', () => {
    // Formula: 15 * last_drawn_salary * tenure_years / 26
    // For 10,000 and 5 years: 15 * 10,000 * 5 / 26 = 28,846.15
    const gratuityResult = calculateGratuity({
      monthlyBasicPlusDa: 10000,
      completedYearsOfService: 5,
      isCoveredUnderAct: true,
    });
    expect(Math.round(gratuityResult.totalGratuityCalculated)).toBe(28846);
  });

  it('calculates Simple Interest accurately for ₹10,000 principal', () => {
    // 10,000 principal at 10% for 2 years: Interest = 2,000, Total = 12,000
    const siResult = calculateSimpleInterest({
      principal: 10000,
      annualRatePercent: 10,
      years: 2,
    });
    expect(siResult.totalInterest).toBe(2000);
    expect(siResult.maturityAmount).toBe(12000);
  });

  it('calculates Compound Interest accurately for ₹10,000 initial balance', () => {
    const ciResult = calculateCompoundInterest({
      initialPrincipal: 10000,
      annualInterestRate: 10,
      tenureYears: 1,
      compoundingFrequency: 1, // Annual
      periodicDeposit: 0,
    });
    expect(ciResult.maturityBalance).toBe(11000);
    expect(ciResult.totalInterestEarned).toBe(1000);
  });

  it('calculates Salary Hike accurately for ₹10,000 monthly salary', () => {
    const hikeResult = calculateSalaryHike({
      currentSalary: 10000,
      salaryPeriod: 'monthly',
      hikeType: 'percentage',
      hikePercentage: 20,
    });
    expect(hikeResult.newMonthlySalary).toBe(12000);
    expect(hikeResult.absoluteMonthlyHike).toBe(2000);
    expect(hikeResult.currentAnnualSalary).toBe(120000);
    expect(hikeResult.newAnnualSalary).toBe(144000);
  });

  it('verifies all 30+ supported currencies have valid non-zero codes and symbols', () => {
    expect(CURRENCIES.length).toBeGreaterThanOrEqual(30);
    CURRENCIES.forEach((c) => {
      expect(c.code).toBeTruthy();
      expect(c.symbol).toBeTruthy();
      // Format 10,000 with each currency and ensure no NaN or undefined occurs
      const formatted = formatCurrencyAmount(10000, c);
      expect(formatted).not.toContain('NaN');
      expect(formatted).not.toContain('undefined');
      expect(formatted).toContain(c.symbol.trim());
    });
  });
});

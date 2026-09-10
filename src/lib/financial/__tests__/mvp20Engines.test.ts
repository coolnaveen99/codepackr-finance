import { describe, it, expect } from 'vitest';
import { calculateDebtToIncome } from '../debtToIncome';
import { calculateLoanPrepayment } from '../loanPrepayment';
import { calculateLoanAmortization } from '../loanAmortization';
import { calculateLumpsum } from '../lumpsum';
import { calculateFutureValue } from '../futureValue';
import { calculateSavingsGoal } from '../savingsGoal';
import { calculateSalaryHike } from '../salaryHike';
import { calculateGratuity } from '../gratuity';

describe('CodePackr Finance MVP 20 Engines', () => {
  describe('Debt-to-Income (DTI) Engine', () => {
    it('calculates DTI ratio accurately', () => {
      const res = calculateDebtToIncome({
        grossMonthlyIncome: 10000,
        monthlyMortgageRent: 2000,
        monthlyAutoLoan: 500,
        monthlyStudentLoan: 300,
        monthlyCreditCardMin: 200,
        monthlyPersonalLoanOther: 0,
      });

      expect(res.totalMonthlyDebt).toBe(3000);
      expect(res.frontEndDtiPercent).toBe(20);
      expect(res.backEndDtiPercent).toBe(30);
      expect(res.statusTier).toBe('healthy');
      expect(res.remainingDiscretionaryIncome).toBe(7000);
      expect(res.maxQualifiedDebt43).toBe(4300);
      expect(res.borrowingRoomRemaining).toBe(1300);
    });

    it('identifies critical debt distress above 50%', () => {
      const res = calculateDebtToIncome({
        grossMonthlyIncome: 5000,
        monthlyMortgageRent: 2000,
        monthlyAutoLoan: 800,
        monthlyStudentLoan: 0,
        monthlyCreditCardMin: 500,
        monthlyPersonalLoanOther: 0,
      });
      expect(res.backEndDtiPercent).toBe(66);
      expect(res.statusTier).toBe('critical');
    });
  });

  describe('Loan Prepayment Engine', () => {
    it('calculates interest savings and tenor reduction', () => {
      const res = calculateLoanPrepayment({
        loanAmount: 100000,
        annualInterestRate: 6,
        loanTenureYears: 15,
        monthlyExtraPayment: 200,
      });

      expect(res.regularEmi).toBeGreaterThan(800);
      expect(res.acceleratedMonths).toBeLessThan(res.baselineMonths);
      expect(res.monthsSaved).toBeGreaterThan(30);
      expect(res.totalInterestSaved).toBeGreaterThan(5000);
    });
  });

  describe('Loan Amortization Engine', () => {
    it('generates consistent monthly and yearly reducing schedules', () => {
      const res = calculateLoanAmortization({
        loanAmount: 120000,
        annualInterestRate: 6,
        loanTenureYears: 10,
      });

      expect(res.totalMonths).toBe(120);
      expect(res.monthlySchedule.length).toBe(120);
      expect(res.yearlySchedule.length).toBe(10);
      expect(res.monthlySchedule[119].endingBalance).toBe(0);
      expect(res.yearlySchedule[9].endingBalance).toBe(0);
    });
  });

  describe('Lumpsum Investment Engine', () => {
    it('calculates compound growth and wealth multiple', () => {
      const res = calculateLumpsum({
        totalInvestment: 100000,
        expectedAnnualReturnRate: 10,
        timeHorizonYears: 10,
      });

      // FV = 100,000 * (1.10)^10 = ~259,374
      expect(res.totalMaturityValue).toBeCloseTo(259374.25, -1);
      expect(res.wealthMultiple).toBeCloseTo(2.59, 1);
      expect(res.yearlyBreakdown.length).toBe(10);
    });
  });

  describe('Future Value Engine', () => {
    it('computes future value with periodic deposits', () => {
      const res = calculateFutureValue({
        presentValue: 10000,
        periodicDeposit: 500,
        depositFrequency: 'monthly',
        annualInterestRate: 8,
        compoundingFrequency: 'monthly',
        timeHorizonYears: 5,
        depositTiming: 'end',
      });

      expect(res.futureValue).toBeGreaterThan(45000);
      expect(res.totalPrincipalContributed).toBe(10000 + 500 * 60);
      expect(res.yearlySchedule.length).toBe(5);
    });
  });

  describe('Savings Goal Engine', () => {
    it('determines required monthly savings to achieve target corpus', () => {
      const res = calculateSavingsGoal({
        targetGoalAmount: 60000,
        initialSavings: 0,
        timeHorizonYears: 5,
        expectedAnnualReturnRate: 0, // No return for simple math check
      });

      expect(res.requiredMonthlySavings).toBe(1000);
      expect(res.totalSelfContributed).toBe(60000);
      expect(res.milestones.length).toBe(4);
    });
  });

  describe('Salary Hike Engine', () => {
    it('computes percentage hike and real inflation-adjusted hike', () => {
      const res = calculateSalaryHike({
        currentSalary: 100000,
        salaryPeriod: 'annual',
        hikeType: 'percentage',
        hikePercentage: 20,
        inflationRate: 5,
      });

      expect(res.newAnnualSalary).toBe(120000);
      expect(res.absoluteAnnualHike).toBe(20000);
      expect(res.absoluteMonthlyHike).toBeCloseTo(1666.67, 1);
      // Real hike: (1.20 / 1.05 - 1) * 100 = ~14.29%
      expect(res.realHikePercentage).toBeCloseTo(14.29, 1);
      expect(res.hikeTier).toBe('high');
    });
  });

  describe('Gratuity Engine', () => {
    it('calculates gratuity for employees covered under Payment of Gratuity Act 1972', () => {
      const res = calculateGratuity({
        monthlyBasicPlusDa: 52000,
        completedYearsOfService: 10,
        additionalMonths: 7, // > 6 months -> rounds to 11 years
        isCoveredUnderAct: true,
      });

      // Gratuity = (15 * 52000 * 11) / 26 = 330,000
      expect(res.tenureYearsCalculated).toBe(11);
      expect(res.totalGratuityCalculated).toBe(330000);
      expect(res.isEligibleForGratuity).toBe(true);
      expect(res.taxExemptGratuity).toBe(330000);
      expect(res.taxableGratuity).toBe(0);
    });

    it('enforces statutory ₹20 Lakh exemption ceiling', () => {
      const res = calculateGratuity({
        monthlyBasicPlusDa: 260000,
        completedYearsOfService: 20,
        additionalMonths: 0,
        isCoveredUnderAct: true,
      });

      // Gratuity = (15 * 260000 * 20) / 26 = 3,000,000
      expect(res.totalGratuityCalculated).toBe(3000000);
      expect(res.taxExemptGratuity).toBe(2000000);
      expect(res.taxableGratuity).toBe(1000000);
    });
  });
});

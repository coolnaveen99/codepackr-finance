/**
 * Employees' Provident Fund (EPF / PPF) Retirement Accumulation Engine
 * - Employee Contribution: 12% of (Basic + DA)
 * - Employer Contribution: 3.67% to EPF (8.33% goes to EPS pension subject to statutory wage ceiling)
 * - Annual interest credited (e.g. 8.25% p.a. compounded annually)
 */

export interface EpfInputs {
  currentAge: number;
  retirementAge: number;
  monthlyBasicSalary?: number;
  currentBasicSalary?: number;
  annualSalaryHikePercent?: number;
  annualSalaryIncrement?: number;
  currentEpfBalance: number;
  interestRate: number;
  employeeContributionPercent?: number;
  employerContributionPercent?: number;
}

export interface EpfYearRecord {
  year: number;
  age: number;
  salary: number;
  monthlyBasic: number;
  openingBalance: number;
  employeeDeposit: number;
  employerDeposit: number;
  employeeAnnualContribution: number;
  employerAnnualContribution: number;
  interestEarned: number;
  closingBalance: number;
}

export interface EpfResult {
  maturityCorpus: number;
  finalMaturityAmount: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalInterestEarned: number;
  yearsOfAccumulation: number;
  yearsOfService: number;
  schedule: EpfYearRecord[];
}

export function calculateEpf(inputs: EpfInputs): EpfResult {
  const currentAge = inputs.currentAge;
  const retirementAge = inputs.retirementAge;
  const currentBasicSalary = Math.max(0, inputs.monthlyBasicSalary ?? inputs.currentBasicSalary ?? 0);
  const annualSalaryIncrement = (inputs.annualSalaryHikePercent ?? inputs.annualSalaryIncrement ?? 0) / 100;
  const currentEpfBalance = Math.max(0, inputs.currentEpfBalance);
  const interestRate = Math.max(0, inputs.interestRate) / 100;
  const employeeContribPct = (inputs.employeeContributionPercent ?? 12) / 100;
  const employerContribPct = (inputs.employerContributionPercent ?? 3.67) / 100;

  const yearsOfAccumulation = Math.max(1, retirementAge - currentAge);
  const schedule: EpfYearRecord[] = [];

  let balance = currentEpfBalance;
  let basic = currentBasicSalary;
  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalInterest = 0;

  for (let yr = 1; yr <= yearsOfAccumulation; yr++) {
    const openingBalance = balance;
    const annualEmployee = basic * 12 * employeeContribPct;
    const annualEmployer = basic * 12 * employerContribPct;
    const totalDeposits = annualEmployee + annualEmployer;

    // Monthly compound simulation approximation for EPF:
    // Interest is computed on monthly running balance and credited at year end
    // Average balance during the year = opening + (deposits / 2)
    const yearInterest = (openingBalance + totalDeposits / 2) * interestRate;

    balance = openingBalance + totalDeposits + yearInterest;
    totalEmployee += annualEmployee;
    totalEmployer += annualEmployer;
    totalInterest += yearInterest;

    schedule.push({
      year: yr,
      age: currentAge + yr,
      salary: Math.round(basic),
      monthlyBasic: Math.round(basic),
      openingBalance: Math.round(openingBalance),
      employeeDeposit: Math.round(annualEmployee),
      employerDeposit: Math.round(annualEmployer),
      employeeAnnualContribution: Math.round(annualEmployee),
      employerAnnualContribution: Math.round(annualEmployer),
      interestEarned: Math.round(yearInterest),
      closingBalance: Math.round(balance),
    });

    basic *= 1 + annualSalaryIncrement;
  }

  const maturityCorpus = Math.round(balance);

  return {
    maturityCorpus,
    finalMaturityAmount: maturityCorpus,
    totalEmployeeContribution: Math.round(totalEmployee),
    totalEmployerContribution: Math.round(totalEmployer),
    totalInterestEarned: Math.round(totalInterest),
    yearsOfAccumulation,
    yearsOfService: yearsOfAccumulation,
    schedule,
  };
}

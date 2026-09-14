/**
 * Savings Goal Projector & Comparison Engine
 * 
 * Computes exact required monthly contribution (PMT) to reach a target savings goal,
 * solving the Future Value of Annuity formula:
 *   PMT = (Goal - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
 * 
 * Also models:
 * - 6 distinct savings & investment vehicles with default Indian rates
 * - Pre-tax vs Post-tax net yield modeling (with Equity taxation advantage for Arbitrage)
 * - Capacity analysis (surplus / shortfall / extra months required)
 * - Month-by-month accumulation schedule
 */

export interface SavingsVehicleOption {
  id: string;
  name: string;
  shortName: string;
  category: 'bank' | 'deposit' | 'debt-fund' | 'arbitrage';
  riskLabel: string;
  liquidityLabel: string;
  riskBadgeColor: string; // Tailwind color styling classes
  liquidityBadgeColor: string;
  defaultAnnualRate: number; // in percent (e.g. 3.5, 6.5)
  taxTreatment: 'slab' | 'equity';
  description: string;
  idealHorizon: string;
  pros: string[];
  cons: string[];
}

export const SAVINGS_VEHICLES: SavingsVehicleOption[] = [
  {
    id: 'savings-account',
    name: 'Savings Account',
    shortName: 'Savings A/c',
    category: 'bank',
    riskLabel: 'Zero Risk',
    liquidityLabel: 'Instant (24x7)',
    riskBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    liquidityBadgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    defaultAnnualRate: 3.5,
    taxTreatment: 'slab',
    description: 'Guaranteed capital security with sovereign insurance up to ₹5 Lakh (DICGC). Lowest returns.',
    idealHorizon: 'Immediate / < 1 Month',
    pros: ['Immediate UPI & ATM access', 'Zero volatility or credit risk', 'Up to ₹10,000 interest deduction u/s 80TTA'],
    cons: ['Yield trails inflation', 'Interest fully taxed at slab above ₹10k'],
  },
  {
    id: 'recurring-deposit',
    name: 'Recurring Deposit (RD)',
    shortName: 'Bank RD',
    category: 'deposit',
    riskLabel: 'Zero Risk',
    liquidityLabel: 'Moderate (Tenure Locked)',
    riskBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    liquidityBadgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    defaultAnnualRate: 6.5,
    taxTreatment: 'slab',
    description: 'Disciplined monthly automated deduction with locked-in guaranteed interest from scheduled commercial banks.',
    idealHorizon: '6 Months to 3 Years',
    pros: ['Fixed guaranteed return', 'Enforces strict monthly savings habit', 'DICGC insurance backed'],
    cons: ['Premature break penalty (0.5%–1.0%)', 'TDS deduction & fully taxed at slab rate'],
  },
  {
    id: 'fixed-deposit',
    name: 'Fixed Deposit (FD)',
    shortName: 'Bank FD',
    category: 'deposit',
    riskLabel: 'Zero Risk',
    liquidityLabel: 'Moderate (Term Locked)',
    riskBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    liquidityBadgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    defaultAnnualRate: 6.5,
    taxTreatment: 'slab',
    description: 'Lump-sum or laddered term deposit offering predictable interest rates across major public & private banks.',
    idealHorizon: '6 Months to 5 Years',
    pros: ['Guaranteed maturity sum', 'Senior citizens get 0.50% extra', 'No market exposure'],
    cons: ['Fixed sum required upfront or in tranches', 'Taxed annually on accrual basis at slab'],
  },
  {
    id: 'liquid-fund',
    name: 'Liquid Fund (SIP)',
    shortName: 'Liquid Fund',
    category: 'debt-fund',
    riskLabel: 'Very Low Risk',
    liquidityLabel: 'High (T+1 / Insta ₹50k)',
    riskBadgeColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    liquidityBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    defaultAnnualRate: 6.8,
    taxTreatment: 'slab',
    description: 'Invests strictly in money market securities & treasury bills with maturity ≤91 days. High safety and liquidity.',
    idealHorizon: '1 to 6 Months',
    pros: ['Instant redemption up to ₹50,000 per fund', 'Superior yield to savings accounts', 'Minimal interest rate sensitivity'],
    cons: ['Not bank guaranteed', 'Post-April 2023 gains taxed at investor slab rate'],
  },
  {
    id: 'ultra-short-fund',
    name: 'Ultra-Short Duration Fund',
    shortName: 'Ultra-Short Fund',
    category: 'debt-fund',
    riskLabel: 'Low Risk',
    liquidityLabel: 'High (T+1 Working Day)',
    riskBadgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    liquidityBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    defaultAnnualRate: 7.2,
    taxTreatment: 'slab',
    description: 'Invests in commercial papers and corporate certificates of deposit with Macaulay duration between 3 to 6 months.',
    idealHorizon: '3 to 12 Months',
    pros: ['Highest yield among short debt funds', 'High liquidity with low exit load', 'Predictable returns in stable rate regimes'],
    cons: ['Slight mark-to-market bond fluctuations', 'Taxed at marginal slab rate'],
  },
  {
    id: 'arbitrage-fund',
    name: 'Arbitrage Fund',
    shortName: 'Arbitrage Fund',
    category: 'arbitrage',
    riskLabel: 'Low Risk',
    liquidityLabel: 'High (T+1 Working Day)',
    riskBadgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    liquidityBadgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    defaultAnnualRate: 7.0,
    taxTreatment: 'equity',
    description: 'Captures mispricing between cash and futures equity markets. Hedged positions with pure equity taxation advantage!',
    idealHorizon: '3 Months to 1 Year+',
    pros: ['Taxed as Equity: only 20% STCG (<1yr) vs 30%+ slab rate', 'No directional equity exposure', 'Best post-tax yield for 20% & 30% tax brackets'],
    cons: ['Spreads narrow in quiet sideways markets', 'Small exit load during initial 15–30 days'],
  },
];

export interface ProjectorInputs {
  targetGoalAmount: number; // e.g. 100000
  timeHorizonMonths: number; // e.g. 6
  alreadySaved: number; // e.g. 0
  monthlyCapacity?: number; // e.g. 15000 (optional)
  showPostTax: boolean; // toggle
  taxSlabPercent: number; // e.g. 0, 5, 10, 15, 20, 30
  customRates?: Record<string, number>; // user customized annual returns
}

export interface MonthScheduleEntry {
  month: number;
  openingBalance: number;
  deposit: number;
  interestEarned: number;
  cumulativeInterest: number;
  closingBalance: number;
  percentOfGoal: number;
}

export interface OptionPlanResult {
  vehicle: SavingsVehicleOption;
  annualRatePreTax: number;
  effectiveAnnualRate: number;
  isPostTaxApplied: boolean;
  effectiveTaxRateApplied: number;
  monthlyRate: number;
  requiredMonthlyPMT: number;
  totalMonthlyContributed: number;
  totalContributedIncludingSeed: number;
  interestEarned: number;
  projectedFinalAmount: number;
  interestSharePercent: number;
  // Monthly Capacity Feasibility
  capacityAnalysis?: {
    userCapacity: number;
    differencePerMonth: number; // capacity - requiredPMT (>0 surplus, <0 shortfall)
    status: 'comfortable' | 'tight' | 'difficult';
    statusLabel: string;
    extraMonthsNeededAtCapacity: number;
    totalMonthsAtCapacity: number;
    projectedAmountAtGivenCapacity: number;
  };
  schedule: MonthScheduleEntry[];
}

export interface ProjectorOutput {
  targetGoalAmount: number;
  timeHorizonMonths: number;
  alreadySaved: number;
  monthlyCapacity?: number;
  showPostTax: boolean;
  taxSlabPercent: number;
  plans: OptionPlanResult[];
}

/**
 * Calculates PMT (required monthly savings) to hit a future goal:
 * PMT = (Goal - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
 */
export function calculateRequiredPMT(
  goal: number,
  pv: number,
  annualRatePercent: number,
  months: number
): number {
  if (months <= 0) return Math.max(0, goal - pv);
  const r = annualRatePercent / 100 / 12;
  const fvPV = pv * Math.pow(1 + r, months);
  const remainingGoal = goal - fvPV;

  if (remainingGoal <= 0) {
    return 0; // Already saved is already enough with growth!
  }

  if (r === 0) {
    return remainingGoal / months;
  }

  const annuityFactor = (Math.pow(1 + r, months) - 1) / r;
  return remainingGoal / annuityFactor;
}

/**
 * Calculates number of months needed to reach a target goal given a fixed monthly deposit C:
 * Goal = PV * (1 + r)^n + C * ((1 + r)^n - 1) / r
 */
export function calculateMonthsToReachGoal(
  goal: number,
  pv: number,
  monthlyDeposit: number,
  annualRatePercent: number
): number {
  if (pv >= goal) return 0;
  if (monthlyDeposit <= 0) return Infinity;

  const r = annualRatePercent / 100 / 12;

  if (r === 0) {
    return Math.ceil((goal - pv) / monthlyDeposit);
  }

  const numerator = goal * r + monthlyDeposit;
  const denominator = pv * r + monthlyDeposit;

  if (denominator <= 0 || numerator <= 0) return Infinity;

  const n = Math.log(numerator / denominator) / Math.log(1 + r);
  return Math.max(0, Math.ceil(n));
}

/**
 * Generates month-by-month cashflow and compound growth schedule
 */
export function generateMonthSchedule(
  pv: number,
  pmt: number,
  monthlyRate: number,
  months: number,
  goal: number
): MonthScheduleEntry[] {
  const schedule: MonthScheduleEntry[] = [];
  let currentBalance = pv;
  let cumulativeInterest = 0;

  for (let m = 1; m <= months; m++) {
    const opening = currentBalance;
    // Ordinary annuity: interest on opening capital accumulated to date, deposit added during period
    const interest = opening * monthlyRate;
    const deposit = pmt;
    cumulativeInterest += interest;
    currentBalance = opening + deposit + interest;

    const percentOfGoal = goal > 0 ? Math.min(100, (currentBalance / goal) * 100) : 100;

    schedule.push({
      month: m,
      openingBalance: Math.round(opening * 100) / 100,
      deposit: Math.round(deposit * 100) / 100,
      interestEarned: Math.round(interest * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
      closingBalance: Math.round(currentBalance * 100) / 100,
      percentOfGoal: Math.round(percentOfGoal * 10) / 10,
    });
  }

  return schedule;
}

/**
 * Main Projection Engine: Evaluates all 6 options under user constraints
 */
export function projectSavingsGoal(inputs: ProjectorInputs): ProjectorOutput {
  const goal = Math.max(1, inputs.targetGoalAmount);
  const months = Math.max(1, Math.round(inputs.timeHorizonMonths));
  const pv = Math.max(0, inputs.alreadySaved || 0);
  const capacity = inputs.monthlyCapacity !== undefined && inputs.monthlyCapacity > 0
    ? inputs.monthlyCapacity
    : undefined;
  const showPostTax = !!inputs.showPostTax;
  const taxSlab = Math.max(0, Math.min(45, inputs.taxSlabPercent || 0));

  const plans: OptionPlanResult[] = SAVINGS_VEHICLES.map((vehicle) => {
    const preTaxRate = inputs.customRates && inputs.customRates[vehicle.id] !== undefined
      ? inputs.customRates[vehicle.id]
      : vehicle.defaultAnnualRate;

    // Determine post-tax rate
    let effectiveTaxRate = 0;
    if (showPostTax) {
      if (vehicle.taxTreatment === 'equity') {
        // Arbitrage Fund: Under Indian IT Act, taxed as Equity Fund.
        // If horizon <= 12 months: STCG is 20% (Budget 2024 update).
        // If tax slab is 0% or 10%, investor tax rate is min(taxSlab, 20%).
        // If horizon > 12 months: LTCG is 12.5% (above 1.25L exemption).
        effectiveTaxRate = months <= 12 ? Math.min(taxSlab, 20) : Math.min(taxSlab, 12.5);
      } else {
        // Bank interest / Debt funds: taxed at slab rate
        effectiveTaxRate = taxSlab;
      }
    }

    const effectiveAnnualRate = showPostTax
      ? Math.max(0, preTaxRate * (1 - effectiveTaxRate / 100))
      : preTaxRate;

    const monthlyRate = effectiveAnnualRate / 100 / 12;

    const requiredPMT = calculateRequiredPMT(goal, pv, effectiveAnnualRate, months);
    const totalMonthlyContributed = requiredPMT * months;
    const totalContributedIncludingSeed = pv + totalMonthlyContributed;
    const interestEarned = Math.max(0, goal - totalContributedIncludingSeed);
    const projectedFinalAmount = goal;
    const interestSharePercent = goal > 0 ? (interestEarned / goal) * 100 : 0;

    // Capacity Feasibility Modeling
    let capacityAnalysis: OptionPlanResult['capacityAnalysis'] = undefined;
    if (capacity !== undefined) {
      const diff = capacity - requiredPMT;
      let status: 'comfortable' | 'tight' | 'difficult' = 'comfortable';
      let statusLabel = 'Comfortable · Surplus Capacity';

      if (diff >= 0) {
        status = 'comfortable';
        statusLabel = 'Comfortable · Fully Achievable';
      } else if (capacity >= 0.85 * requiredPMT) {
        status = 'tight';
        statusLabel = 'Tight · Minor Stretch Required';
      } else {
        status = 'difficult';
        statusLabel = 'Difficult · Plan Restructuring Advised';
      }

      const totalMonthsAtCapacity = calculateMonthsToReachGoal(goal, pv, capacity, effectiveAnnualRate);
      const extraMonthsNeededAtCapacity = Math.max(0, totalMonthsAtCapacity - months);

      // Future value if user strictly deposits capacity for the requested months
      let projectedAtCapacity = 0;
      if (monthlyRate === 0) {
        projectedAtCapacity = pv + capacity * months;
      } else {
        projectedAtCapacity = pv * Math.pow(1 + monthlyRate, months) +
          capacity * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      }

      capacityAnalysis = {
        userCapacity: capacity,
        differencePerMonth: Math.round(diff * 100) / 100,
        status,
        statusLabel,
        extraMonthsNeededAtCapacity,
        totalMonthsAtCapacity: isFinite(totalMonthsAtCapacity) ? totalMonthsAtCapacity : months,
        projectedAmountAtGivenCapacity: Math.round(projectedAtCapacity * 100) / 100,
      };
    }

    const schedule = generateMonthSchedule(pv, requiredPMT, monthlyRate, months, goal);

    return {
      vehicle,
      annualRatePreTax: preTaxRate,
      effectiveAnnualRate: Math.round(effectiveAnnualRate * 100) / 100,
      isPostTaxApplied: showPostTax,
      effectiveTaxRateApplied: effectiveTaxRate,
      monthlyRate,
      requiredMonthlyPMT: Math.round(requiredPMT * 100) / 100,
      totalMonthlyContributed: Math.round(totalMonthlyContributed * 100) / 100,
      totalContributedIncludingSeed: Math.round(totalContributedIncludingSeed * 100) / 100,
      interestEarned: Math.round(interestEarned * 100) / 100,
      projectedFinalAmount: Math.round(projectedFinalAmount * 100) / 100,
      interestSharePercent: Math.round(interestSharePercent * 10) / 10,
      capacityAnalysis,
      schedule,
    };
  });

  return {
    targetGoalAmount: goal,
    timeHorizonMonths: months,
    alreadySaved: pv,
    monthlyCapacity: capacity,
    showPostTax,
    taxSlabPercent: taxSlab,
    plans,
  };
}

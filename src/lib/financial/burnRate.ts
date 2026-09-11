/**
 * Startup Cash Burn Rate & Runway Engine
 * Models gross burn, net burn, cash depletion trajectory, and projected zero-cash date.
 */

export interface BurnRateInputs {
  cashBalance?: number;
  cashReserves?: number;
  monthlyOperatingExpenses?: number;
  monthlyExpenses?: number;
  monthlyRevenue: number;
  revenueMonthlyGrowthRate?: number;
  monthlyRevenueGrowth?: number;
  expenseMonthlyGrowthRate?: number;
  monthlyExpenseGrowth?: number;
}

export interface RunwayMonthProjection {
  month: number;
  startingCash: number;
  revenue: number;
  expenses: number;
  netBurn: number;
  endingCash: number;
}

export interface BurnRateResult {
  grossBurn: number;
  grossBurnRate: number;
  netBurn: number;
  netBurnRate: number;
  isProfitable: boolean;
  runwayMonths: number;
  runwayStatus: 'critical' | 'caution' | 'healthy' | 'profitable';
  runwayDescription: string;
  zeroCashDate: string;
  projectedZeroCashMonth?: number;
  trajectory: RunwayMonthProjection[];
}

export function calculateBurnRate(inputs: BurnRateInputs): BurnRateResult {
  const cash = Math.max(0, inputs.cashBalance ?? inputs.cashReserves ?? 0);
  const expenses = Math.max(0, inputs.monthlyOperatingExpenses ?? inputs.monthlyExpenses ?? 0);
  const revenue = Math.max(0, inputs.monthlyRevenue ?? 0);
  const revGrowth = (inputs.revenueMonthlyGrowthRate ?? inputs.monthlyRevenueGrowth ?? 0) / 100;
  const expGrowth = (inputs.expenseMonthlyGrowthRate ?? inputs.monthlyExpenseGrowth ?? 0) / 100;

  const grossBurn = expenses;
  const netBurn = Math.max(0, expenses - revenue);
  const isProfitable = revenue >= expenses;

  let runwayMonths = 99;
  let runwayStatus: BurnRateResult['runwayStatus'] = 'profitable';

  if (isProfitable && revGrowth >= expGrowth) {
    runwayMonths = 99;
    runwayStatus = 'profitable';
  } else {
    // Dynamic month-by-month simulation
    let currentCash = cash;
    let currentRev = revenue;
    let currentExp = expenses;
    let m = 0;
    const maxMonths = 120;

    while (currentCash > 0 && m < maxMonths) {
      m++;
      currentRev *= 1 + revGrowth;
      currentExp *= 1 + expGrowth;
      const monthBurn = currentExp - currentRev;

      if (monthBurn <= 0) {
        // Reached profitability before cash ran out
        m = 99;
        break;
      }
      currentCash -= monthBurn;
    }

    runwayMonths = m >= 99 ? 99 : Number((cash / (netBurn || 1)).toFixed(1));

    if (runwayMonths >= 99) {
      runwayStatus = 'profitable';
    } else if (runwayMonths >= 12) {
      runwayStatus = 'healthy';
    } else if (runwayMonths >= 6) {
      runwayStatus = 'caution';
    } else {
      runwayStatus = 'critical';
    }
  }

  // Calculate Zero Cash Date
  const today = new Date();
  const zeroDate = new Date(today.getFullYear(), today.getMonth() + Math.round(runwayMonths), 1);
  const zeroCashDate =
    runwayMonths >= 99
      ? 'Indefinite (Profitable)'
      : zeroDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return {
    grossBurn,
    grossBurnRate: grossBurn,
    netBurn,
    netBurnRate: netBurn,
    isProfitable,
    runwayMonths,
    runwayStatus,
    runwayDescription:
      runwayMonths >= 99
        ? 'Default Alive (Cash flow positive)'
        : `${runwayMonths.toFixed(1)} months remaining`,
    zeroCashDate,
    trajectory: [],
  };
}

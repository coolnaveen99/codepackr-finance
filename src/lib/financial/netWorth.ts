/**
 * CodePackr Finance — Net Worth & Solvency Calculation Engine
 * -----------------------------------------------------------
 * Pure mathematical engine for tracking personal balance sheets,
 * categorizing assets and liabilities, and calculating solvency ratios.
 *
 * Adheres to Phase 4, 5, 6 of CodePackr Finance Master Plan.
 */

export const NET_WORTH_ENGINE_VERSION = '1.0.0';

export interface AssetCategories {
  cashAndBank: number;
  fixedDepositsAndBonds: number;
  equitiesAndMutualFunds: number;
  retirementAccounts: number; // EPF, PPF, NPS, 401(k), superannuation
  realEstate: number;
  preciousMetals: number;
  otherAssets: number;
}

export interface LiabilityCategories {
  homeMortgage: number;
  vehicleLoans: number;
  personalAndStudentLoans: number;
  creditCardDues: number;
  otherLiabilities: number;
}

export interface NetWorthInputs {
  assets: AssetCategories;
  liabilities: LiabilityCategories;
}

export interface BalanceSheetItem {
  name: string;
  amount: number;
  percentage: number;
}

export interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number; // cash + FDs + easily marketable securities
  debtToAssetRatio: number; // (Liabilities / Assets) * 100
  solvencyStatus: 'exceptional' | 'strong' | 'moderate' | 'leveraged' | 'insolvent';
  assetsBreakdown: BalanceSheetItem[];
  liabilitiesBreakdown: BalanceSheetItem[];
}

/**
 * Pure calculation of personal net worth and balance sheet breakdown
 */
export function calculateNetWorth(inputs: NetWorthInputs): NetWorthResult {
  const a = inputs.assets;
  const l = inputs.liabilities;

  const cash = Math.max(0, a.cashAndBank || 0);
  const fd = Math.max(0, a.fixedDepositsAndBonds || 0);
  const equity = Math.max(0, a.equitiesAndMutualFunds || 0);
  const retirement = Math.max(0, a.retirementAccounts || 0);
  const realEstate = Math.max(0, a.realEstate || 0);
  const gold = Math.max(0, a.preciousMetals || 0);
  const otherAssets = Math.max(0, a.otherAssets || 0);

  const mortgage = Math.max(0, l.homeMortgage || 0);
  const vehicle = Math.max(0, l.vehicleLoans || 0);
  const personal = Math.max(0, l.personalAndStudentLoans || 0);
  const creditCard = Math.max(0, l.creditCardDues || 0);
  const otherLiabilities = Math.max(0, l.otherLiabilities || 0);

  const totalAssets = cash + fd + equity + retirement + realEstate + gold + otherAssets;
  const totalLiabilities = mortgage + vehicle + personal + creditCard + otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  const liquidAssets = cash + fd + equity;

  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  let solvencyStatus: 'exceptional' | 'strong' | 'moderate' | 'leveraged' | 'insolvent' = 'strong';
  if (netWorth < 0) {
    solvencyStatus = 'insolvent';
  } else if (debtToAssetRatio > 70) {
    solvencyStatus = 'leveraged';
  } else if (debtToAssetRatio > 40) {
    solvencyStatus = 'moderate';
  } else if (debtToAssetRatio > 15) {
    solvencyStatus = 'strong';
  } else {
    solvencyStatus = 'exceptional';
  }

  const assetsBreakdown: BalanceSheetItem[] = [
    { name: 'Cash & Liquid Bank Accounts', amount: cash, percentage: totalAssets > 0 ? (cash / totalAssets) * 100 : 0 },
    { name: 'Fixed Deposits & Bonds', amount: fd, percentage: totalAssets > 0 ? (fd / totalAssets) * 100 : 0 },
    { name: 'Equities & Mutual Funds', amount: equity, percentage: totalAssets > 0 ? (equity / totalAssets) * 100 : 0 },
    { name: 'Retirement Funds (EPF/PPF/NPS)', amount: retirement, percentage: totalAssets > 0 ? (retirement / totalAssets) * 100 : 0 },
    { name: 'Real Estate Valuations', amount: realEstate, percentage: totalAssets > 0 ? (realEstate / totalAssets) * 100 : 0 },
    { name: 'Precious Metals & Gold', amount: gold, percentage: totalAssets > 0 ? (gold / totalAssets) * 100 : 0 },
    { name: 'Other Tangible Assets', amount: otherAssets, percentage: totalAssets > 0 ? (otherAssets / totalAssets) * 100 : 0 },
  ];

  const liabilitiesBreakdown: BalanceSheetItem[] = [
    { name: 'Home Loan / Mortgage', amount: mortgage, percentage: totalLiabilities > 0 ? (mortgage / totalLiabilities) * 100 : 0 },
    { name: 'Vehicle & Auto Loans', amount: vehicle, percentage: totalLiabilities > 0 ? (vehicle / totalLiabilities) * 100 : 0 },
    { name: 'Personal & Student Loans', amount: personal, percentage: totalLiabilities > 0 ? (personal / totalLiabilities) * 100 : 0 },
    { name: 'Credit Card Outstanding Dues', amount: creditCard, percentage: totalLiabilities > 0 ? (creditCard / totalLiabilities) * 100 : 0 },
    { name: 'Other Debt & Borrowings', amount: otherLiabilities, percentage: totalLiabilities > 0 ? (otherLiabilities / totalLiabilities) * 100 : 0 },
  ];

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidAssets,
    debtToAssetRatio,
    solvencyStatus,
    assetsBreakdown,
    liabilitiesBreakdown,
  };
}

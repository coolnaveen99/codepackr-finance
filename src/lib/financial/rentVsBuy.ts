/**
 * Rent vs Buy Housing Decision Engine
 * Compares wealth accumulation over N years between:
 * 1. Buying a home (down payment, EMI, property tax, maintenance, home price appreciation)
 * 2. Renting (monthly rent, rent inflation, investing the down payment + monthly cash flow difference)
 */

export interface RentVsBuyInputs {
  homePrice: number;
  downPaymentPercent: number; // % (e.g. 20%)
  mortgageRate: number; // Loan interest rate (%)
  loanTenureYears: number; // Mortgage term (years)
  propertyAppreciationRate: number; // Annual appreciation (%)
  annualMaintenanceAndTaxRate: number; // % of home value annually (e.g. 1.5%)
  initialMonthlyRent: number; // Cost to rent equivalent home
  annualRentInflation: number; // Annual rent hike (%)
  investmentReturnRate: number; // Return on invested capital (%)
  horizonYears: number; // Comparison timeline (e.g. 10 or 15 years)
}

export interface RentVsBuyYearComparison {
  year: number;
  homeValue: number;
  remainingMortgage: number;
  buyerNetWealth: number; // Home Value - Remaining Loan
  annualBuyerCost: number; // EMI + maintenance/taxes
  annualRenterCost: number; // Rent paid
  renterInvestmentPortfolio: number;
  renterNetWealth: number;
  wealthAdvantage: 'buy' | 'rent';
  wealthDifference: number;
}

export interface RentVsBuyResult {
  buyerFinalNetWealth: number;
  renterFinalNetWealth: number;
  recommendation: 'buy' | 'rent' | 'neutral';
  breakevenYear?: number;
  netWealthDifference: number;
  cumulativeBuyerCost: number;
  cumulativeRenterCost: number;
  timeline: RentVsBuyYearComparison[];
}

export function calculateRentVsBuy(inputs: RentVsBuyInputs): RentVsBuyResult {
  const {
    homePrice,
    downPaymentPercent,
    mortgageRate,
    loanTenureYears,
    propertyAppreciationRate,
    annualMaintenanceAndTaxRate,
    initialMonthlyRent,
    annualRentInflation,
    investmentReturnRate,
    horizonYears,
  } = inputs;

  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanPrincipal = Math.max(0, homePrice - downPayment);
  const rMonth = Math.max(0.0001, mortgageRate / 100 / 12);
  const totalMonths = Math.max(1, loanTenureYears * 12);

  // Monthly EMI
  const factor = Math.pow(1 + rMonth, totalMonths);
  const monthlyEmi =
    loanPrincipal > 0 ? (loanPrincipal * rMonth * factor) / (factor - 1) : 0;
  const annualEmi = monthlyEmi * 12;

  let currentHomeValue = homePrice;
  let currentLoanBalance = loanPrincipal;
  let renterPortfolio = downPayment; // Renter invests the down payment cash
  let currentRent = initialMonthlyRent;

  let cumulativeBuyerCost = downPayment;
  let cumulativeRenterCost = 0;
  let breakevenYear: number | undefined = undefined;

  const timeline: RentVsBuyYearComparison[] = [];
  const compYears = Math.max(1, Math.min(30, Math.round(horizonYears)));

  for (let y = 1; y <= compYears; y++) {
    // 1. Home value appreciation
    currentHomeValue *= 1 + propertyAppreciationRate / 100;

    // 2. Mortgage amortization for the year
    const annualMaintTax = currentHomeValue * (annualMaintenanceAndTaxRate / 100);
    const annualBuyerCost = (y <= loanTenureYears ? annualEmi : 0) + annualMaintTax;
    cumulativeBuyerCost += annualBuyerCost;

    if (y <= loanTenureYears && currentLoanBalance > 0) {
      for (let m = 0; m < 12; m++) {
        const intMonth = currentLoanBalance * rMonth;
        const princMonth = Math.max(0, monthlyEmi - intMonth);
        currentLoanBalance = Math.max(0, currentLoanBalance - princMonth);
      }
    } else {
      currentLoanBalance = 0;
    }

    const buyerNetWealth = currentHomeValue - currentLoanBalance;

    // 3. Renter side
    const annualRenterCost = currentRent * 12;
    cumulativeRenterCost += annualRenterCost;
    currentRent *= 1 + annualRentInflation / 100;

    // Renter portfolio return
    renterPortfolio *= 1 + investmentReturnRate / 100;

    // If buyer spent more than renter, renter invests the difference; if renter spent more, portfolio pays
    const cashFlowDiff = annualBuyerCost - annualRenterCost;
    renterPortfolio += cashFlowDiff;
    if (renterPortfolio < 0) renterPortfolio = 0;

    const renterNetWealth = renterPortfolio;
    const diff = buyerNetWealth - renterNetWealth;
    const advantage: 'buy' | 'rent' = diff >= 0 ? 'buy' : 'rent';

    if (advantage === 'buy' && breakevenYear === undefined) {
      breakevenYear = y;
    }

    timeline.push({
      year: y,
      homeValue: currentHomeValue,
      remainingMortgage: currentLoanBalance,
      buyerNetWealth,
      annualBuyerCost,
      annualRenterCost,
      renterInvestmentPortfolio: renterPortfolio,
      renterNetWealth,
      wealthAdvantage: advantage,
      wealthDifference: Math.abs(diff),
    });
  }

  const finalBuyerWealth = timeline[timeline.length - 1].buyerNetWealth;
  const finalRenterWealth = timeline[timeline.length - 1].renterNetWealth;
  const netWealthDiff = Math.abs(finalBuyerWealth - finalRenterWealth);

  let recommendation: 'buy' | 'rent' | 'neutral' = 'neutral';
  if (finalBuyerWealth > finalRenterWealth * 1.05) {
    recommendation = 'buy';
  } else if (finalRenterWealth > finalBuyerWealth * 1.05) {
    recommendation = 'rent';
  }

  return {
    buyerFinalNetWealth: finalBuyerWealth,
    renterFinalNetWealth: finalRenterWealth,
    recommendation,
    breakevenYear,
    netWealthDifference: netWealthDiff,
    cumulativeBuyerCost,
    cumulativeRenterCost,
    timeline,
  };
}

/**
 * Dividend Yield & DRIP (Dividend Reinvestment Plan) Engine
 * Models forward dividend yield, yield on cost (YOC), and long-term DRIP compounding wealth projections.
 */

export interface DividendYieldInputs {
  sharePrice?: number;
  stockPrice?: number;
  annualDividendPerShare: number;
  purchasePricePerShare?: number;
  numberOfShares?: number;
  sharesOwned?: number;
  holdingYears?: number;
  investmentHorizonYears?: number;
  annualDividendGrowthRate?: number;
  dividendGrowthRate?: number;
  annualStockAppreciationRate?: number;
  stockPriceAppreciation?: number;
  reinvestDividends?: boolean;
}

export interface DividendScheduleYear {
  year: number;
  stockPrice: number;
  sharesOwned: number;
  dividendPerShare: number;
  annualDividendIncome: number;
  yieldOnCost: number;
  portfolioValue: number;
}

export interface DividendYieldResult {
  currentDividendYield: number;
  annualDividendIncome: number;
  monthlyDividendIncome: number;
  yieldOnCost?: number;
  projectedPortfolioValue: number;
  endingSharesCount: number;
  cumulativeDividendsReceived: number;
  timeline: DividendScheduleYear[];
}

export function calculateDividendYield(inputs: DividendYieldInputs): DividendYieldResult {
  const currentPrice = Math.max(0.01, inputs.sharePrice ?? inputs.stockPrice ?? 1);
  const dps = Math.max(0, inputs.annualDividendPerShare);
  const purchasePrice = inputs.purchasePricePerShare && inputs.purchasePricePerShare > 0 ? inputs.purchasePricePerShare : undefined;
  const initialShares = Math.max(0, inputs.numberOfShares ?? inputs.sharesOwned ?? 1);
  const years = Math.max(1, Math.round(inputs.holdingYears ?? inputs.investmentHorizonYears ?? 10));
  const divGrowth = (inputs.annualDividendGrowthRate ?? inputs.dividendGrowthRate ?? 0) / 100;
  const stockGrowth = (inputs.annualStockAppreciationRate ?? inputs.stockPriceAppreciation ?? 0) / 100;
  const drip = inputs.reinvestDividends ?? true;

  const currentDividendYield = (dps / currentPrice) * 100;
  const annualDividendIncome = dps * initialShares;
  const monthlyDividendIncome = annualDividendIncome / 12;

  const yieldOnCost = purchasePrice ? (dps / purchasePrice) * 100 : undefined;

  // DRIP multi-year simulation
  let shares = initialShares;
  let price = currentPrice;
  let currentDps = dps;
  let cumulativeDividends = 0;
  const timeline: DividendScheduleYear[] = [];

  for (let y = 1; y <= years; y++) {
    price *= 1 + stockGrowth;
    currentDps *= 1 + divGrowth;

    const yearlyIncome = shares * currentDps;
    cumulativeDividends += yearlyIncome;

    if (drip && price > 0) {
      const newShares = yearlyIncome / price;
      shares += newShares;
    }

    const portfolioVal = shares * price;
    const yoc = purchasePrice ? (currentDps / purchasePrice) * 100 : (currentDps / currentPrice) * 100;

    timeline.push({
      year: y,
      stockPrice: Number(price.toFixed(2)),
      sharesOwned: Number(shares.toFixed(2)),
      dividendPerShare: Number(currentDps.toFixed(2)),
      annualDividendIncome: Math.round(yearlyIncome),
      yieldOnCost: Number(yoc.toFixed(2)),
      portfolioValue: Math.round(portfolioVal),
    });
  }

  const projectedPortfolioValue = Math.round(shares * price);

  return {
    currentDividendYield: Number(currentDividendYield.toFixed(2)),
    annualDividendIncome: Math.round(annualDividendIncome),
    monthlyDividendIncome: Math.round(monthlyDividendIncome),
    yieldOnCost: yieldOnCost !== undefined ? Number(yieldOnCost.toFixed(2)) : undefined,
    projectedPortfolioValue,
    endingSharesCount: Number(shares.toFixed(1)),
    cumulativeDividendsReceived: Math.round(cumulativeDividends),
    timeline,
  };
}

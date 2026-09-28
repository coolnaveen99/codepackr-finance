/**
 * Stock Average / Cost Averaging Calculator
 * Weighted average buy price after multiple purchases.
 * 100% client-side.
 */

export const STOCK_AVERAGE_ENGINE_VERSION = '1.0.0';

export interface StockPurchase {
  quantity: number;
  pricePerShare: number;
}

export interface StockAverageResult {
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  rows: { quantity: number; price: number; invested: number }[];
  notes: string[];
}

export function calculateStockAverage(purchases: StockPurchase[]): StockAverageResult {
  const rows: StockAverageResult['rows'] = [];
  let totalQty = 0;
  let totalInvested = 0;

  for (const p of purchases) {
    const q = Math.max(0, p.quantity);
    const price = Math.max(0, p.pricePerShare);
    if (q <= 0 || price <= 0) continue;
    const invested = q * price;
    totalQty += q;
    totalInvested += invested;
    rows.push({ quantity: q, price, invested: Math.round(invested * 100) / 100 });
  }

  const averagePrice = totalQty > 0 ? totalInvested / totalQty : 0;

  return {
    totalQuantity: Math.round(totalQty * 1000) / 1000,
    totalInvested: Math.round(totalInvested * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    rows,
    notes: [
      'Average price = total amount invested ÷ total quantity.',
      'Does not include brokerage, STT or other charges — add those into price if you want all-in cost.',
      'Useful for SIP-style equity buying or multiple tranches of the same stock.',
    ],
  };
}

/**
 * Goods & Services Tax (GST) Calculation Engine
 * Supports forward tax computation (Exclusive) and backward reverse extraction (Inclusive),
 * plus Intra-state split (CGST 50% + SGST 50%) and Inter-state (IGST 100%).
 */

export interface GstInputs {
  amount: number; // Base invoice amount or inclusive amount
  gstRate: number; // Rate in % (0, 3, 5, 12, 18, 28, custom)
  mode: 'exclusive' | 'inclusive'; // Add tax or extract tax from gross price
  transactionType: 'intra-state' | 'inter-state'; // CGST+SGST vs IGST
}

export interface GstResult {
  netAmount: number; // Pre-tax taxable base
  totalGst: number; // Total GST collected
  grossAmount: number; // Final invoice total
  cgst: number; // Central GST (if intra-state)
  sgst: number; // State GST (if intra-state)
  igst: number; // Integrated GST (if inter-state)
  effectiveTaxRate: number;
}

export function calculateGst(inputs: GstInputs): GstResult {
  const { amount, gstRate, mode, transactionType } = inputs;
  const rawAmount = Math.max(0, amount);
  const rate = Math.max(0, gstRate) / 100;

  let netAmount = 0;
  let totalGst = 0;
  let grossAmount = 0;

  if (mode === 'exclusive') {
    // Adding GST to taxable base
    netAmount = rawAmount;
    totalGst = netAmount * rate;
    grossAmount = netAmount + totalGst;
  } else {
    // Reverse calculation: extracting GST from inclusive gross total
    // Gross = Net * (1 + rate) => Net = Gross / (1 + rate)
    grossAmount = rawAmount;
    netAmount = grossAmount / (1 + rate);
    totalGst = grossAmount - netAmount;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (transactionType === 'intra-state') {
    cgst = totalGst / 2;
    sgst = totalGst / 2;
  } else {
    igst = totalGst;
  }

  return {
    netAmount,
    totalGst,
    grossAmount,
    cgst,
    sgst,
    igst,
    effectiveTaxRate: gstRate,
  };
}

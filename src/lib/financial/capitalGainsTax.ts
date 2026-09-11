/**
 * Capital Gains Tax Engine
 * Evaluates Short-Term vs Long-Term gains, statutory holding periods, and latest tax slabs:
 * - Listed Equities & Equity Mutual Funds (STCG: 20%, LTCG: 12.5% with ₹1.25L exemption threshold)
 * - Real Estate / Immovable Property (STCG: Slab rate, LTCG: 12.5% without indexation)
 * - Debt Instruments & Unlisted Assets (Taxed at applicable marginal slab rate)
 */

export type AssetClass = 'equity' | 'real-estate' | 'debt-unlisted';

export interface CapitalGainsInputs {
  assetClass: AssetClass;
  purchasePrice: number;
  salePrice: number;
  transferExpenses: number; // Brokerage, legal, registration, stamp duty
  holdingPeriodMonths: number; // Duration held
  marginalTaxRate?: number; // Income tax slab rate for slab-taxed gains (%)
}

export interface CapitalGainsResult {
  assetClass: AssetClass;
  grossGainOrLoss: number;
  netGainOrLoss: number;
  gainType: 'short-term' | 'long-term';
  thresholdMonths: number;
  isProfit: boolean;
  exemptionClaimed: number;
  taxableCapitalGain: number;
  effectiveTaxRate: number;
  taxPayable: number;
  netPostTaxProceeds: number;
  notes: string[];
}

export function calculateCapitalGainsTax(inputs: CapitalGainsInputs): CapitalGainsResult {
  const {
    assetClass,
    purchasePrice,
    salePrice,
    transferExpenses,
    holdingPeriodMonths,
    marginalTaxRate = 30,
  } = inputs;

  const buy = Math.max(0, purchasePrice);
  const sell = Math.max(0, salePrice);
  const exp = Math.max(0, transferExpenses);
  const months = Math.max(0, holdingPeriodMonths);

  const grossGainOrLoss = sell - buy;
  const netGainOrLoss = grossGainOrLoss - exp;
  const isProfit = netGainOrLoss > 0;

  let thresholdMonths = 12;
  let gainType: 'short-term' | 'long-term' = 'short-term';
  let applicableTaxRate = 0;
  let exemptionClaimed = 0;
  const notes: string[] = [];

  if (assetClass === 'equity') {
    thresholdMonths = 12; // 1 year for listed equities
    gainType = months > thresholdMonths ? 'long-term' : 'short-term';

    if (!isProfit) {
      applicableTaxRate = 0;
      notes.push('Capital loss can be carried forward up to 8 assessment years.');
    } else if (gainType === 'short-term') {
      applicableTaxRate = 20; // Budget 2024 STCG 20%
      notes.push('Short-term equity gains taxed at flat 20% under Section 111A.');
    } else {
      applicableTaxRate = 12.5; // Budget 2024 LTCG 12.5%
      const ltcgExemptionLimit = 125000; // ₹1,25,000 exemption
      exemptionClaimed = Math.min(netGainOrLoss, ltcgExemptionLimit);
      notes.push(
        `Long-term equity gains qualify for ₹1,25,000 annual exemption under Section 112A; balance taxed at 12.5%.`
      );
    }
  } else if (assetClass === 'real-estate') {
    thresholdMonths = 24; // 2 years for immovable property
    gainType = months > thresholdMonths ? 'long-term' : 'short-term';

    if (!isProfit) {
      applicableTaxRate = 0;
      notes.push('Capital loss on property can be set off against taxable capital gains.');
    } else if (gainType === 'short-term') {
      applicableTaxRate = marginalTaxRate;
      notes.push('STCG on real estate is added to taxable income and taxed at marginal income slab rate.');
    } else {
      applicableTaxRate = 12.5; // Budget 2024 revised LTCG rate without indexation
      notes.push('LTCG on property held > 24 months taxed at 12.5% without indexation benefits.');
    }
  } else {
    // Debt & unlisted assets
    thresholdMonths = 24;
    gainType = months > thresholdMonths ? 'long-term' : 'short-term';

    if (!isProfit) {
      applicableTaxRate = 0;
    } else {
      // Post-2023 amendment: specified mutual funds and debt taxed at slab rate
      applicableTaxRate = marginalTaxRate;
      notes.push('Debt instruments and specified debt funds are taxed at the investor’s marginal slab rate.');
    }
  }

  const taxableCapitalGain = isProfit ? Math.max(0, netGainOrLoss - exemptionClaimed) : 0;
  const taxPayable = taxableCapitalGain * (applicableTaxRate / 100);
  const netPostTaxProceeds = sell - exp - taxPayable;

  return {
    assetClass,
    grossGainOrLoss,
    netGainOrLoss,
    gainType,
    thresholdMonths,
    isProfit,
    exemptionClaimed,
    taxableCapitalGain,
    effectiveTaxRate: applicableTaxRate,
    taxPayable,
    netPostTaxProceeds,
    notes,
  };
}

/**
 * TDS Calculator (illustrative India rates)
 * Common sections: 194A, 194C, 194H, 194I, 194J, 192-style salary hint.
 * 100% client-side. Not tax advice.
 */

export const TDS_ENGINE_VERSION = '1.0.0';

export type TdsSection =
  | '194A' // Interest other than securities
  | '194C' // Contractors
  | '194H' // Commission / brokerage
  | '194I' // Rent
  | '194J' // Professional / technical fees
  | '194O' // E-commerce
  | 'custom';

export interface TdsInputs {
  section: TdsSection;
  amount: number;
  /** For custom section */
  customRatePercent?: number;
  /** Pan available — lower rate; no PAN often 20% */
  panAvailable?: boolean;
  /** Threshold exemption amount for the section (optional override) */
  threshold?: number;
}

export interface TdsResult {
  section: TdsSection;
  ratePercent: number;
  threshold: number;
  taxableAmount: number;
  tdsAmount: number;
  netPayable: number;
  notes: string[];
}

const SECTION_META: Record<
  Exclude<TdsSection, 'custom'>,
  { rate: number; noPanRate: number; threshold: number; label: string }
> = {
  '194A': { rate: 10, noPanRate: 20, threshold: 40_000, label: 'Interest (other than securities)' },
  '194C': { rate: 1, noPanRate: 20, threshold: 30_000, label: 'Payments to contractors (individual)' },
  '194H': { rate: 5, noPanRate: 20, threshold: 15_000, label: 'Commission or brokerage' },
  '194I': { rate: 10, noPanRate: 20, threshold: 2_40_000, label: 'Rent (land/building) — simplified' },
  '194J': { rate: 10, noPanRate: 20, threshold: 30_000, label: 'Professional / technical fees' },
  '194O': { rate: 0.1, noPanRate: 5, threshold: 5_00_000, label: 'E-commerce operator payments' },
};

export function calculateTds(inputs: TdsInputs): TdsResult {
  const amount = Math.max(0, inputs.amount);
  const pan = inputs.panAvailable !== false;

  let ratePercent: number;
  let threshold: number;
  let sectionLabel: string;

  if (inputs.section === 'custom') {
    ratePercent = inputs.customRatePercent ?? 10;
    threshold = inputs.threshold ?? 0;
    sectionLabel = 'Custom rate';
  } else {
    const meta = SECTION_META[inputs.section];
    ratePercent = pan ? meta.rate : meta.noPanRate;
    threshold = inputs.threshold ?? meta.threshold;
    sectionLabel = meta.label;
  }

  const taxableAmount = Math.max(0, amount - threshold);
  // Simplified: many sections deduct on full amount once threshold crossed;
  // we show TDS only on amount above threshold for educational clarity.
  const tdsAmount = (taxableAmount * ratePercent) / 100;
  const netPayable = amount - tdsAmount;

  const notes = [
    `Section ${inputs.section}: ${sectionLabel}. Illustrative rate ${ratePercent}%${pan ? '' : ' (no PAN / higher rate)'}.`,
    'Threshold and rates are simplified educational defaults — actual TDS rules depend on FY, payee type, and CBDT notifications.',
    'Not tax advice. Confirm with a CA or the Income Tax department before deducting or claiming.',
  ];

  return {
    section: inputs.section,
    ratePercent,
    threshold,
    taxableAmount: Math.round(taxableAmount),
    tdsAmount: Math.round(tdsAmount * 100) / 100,
    netPayable: Math.round(netPayable * 100) / 100,
    notes,
  };
}

export const TDS_SECTIONS = SECTION_META;

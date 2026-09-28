/**
 * Equity Brokerage / Trade Cost Calculator (India)
 * Illustrative charges: brokerage, STT, exchange, GST, SEBI, stamp.
 * 100% client-side. Not a broker quote.
 */

export const BROKERAGE_ENGINE_VERSION = '1.0.0';

export type TradeSide = 'buy' | 'sell';
export type Segment = 'delivery' | 'intraday';

export interface BrokerageInputs {
  tradeValue: number;
  side: TradeSide;
  segment: Segment;
  /** Brokerage % of turnover (discount brokers often ~0.03% or flat) */
  brokeragePercent?: number;
  /** Flat brokerage per order (if using flat plan) */
  flatBrokerage?: number;
  useFlat?: boolean;
}

export interface BrokerageResult {
  tradeValue: number;
  brokerage: number;
  stt: number;
  exchangeTxnCharge: number;
  sebiCharges: number;
  stampDuty: number;
  gst: number;
  totalCharges: number;
  netDebitOrCredit: number;
  effectivePercent: number;
  notes: string[];
}

export function calculateBrokerage(inputs: BrokerageInputs): BrokerageResult {
  const value = Math.max(0, inputs.tradeValue);
  const side = inputs.side;
  const segment = inputs.segment;
  const useFlat = !!inputs.useFlat;
  const brokeragePct = (inputs.brokeragePercent ?? 0.03) / 100;
  const flat = inputs.flatBrokerage ?? 20;

  let brokerage = useFlat ? Math.min(flat, value * 0.025) : value * brokeragePct;
  // Cap typical discount-broker style
  if (!useFlat) brokerage = Math.min(brokerage, value * 0.025);

  // STT (approx statutory)
  let stt = 0;
  if (segment === 'delivery') {
    stt = value * 0.001; // 0.1% on both buy & sell for delivery (illustrative current)
  } else {
    // intraday: STT on sell side only ~0.025%
    stt = side === 'sell' ? value * 0.00025 : 0;
  }

  // Exchange transaction charges ~0.00345% NSE equity (illustrative)
  const exchangeTxnCharge = value * 0.0000345;

  // SEBI charges ~₹10 / crore
  const sebiCharges = value * 0.000001;

  // Stamp duty (state; illustrative Maharashtra-style)
  let stampDuty = 0;
  if (side === 'buy') {
    stampDuty = segment === 'delivery' ? value * 0.00015 : value * 0.00003;
  }

  // GST 18% on (brokerage + exchange + SEBI)
  const gstBase = brokerage + exchangeTxnCharge + sebiCharges;
  const gst = gstBase * 0.18;

  const totalCharges = brokerage + stt + exchangeTxnCharge + sebiCharges + stampDuty + gst;
  const netDebitOrCredit =
    side === 'buy' ? value + totalCharges : value - totalCharges;
  const effectivePercent = value > 0 ? (totalCharges / value) * 100 : 0;

  const notes = [
    'Charges are illustrative approximations of common NSE equity rates and may differ by state (stamp), exchange, and broker plan.',
    'STT, exchange, SEBI and stamp rates change over time — verify with your broker contract note.',
    'Discount brokers often use flat ₹20/order or very low %; toggle flat plan if needed.',
  ];

  return {
    tradeValue: Math.round(value),
    brokerage: Math.round(brokerage * 100) / 100,
    stt: Math.round(stt * 100) / 100,
    exchangeTxnCharge: Math.round(exchangeTxnCharge * 100) / 100,
    sebiCharges: Math.round(sebiCharges * 100) / 100,
    stampDuty: Math.round(stampDuty * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    totalCharges: Math.round(totalCharges * 100) / 100,
    netDebitOrCredit: Math.round(netDebitOrCredit * 100) / 100,
    effectivePercent: Math.round(effectivePercent * 10000) / 10000,
    notes,
  };
}

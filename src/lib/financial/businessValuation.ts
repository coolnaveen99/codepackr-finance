/**
 * CodePackr Finance — Business Valuation Calculator (Multiples Method)
 * -------------------------------------------------------------------
 * 100% Client-Side Pure Calculation Engine
 * Enterprise Value = Financial Metric × Valuation Multiple
 * Equity Value = Enterprise Value - Net Debt (Total Debt - Cash)
 */

export const BUSINESS_VALUATION_ENGINE_VERSION = '1.0.0';

export type ValuationMethod = 'revenue' | 'ebitda' | 'sde';

export interface IndustryPreset {
  id: string;
  name: string;
  defaultMethod: ValuationMethod;
  description: string;
  multiples: {
    low: number;
    base: number;
    high: number;
  };
}

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  saas: {
    id: 'saas',
    name: 'SaaS & Cloud Software',
    defaultMethod: 'revenue',
    description: 'Recurring subscription software models with high gross margins (70%+). Valued predominantly on ARR / Revenue multiples.',
    multiples: { low: 4.0, base: 7.5, high: 12.0 },
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce & D2C Brands',
    defaultMethod: 'revenue',
    description: 'Online direct-to-consumer and marketplace stores. Valued on net GMV/Revenue or EBITDA for established profitable brands.',
    multiples: { low: 1.2, base: 2.2, high: 3.8 },
  },
  services: {
    id: 'services',
    name: 'Professional Services & Agencies',
    defaultMethod: 'sde',
    description: 'Consulting firms, digital agencies, and specialized practices. Valued on Seller Discretionary Earnings (SDE).',
    multiples: { low: 2.2, base: 3.2, high: 4.8 },
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    defaultMethod: 'ebitda',
    description: 'Capital-intensive production, supply chain, and B2B fabrication businesses with stable operational cash flow.',
    multiples: { low: 4.0, base: 5.5, high: 7.5 },
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Medical Practices',
    defaultMethod: 'ebitda',
    description: 'Outpatient clinics, dental groups, and specialized healthcare providers with defensive recurring patient demand.',
    multiples: { low: 6.5, base: 9.0, high: 13.0 },
  },
  generic_smb: {
    id: 'generic_smb',
    name: 'Main Street SMB / Retail',
    defaultMethod: 'sde',
    description: 'Independent owner-operator retail, local trade, and hospitality businesses with owner-centric cash flow.',
    multiples: { low: 1.8, base: 2.6, high: 3.8 },
  },
};

export interface BusinessValuationInput {
  method: ValuationMethod;
  metricValue: number;
  multiples: {
    low: number;
    base: number;
    high: number;
  };
  netDebt?: number; // Total Debt minus Cash (can be negative if Net Cash)
}

export interface ValuationScenario {
  multiple: number;
  enterpriseValue: number;
  equityValue: number;
}

export interface SensitivityPoint {
  multiple: number;
  enterpriseValue: number;
  equityValue: number;
}

export interface BusinessValuationResult {
  method: ValuationMethod;
  metricValue: number;
  netDebt: number;
  scenarios: {
    conservative: ValuationScenario;
    base: ValuationScenario;
    optimistic: ValuationScenario;
  };
  sensitivityTable: SensitivityPoint[];
  summary: string;
}

export function calculateBusinessValuation(input: BusinessValuationInput): BusinessValuationResult {
  const metric = Math.max(0, Number(input.metricValue) || 0);
  const netDebt = Number(input.netDebt) || 0;

  const lowMult = Math.max(0.1, Number(input.multiples?.low) || 2.0);
  const baseMult = Math.max(lowMult, Number(input.multiples?.base) || 3.5);
  const highMult = Math.max(baseMult, Number(input.multiples?.high) || 5.0);

  const calcScenario = (multiple: number): ValuationScenario => {
    const ev = Number((metric * multiple).toFixed(2));
    const eq = Number((ev - netDebt).toFixed(2));
    return {
      multiple: Number(multiple.toFixed(2)),
      enterpriseValue: ev,
      equityValue: eq,
    };
  };

  const conservative = calcScenario(lowMult);
  const base = calcScenario(baseMult);
  const optimistic = calcScenario(highMult);

  // Generate 7-point sensitivity table around the base multiple
  const sensitivityTable: SensitivityPoint[] = [];
  const minMult = Math.max(0.5, lowMult * 0.8);
  const maxMult = highMult * 1.2;
  const step = (maxMult - minMult) / 6;

  for (let i = 0; i < 7; i++) {
    const m = minMult + step * i;
    sensitivityTable.push(calcScenario(m));
  }

  const methodLabel =
    input.method === 'ebitda'
      ? 'EBITDA'
      : input.method === 'sde'
      ? 'Seller Discretionary Earnings (SDE)'
      : 'Annual Revenue';

  const summary = `Based on an ${methodLabel} of ${metric.toLocaleString()} and a base multiple of ${baseMult}x, the enterprise is valued at ${base.enterpriseValue.toLocaleString()} (base scenario). Adjusting for net debt of ${netDebt.toLocaleString()} yields an implied equity value of ${base.equityValue.toLocaleString()}.`;

  return {
    method: input.method,
    metricValue: metric,
    netDebt,
    scenarios: {
      conservative,
      base,
      optimistic,
    },
    sensitivityTable,
    summary,
  };
}

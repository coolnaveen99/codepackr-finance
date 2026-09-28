/**
 * National Pension System (NPS) Calculator Engine
 * Tier I corpus projection, 60% lump sum + 40% annuity at exit,
 * 80CCD(1B) extra ₹50k, optional employer contribution.
 * 100% client-side. Illustrative only — returns are market-linked.
 */

export const NPS_ENGINE_VERSION = '1.0.0';

export interface NpsInputs {
  currentAge: number;
  retirementAge?: number;
  monthlyContribution: number;
  expectedReturnPercent: number;
  stepUpPercent?: number;
  employerMonthly?: number;
  annuityRatePercent?: number;
  taxSlabPercent?: number;
}

export interface NpsYearRow {
  year: number;
  age: number;
  contribution: number;
  interest: number;
  closing: number;
}

export interface NpsResult {
  years: number;
  totalContributed: number;
  corpusAtRetirement: number;
  lumpSum60: number;
  annuityCorpus40: number;
  estimatedMonthlyPension: number;
  section80ccd1bAnnual: number;
  lifetime80ccd1bSavings: number;
  yearlyBreakdown: NpsYearRow[];
  notes: string[];
}

export function calculateNps(inputs: NpsInputs): NpsResult {
  const currentAge = Math.max(18, Math.min(65, Math.round(inputs.currentAge)));
  const retirementAge = Math.max(currentAge + 1, Math.min(75, inputs.retirementAge ?? 60));
  const years = retirementAge - currentAge;
  let monthly = Math.max(0, inputs.monthlyContribution);
  const employer = Math.max(0, inputs.employerMonthly ?? 0);
  const annualReturn = Math.max(0, inputs.expectedReturnPercent) / 100;
  const monthlyReturn = annualReturn / 12;
  const stepUp = Math.max(0, inputs.stepUpPercent ?? 0);
  const annuityRate = Math.max(0, inputs.annuityRatePercent ?? 6) / 100;
  const taxSlab = Math.max(0, Math.min(100, inputs.taxSlabPercent ?? 30));

  let balance = 0;
  let totalContributed = 0;
  const yearlyBreakdown: NpsYearRow[] = [];
  let yearContrib = 0;
  let yearInterest = 0;

  for (let m = 1; m <= years * 12; m++) {
    if ((m - 1) % 12 === 0 && m > 1 && stepUp > 0) {
      monthly *= 1 + stepUp / 100;
    }
    const contrib = monthly + employer;
    balance += contrib;
    totalContributed += contrib;
    yearContrib += contrib;

    const interest = balance * monthlyReturn;
    balance += interest;
    yearInterest += interest;

    if (m % 12 === 0) {
      const y = m / 12;
      yearlyBreakdown.push({
        year: y,
        age: currentAge + y,
        contribution: Math.round(yearContrib),
        interest: Math.round(yearInterest),
        closing: Math.round(balance),
      });
      yearContrib = 0;
      yearInterest = 0;
    }
  }

  const corpus = Math.round(balance);
  const lumpSum60 = Math.round(corpus * 0.6);
  const annuityCorpus40 = Math.round(corpus * 0.4);
  // Simple annuity: annual interest on 40% corpus / 12
  const estimatedMonthlyPension = Math.round((annuityCorpus40 * annuityRate) / 12);

  // 80CCD(1B) extra ₹50,000 on employee contribution (not employer)
  const annualEmployee = monthly * 12; // last year approx; use first year for illustration
  const section80ccd1bAnnual = Math.min(50_000, Math.max(0, inputs.monthlyContribution * 12));
  const lifetime80ccd1bSavings = Math.round(section80ccd1bAnnual * (taxSlab / 100) * years);

  const notes: string[] = [
    'NPS returns are market-linked (equity/corporate/govt bonds). Expected return is an assumption, not a guarantee.',
    'At exit (typically age 60): up to 60% can be withdrawn as lump sum (tax-free under current rules); at least 40% must buy an annuity.',
    'Additional deduction of up to ₹50,000 under Section 80CCD(1B) over and above 80C (old regime).',
    'Employer contribution under 80CCD(2) has separate limits (illustrative).',
    'Annuity rate is user-assumed; actual pension depends on annuity provider rates at purchase.',
  ];

  return {
    years,
    totalContributed: Math.round(totalContributed),
    corpusAtRetirement: corpus,
    lumpSum60,
    annuityCorpus40,
    estimatedMonthlyPension,
    section80ccd1bAnnual,
    lifetime80ccd1bSavings,
    yearlyBreakdown,
    notes,
  };
}

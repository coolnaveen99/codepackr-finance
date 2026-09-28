/**
 * Atal Pension Yojana (APY) Calculator Engine
 * Age 18–40, guaranteed pension tiers ₹1,000–₹5,000 / month from age 60.
 * Contribution chart approximated from official APY tables (illustrative).
 * 100% client-side.
 */

export const APY_ENGINE_VERSION = '1.0.0';

export type ApyPensionTier = 1000 | 2000 | 3000 | 4000 | 5000;

export interface ApyInputs {
  entryAge: number;
  pensionTier: ApyPensionTier;
}

export interface ApyResult {
  entryAge: number;
  pensionTier: ApyPensionTier;
  yearsToContribute: number;
  monthlyContribution: number;
  annualContribution: number;
  totalContributed: number;
  notes: string[];
}

/**
 * Approximate monthly contribution (₹) by entry age and pension tier.
 * Based on published APY contribution charts (rounded). Official PFRDA table may differ slightly.
 */
const APY_TABLE: Record<number, Record<ApyPensionTier, number>> = {
  18: { 1000: 42, 2000: 84, 3000: 126, 4000: 168, 5000: 210 },
  20: { 1000: 50, 2000: 100, 3000: 150, 4000: 198, 5000: 248 },
  25: { 1000: 76, 2000: 151, 3000: 226, 4000: 301, 5000: 376 },
  30: { 1000: 116, 2000: 231, 3000: 347, 4000: 462, 5000: 577 },
  35: { 1000: 181, 2000: 362, 3000: 543, 4000: 722, 5000: 902 },
  40: { 1000: 291, 2000: 582, 3000: 873, 4000: 1164, 5000: 1454 },
};

function nearestAgeKey(age: number): number {
  const keys = Object.keys(APY_TABLE).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) {
    if (Math.abs(k - age) < Math.abs(best - age)) best = k;
  }
  return best;
}

export function calculateApy(inputs: ApyInputs): ApyResult {
  const entryAge = Math.max(18, Math.min(40, Math.round(inputs.entryAge)));
  const tier = inputs.pensionTier;
  const yearsToContribute = 60 - entryAge;
  const ageKey = nearestAgeKey(entryAge);
  const monthlyContribution = APY_TABLE[ageKey][tier];
  const annualContribution = monthlyContribution * 12;
  const totalContributed = annualContribution * yearsToContribute;

  const notes: string[] = [
    'APY is a government-backed pension scheme for workers in the unorganised sector (and others eligible under NPS).',
    'Guaranteed minimum pension of ₹1,000–₹5,000 per month from age 60, based on contribution tier.',
    'Contribution amounts are approximate from published APY charts; verify exact amount with your bank / PFRDA.',
    'Subscriber must contribute until age 60. Spouse may receive pension on death of subscriber (as per scheme rules).',
    'Illustrative only. Not a substitute for official APY contribution tables.',
  ];
  if (ageKey !== entryAge) {
    notes.unshift(`Contribution interpolated from nearest table age (${ageKey}). Official amount for age ${entryAge} may differ slightly.`);
  }

  return {
    entryAge,
    pensionTier: tier,
    yearsToContribute,
    monthlyContribution,
    annualContribution,
    totalContributed,
    notes,
  };
}

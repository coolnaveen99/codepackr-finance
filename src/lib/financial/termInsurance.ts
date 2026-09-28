/**
 * Term Insurance Calculator Engine
 * - Cover needed: Income multiple, HLV, Needs-based
 * - Insurer-eligible max cover lock (income + age based)
 * - Premium by age + life cover + cover-till age → monthly & yearly
 * - Cost of delaying purchase by 1 year
 * - Rider impact (CI, Permanent Disability, Waiver of Premium)
 *
 * 100% client-side. All figures are illustrative only.
 */

export const TERM_INSURANCE_ENGINE_VERSION = '1.1.0';

export interface TermInsuranceInputs {
  age: number;
  gender: 'male' | 'female';
  smoker: boolean;
  annualIncome: number;
  existingCover: number;
  outstandingLoans: number;
  annualFamilyExpenses: number;
  yearsOfSupport: number;
  educationGoals: number;
  existingAssets: number;
  /** Life cover / sum assured the user wants premium for */
  desiredCover?: number;
  /** Legacy: policy term in years (used if coverTillAge not set) */
  policyTerm?: number;
  /** Cover till this age (e.g. 60, 75, 85). Preferred over policyTerm. */
  coverTillAge?: number;
  discountRateHLV?: number;
  includeCI?: boolean;
  includeADB?: boolean;
  includeWOP?: boolean;
}

export interface TermInsuranceResult {
  coverIncomeMultiple: number;
  coverHLV: number;
  coverNeedsBased: number;
  recommendedCover: number;
  eligibleMaxCover: number;
  eligibleMultipleUsed: number;
  isCoverLocked: boolean;
  selectedCover: number;
  /** Effective policy term in years */
  policyTermYears: number;
  /** Age until which cover runs */
  coverTillAge: number;
  estimatedAnnualPremium: number;
  estimatedMonthlyPremium: number;
  premiumPerLakh: number;
  costOfDelayOneYear: number;
  /** Extra annual premium if bought 1 year later */
  annualPremiumIfDelayedOneYear: number;
  riderCI: number;
  riderADB: number;
  riderWOP: number;
  totalWithRidersAnnual: number;
  totalWithRidersMonthly: number;
  notes: string[];
}

function getIncomeMultiple(age: number): number {
  if (age <= 35) return 30;
  if (age <= 40) return 25;
  if (age <= 45) return 20;
  if (age <= 50) return 15;
  if (age <= 60) return 10;
  return 5;
}

function applyLowIncomeCap(annualIncome: number, rawMax: number): number {
  if (annualIncome < 250_000) return Math.min(rawMax, 2_500_000);
  if (annualIncome < 360_000) return Math.min(rawMax, 5_000_000);
  if (annualIncome < 500_000) return Math.min(rawMax, 10_000_000);
  if (annualIncome < 700_000) return Math.min(rawMax, 17_500_000);
  return rawMax;
}

/**
 * Illustrative annual premium per ₹1 lakh of cover (regular pay, non-smoker base).
 * Tuned to typical India online term ranges (zero-GST era) — not a real quote.
 */
function basePremiumPerLakh(
  age: number,
  termYears: number,
  gender: 'male' | 'female'
): number {
  let base = 85;
  if (age >= 25) base = 95;
  if (age >= 28) base = 110;
  if (age >= 30) base = 125;
  if (age >= 32) base = 140;
  if (age >= 35) base = 165;
  if (age >= 38) base = 195;
  if (age >= 40) base = 230;
  if (age >= 42) base = 270;
  if (age >= 45) base = 340;
  if (age >= 48) base = 420;
  if (age >= 50) base = 520;
  if (age >= 52) base = 620;
  if (age >= 55) base = 780;
  if (age >= 58) base = 980;
  if (age >= 60) base = 1250;
  if (age >= 65) base = 1800;

  // Longer cover horizon costs more
  if (termYears > 40) base *= 1.18;
  else if (termYears > 35) base *= 1.12;
  else if (termYears > 30) base *= 1.08;
  else if (termYears > 25) base *= 1.05;
  else if (termYears > 20) base *= 1.03;

  if (gender === 'female') base *= 0.88;

  return Math.round(base);
}

function resolveTermYears(age: number, coverTillAge?: number, policyTerm?: number): {
  termYears: number;
  tillAge: number;
} {
  const maxTill = 100;
  const minTill = Math.max(age + 5, 40);

  if (coverTillAge != null && coverTillAge > 0) {
    const till = Math.max(minTill, Math.min(maxTill, Math.round(coverTillAge)));
    const termYears = Math.max(5, till - age);
    return { termYears, tillAge: age + termYears };
  }

  const term = Math.max(5, Math.min(50, policyTerm ?? 30));
  return { termYears: term, tillAge: age + term };
}

export function calculateTermInsurance(inputs: TermInsuranceInputs): TermInsuranceResult {
  const age = Math.max(18, Math.min(70, Math.round(inputs.age)));
  const gender = inputs.gender === 'female' ? 'female' : 'male';
  const smoker = !!inputs.smoker;
  const annualIncome = Math.max(0, inputs.annualIncome);
  const existingCover = Math.max(0, inputs.existingCover);
  const outstandingLoans = Math.max(0, inputs.outstandingLoans);
  const annualFamilyExpenses = Math.max(0, inputs.annualFamilyExpenses);
  const yearsOfSupport = Math.max(1, Math.min(40, inputs.yearsOfSupport || 20));
  const educationGoals = Math.max(0, inputs.educationGoals);
  const existingAssets = Math.max(0, inputs.existingAssets);
  const discountRate = (inputs.discountRateHLV ?? 8) / 100;

  const { termYears: policyTermYears, tillAge: coverTillAge } = resolveTermYears(
    age,
    inputs.coverTillAge,
    inputs.policyTerm
  );

  const multiple = getIncomeMultiple(age);
  const coverIncomeMultiple = Math.round(annualIncome * Math.min(multiple, 20));

  let hlv = 0;
  if (annualIncome > 0 && discountRate > 0) {
    const remainingWorkingYears = Math.max(1, 60 - age);
    hlv = annualIncome * ((1 - Math.pow(1 + discountRate, -remainingWorkingYears)) / discountRate);
  }
  const coverHLV = Math.round(hlv);

  const expenseCorpus = annualFamilyExpenses * yearsOfSupport;
  const coverNeedsBased = Math.round(
    Math.max(0, outstandingLoans + expenseCorpus + educationGoals - existingAssets - existingCover)
  );

  const recommendedCover = Math.max(
    coverIncomeMultiple,
    coverHLV,
    coverNeedsBased,
    1_000_000
  );

  const rawEligible = annualIncome * multiple;
  const eligibleMaxCover = Math.round(applyLowIncomeCap(annualIncome, rawEligible));
  const eligibleMultipleUsed = annualIncome > 0 ? eligibleMaxCover / annualIncome : 0;

  // Premium is calculated on the cover the user cares about:
  // desired cover if given, else recommended — then apply income lock for "selected" display
  let selectedCover =
    inputs.desiredCover && inputs.desiredCover > 0 ? inputs.desiredCover : recommendedCover;
  const isCoverLocked = selectedCover > eligibleMaxCover && annualIncome > 0;
  // For premium: use desired cover if user set it (they want "what if I take X"),
  // else locked recommended. Always show both eligible max and premium for selected.
  const premiumCover =
    inputs.desiredCover && inputs.desiredCover > 0
      ? inputs.desiredCover
      : isCoverLocked
        ? eligibleMaxCover
        : selectedCover;

  if (isCoverLocked && !(inputs.desiredCover && inputs.desiredCover > 0)) {
    selectedCover = eligibleMaxCover;
  }

  let perLakh = basePremiumPerLakh(age, policyTermYears, gender);
  if (smoker) perLakh = Math.round(perLakh * 1.4);

  const coverInLakh = Math.max(0, premiumCover) / 100_000;
  const estimatedAnnualPremium = Math.round(perLakh * coverInLakh);
  const estimatedMonthlyPremium = Math.round(estimatedAnnualPremium / 12);

  const nextPerLakh = basePremiumPerLakh(age + 1, policyTermYears, gender);
  const nextAnnual = Math.round(nextPerLakh * (smoker ? 1.4 : 1) * coverInLakh);
  const costOfDelayOneYear = Math.max(0, (nextAnnual - estimatedAnnualPremium) * policyTermYears);

  const riderCI = inputs.includeCI ? Math.round(estimatedAnnualPremium * 0.35) : 0;
  const riderADB = inputs.includeADB ? Math.round(estimatedAnnualPremium * 0.08) : 0;
  const riderWOP = inputs.includeWOP ? Math.round(estimatedAnnualPremium * 0.12) : 0;
  const totalWithRidersAnnual = estimatedAnnualPremium + riderCI + riderADB + riderWOP;
  const totalWithRidersMonthly = Math.round(totalWithRidersAnnual / 12);

  const notes: string[] = [];
  if (annualIncome > 0 && annualIncome < 360_000) {
    notes.push(
      `With annual income around ₹${(annualIncome / 100_000).toFixed(1)}L, most insurers lock max sum assured near ₹50L. Higher covers need stronger income proof.`
    );
  }
  if (isCoverLocked && !(inputs.desiredCover && inputs.desiredCover > 0)) {
    notes.push(
      `Ideal cover exceeds typical underwriting limit of ₹${(eligibleMaxCover / 100_000).toFixed(0)}L for this income & age — locked to eligible max.`
    );
  }
  if (coverTillAge > 85) {
    notes.push(
      'Most Indian term plans stop coverage around age 75–85. Cover till 90–100 is illustrative; check insurer product limits.'
    );
  }
  notes.push(
    'Monthly & yearly premiums are illustrative market ranges (zero-GST era). Actual quotes depend on medicals, occupation, education and insurer.'
  );
  notes.push(
    'Many plans offer: small lump-sum + monthly income payout, optional ~7% annual cover increase, and limited premium-paying term.'
  );
  notes.push('Check latest Claim Settlement Ratio on the IRDAI website before buying.');

  return {
    coverIncomeMultiple,
    coverHLV,
    coverNeedsBased,
    recommendedCover,
    eligibleMaxCover,
    eligibleMultipleUsed,
    isCoverLocked,
    selectedCover: Math.max(0, selectedCover),
    policyTermYears,
    coverTillAge,
    estimatedAnnualPremium,
    estimatedMonthlyPremium,
    premiumPerLakh: perLakh,
    costOfDelayOneYear,
    annualPremiumIfDelayedOneYear: nextAnnual,
    riderCI,
    riderADB,
    riderWOP,
    totalWithRidersAnnual,
    totalWithRidersMonthly,
    notes,
  };
}

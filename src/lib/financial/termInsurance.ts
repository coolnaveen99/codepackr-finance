/**
 * Advanced Term Insurance Calculator Engine
 * - Cover needed: Income multiple, HLV, Needs-based
 * - Insurer-eligible max cover lock (income + age based)
 * - Illustrative premiums (zero-GST era ranges)
 * - Cost of delaying purchase by 1 year
 * - Rider impact (CI, Permanent Disability, Waiver of Premium)
 * - Educational notes for lump-sum + monthly payout, 7% top-up, PPT vs PT
 *
 * 100% client-side. All figures are illustrative only.
 * Final eligibility & premiums depend on underwriting.
 */

export const TERM_INSURANCE_ENGINE_VERSION = '1.0.0';

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
  desiredCover?: number;
  policyTerm: number;
  discountRateHLV?: number;
  /** Include Critical Illness rider estimate */
  includeCI?: boolean;
  /** Include Accidental / Permanent Disability rider estimate */
  includeADB?: boolean;
  /** Include Waiver of Premium rider estimate */
  includeWOP?: boolean;
}

export interface TermInsuranceResult {
  coverIncomeMultiple: number;
  coverHLV: number;
  coverNeedsBased: number;
  recommendedCover: number;
  /** Max cover insurers are likely to approve based on income + age */
  eligibleMaxCover: number;
  eligibleMultipleUsed: number;
  isCoverLocked: boolean;
  selectedCover: number;
  estimatedAnnualPremium: number;
  estimatedMonthlyPremium: number;
  premiumPerLakh: number;
  costOfDelayOneYear: number;
  riderCI: number;
  riderADB: number;
  riderWOP: number;
  totalWithRiders: number;
  notes: string[];
}

/** Age-banded income multiples used by major Indian insurers (indicative) */
function getIncomeMultiple(age: number): number {
  if (age <= 35) return 30;
  if (age <= 40) return 25;
  if (age <= 45) return 20;
  if (age <= 50) return 15;
  if (age <= 60) return 10;
  return 5;
}

/**
 * Hard floors / ceilings for low incomes (common market practice).
 * e.g. ~₹3–3.6L annual (~₹30k/month) often capped around ₹50L.
 */
function applyLowIncomeCap(annualIncome: number, rawMax: number): number {
  if (annualIncome < 250_000) return Math.min(rawMax, 2_500_000); // Saral-style territory
  if (annualIncome < 360_000) return Math.min(rawMax, 5_000_000); // ~₹50L
  if (annualIncome < 500_000) return Math.min(rawMax, 10_000_000);
  if (annualIncome < 700_000) return Math.min(rawMax, 17_500_000);
  return rawMax;
}

/** Rough illustrative annual premium per lakh of cover (non-smoker base, regular pay) */
function basePremiumPerLakh(age: number, term: number, gender: 'male' | 'female'): number {
  // Approximate market ranges post zero-GST (2025+)
  let base = 90; // ₹ per lakh for young non-smoker
  if (age >= 25) base = 100;
  if (age >= 30) base = 120;
  if (age >= 35) base = 160;
  if (age >= 40) base = 220;
  if (age >= 45) base = 320;
  if (age >= 50) base = 480;
  if (age >= 55) base = 700;

  // Longer term slightly higher
  if (term > 30) base *= 1.08;
  else if (term > 20) base *= 1.04;

  // Female discount ~10–15%
  if (gender === 'female') base *= 0.88;

  return Math.round(base);
}

export function calculateTermInsurance(inputs: TermInsuranceInputs): TermInsuranceResult {
  const age = Math.max(18, Math.min(65, Math.round(inputs.age)));
  const gender = inputs.gender === 'female' ? 'female' : 'male';
  const smoker = !!inputs.smoker;
  const annualIncome = Math.max(0, inputs.annualIncome);
  const existingCover = Math.max(0, inputs.existingCover);
  const outstandingLoans = Math.max(0, inputs.outstandingLoans);
  const annualFamilyExpenses = Math.max(0, inputs.annualFamilyExpenses);
  const yearsOfSupport = Math.max(1, Math.min(40, inputs.yearsOfSupport || 20));
  const educationGoals = Math.max(0, inputs.educationGoals);
  const existingAssets = Math.max(0, inputs.existingAssets);
  const policyTerm = Math.max(5, Math.min(40, inputs.policyTerm || 30));
  const discountRate = (inputs.discountRateHLV ?? 8) / 100;

  // 1. Income-multiple cover (recommended starting point)
  const multiple = getIncomeMultiple(age);
  const coverIncomeMultiple = Math.round(annualIncome * Math.min(multiple, 20)); // recommended uses more conservative 10–20x

  // 2. Human Life Value (simplified PV of future earnings)
  let hlv = 0;
  if (annualIncome > 0 && discountRate > 0) {
    const remainingWorkingYears = Math.max(1, 60 - age);
    hlv = annualIncome * ((1 - Math.pow(1 + discountRate, -remainingWorkingYears)) / discountRate);
  }
  const coverHLV = Math.round(hlv);

  // 3. Needs-based
  const expenseCorpus = annualFamilyExpenses * yearsOfSupport;
  const coverNeedsBased = Math.round(
    Math.max(0, outstandingLoans + expenseCorpus + educationGoals - existingAssets - existingCover)
  );

  // Recommended = max of the three, floored at a sensible minimum
  const recommendedCover = Math.max(
    coverIncomeMultiple,
    coverHLV,
    coverNeedsBased,
    1_000_000 // at least ₹10L educational floor
  );

  // Insurer-eligible maximum
  const rawEligible = annualIncome * multiple;
  const eligibleMaxCover = Math.round(applyLowIncomeCap(annualIncome, rawEligible));
  const eligibleMultipleUsed = annualIncome > 0 ? eligibleMaxCover / annualIncome : 0;

  // Selected cover: user desired or recommended, but never above eligible max for the “locked” view
  let selectedCover = inputs.desiredCover && inputs.desiredCover > 0
    ? inputs.desiredCover
    : recommendedCover;
  const isCoverLocked = selectedCover > eligibleMaxCover;
  if (isCoverLocked) {
    selectedCover = eligibleMaxCover;
  }
  // Also respect that existing cover reduces net need
  selectedCover = Math.max(0, selectedCover);

  // Premium estimate
  let perLakh = basePremiumPerLakh(age, policyTerm, gender);
  if (smoker) perLakh = Math.round(perLakh * 1.4);
  const coverInLakh = selectedCover / 100_000;
  const estimatedAnnualPremium = Math.round(perLakh * coverInLakh);
  const estimatedMonthlyPremium = Math.round(estimatedAnnualPremium / 12);

  // Cost of delay: one extra year of age
  const nextAgePerLakh = basePremiumPerLakh(age + 1, policyTerm, gender);
  const nextAgeAnnual = Math.round(nextAgePerLakh * (smoker ? 1.4 : 1) * coverInLakh);
  const costOfDelayOneYear = Math.max(0, (nextAgeAnnual - estimatedAnnualPremium) * policyTerm);

  // Rider estimates (very approximate % of base)
  const riderCI = inputs.includeCI ? Math.round(estimatedAnnualPremium * 0.35) : 0;
  const riderADB = inputs.includeADB ? Math.round(estimatedAnnualPremium * 0.08) : 0;
  const riderWOP = inputs.includeWOP ? Math.round(estimatedAnnualPremium * 0.12) : 0;
  const totalWithRiders = estimatedAnnualPremium + riderCI + riderADB + riderWOP;

  const notes: string[] = [];
  if (annualIncome > 0 && annualIncome < 360_000) {
    notes.push(
      `With annual income around ₹${(annualIncome / 100_000).toFixed(1)}L, most insurers lock maximum sum assured near ₹50L (or lower). Higher covers usually require stronger income proof.`
    );
  }
  if (isCoverLocked) {
    notes.push(
      `Your ideal/desired cover exceeds the typical underwriting limit of ₹${(eligibleMaxCover / 100_000).toFixed(0)}L for this income & age. The calculator has locked the cover at the eligible maximum.`
    );
  }
  notes.push(
    'Premiums shown are illustrative market ranges (zero-GST era). Actual quotes vary by insurer, medical history, education and occupation.'
  );
  notes.push(
    'Many plans offer: (1) Small lump-sum + monthly income payout, (2) Optional 7% annual cover top-up / increasing cover, (3) Choice of Policy Term vs limited Premium Paying Term.'
  );
  notes.push(
    'Always check the latest Claim Settlement Ratio and Amount Settlement Ratio on the IRDAI website before buying.'
  );

  return {
    coverIncomeMultiple,
    coverHLV,
    coverNeedsBased,
    recommendedCover,
    eligibleMaxCover,
    eligibleMultipleUsed,
    isCoverLocked,
    selectedCover,
    estimatedAnnualPremium,
    estimatedMonthlyPremium,
    premiumPerLakh: perLakh,
    costOfDelayOneYear,
    riderCI,
    riderADB,
    riderWOP,
    totalWithRiders,
    notes,
  };
}

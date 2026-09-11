/**
 * Startup Valuation Engine (Dave Berkus, Payne Scorecard & VC Method)
 * Triangulates early-stage pre-revenue & seed-stage startup valuations
 */

export interface BerkusFactors {
  soundIdea: number; // $0 - $500k
  prototypeQuality: number; // $0 - $500k
  qualityTeam: number; // $0 - $500k
  strategicRelationships: number; // $0 - $500k
  productRollout: number; // $0 - $500k
}

export interface ScorecardFactors {
  benchmarkPreMoney: number; // Regional/stage median ($)
  teamScore: number; // 0.5 - 1.5 (weight ~30%)
  marketSizeScore: number; // 0.5 - 1.5 (weight ~25%)
  productScore: number; // 0.5 - 1.5 (weight ~15%)
  competitionScore: number; // 0.5 - 1.5 (weight ~10%)
  marketingScore: number; // 0.5 - 1.5 (weight ~10%)
}

export interface VcMethodFactors {
  targetExitYear: number; // e.g. 5
  projectedExitValuation: number; // Expected exit valuation ($)
  targetRoiMultiplier: number; // Expected multiple of invested capital (e.g. 10x)
  investmentAmount: number; // Amount being raised ($)
  anticipatedDilutionPercent: number; // Future dilution before exit (%)
}

export interface StartupValuationInputs {
  berkus: BerkusFactors;
  scorecard: ScorecardFactors;
  vcMethod: VcMethodFactors;
}

export interface StartupValuationResult {
  berkusValuation: number;
  scorecardValuation: number;
  vcPreMoneyValuation: number;
  vcPostMoneyValuation: number;
  triangulatedValuation: number;
  vcRequiredEquityPercent: number;
}

export function calculateStartupValuation(inputs: StartupValuationInputs): StartupValuationResult {
  const { berkus, scorecard, vcMethod } = inputs;

  // 1. Dave Berkus Method (Sum of 5 qualitative pillars up to $500k each)
  const berkusValuation = Math.max(
    0,
    berkus.soundIdea +
      berkus.prototypeQuality +
      berkus.qualityTeam +
      berkus.strategicRelationships +
      berkus.productRollout
  );

  // 2. Bill Payne Scorecard Method
  // Weights based on angel group standards:
  // Team: 30%, Market Size: 25%, Product/IP: 15%, Sales/Marketing: 10%, Competition: 10%, Need for Addl Funding: 10%
  const weightedMultiplier =
    scorecard.teamScore * 0.3 +
    scorecard.marketSizeScore * 0.25 +
    scorecard.productScore * 0.15 +
    scorecard.competitionScore * 0.1 +
    scorecard.marketingScore * 0.1 +
    1.0 * 0.1; // Baseline remaining factor

  const scorecardValuation = Math.max(0, scorecard.benchmarkPreMoney * weightedMultiplier);

  // 3. Classical VC Method
  // Post-Money at Exit = Projected Exit Valuation / Target ROI Multiplier
  // Post-Money Today = Post-Money at Exit * (1 - Anticipated Dilution / 100)
  // Pre-Money Today = Post-Money Today - Investment Amount
  const postMoneyAtExit =
    vcMethod.targetRoiMultiplier > 0
      ? vcMethod.projectedExitValuation / vcMethod.targetRoiMultiplier
      : 0;

  const retentionRatio = Math.max(0, 1 - vcMethod.anticipatedDilutionPercent / 100);
  const vcPostMoneyValuation = Math.max(0, postMoneyAtExit * retentionRatio);
  const vcPreMoneyValuation = Math.max(0, vcPostMoneyValuation - vcMethod.investmentAmount);

  // Implied Investor Ownership
  const vcRequiredEquityPercent =
    vcPostMoneyValuation > 0
      ? Math.min(100, (vcMethod.investmentAmount / vcPostMoneyValuation) * 100)
      : 0;

  // Triangulated Average
  const activeMethods = [berkusValuation, scorecardValuation, vcPreMoneyValuation].filter(
    (v) => v > 0
  );
  const triangulatedValuation =
    activeMethods.length > 0
      ? activeMethods.reduce((sum, v) => sum + v, 0) / activeMethods.length
      : 0;

  return {
    berkusValuation: Math.round(berkusValuation),
    scorecardValuation: Math.round(scorecardValuation),
    vcPreMoneyValuation: Math.round(vcPreMoneyValuation),
    vcPostMoneyValuation: Math.round(vcPostMoneyValuation),
    triangulatedValuation: Math.round(triangulatedValuation),
    vcRequiredEquityPercent: Number(vcRequiredEquityPercent.toFixed(1)),
  };
}

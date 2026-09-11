/**
 * Rule of 72 & Compound Doubling Engine
 * Compares Rule of 72 heuristic approximation (72 / r) with exact logarithmic compounding:
 * Exact Years = ln(2) / ln(1 + r/100)
 */

export interface RuleOf72Inputs {
  interestRate: number; // Annual rate of return (%)
  initialInvestment?: number; // Starting principal ($)
}

export interface DoublingMilestone {
  doublingCount: number;
  multiple: number;
  years: number;
  portfolioValue: number;
}

export interface RuleOf72Result {
  interestRate: number;
  heuristicYears: number;
  exactYears: number;
  variancePercentage: number;
  ruleOf69Years: number;
  ruleOf70Years: number;
  milestones: DoublingMilestone[];
}

export function calculateRuleOf72(inputs: RuleOf72Inputs): RuleOf72Result {
  const { interestRate, initialInvestment = 10000 } = inputs;
  const r = Math.max(0.01, interestRate);
  const principal = Math.max(1, initialInvestment);

  const heuristicYears = Number((72 / r).toFixed(2));
  const ruleOf70Years = Number((70 / r).toFixed(2));
  const ruleOf69Years = Number((69.3 / r + 0.35).toFixed(2));

  // Exact compounding: ln(2) / ln(1 + r/100)
  const exactYears = Number((Math.log(2) / Math.log(1 + r / 100)).toFixed(2));
  const variancePercentage = Number(
    (Math.abs((heuristicYears - exactYears) / exactYears) * 100).toFixed(2)
  );

  const milestones: DoublingMilestone[] = [];
  const doubles = [1, 2, 3, 4, 5, 6];

  for (const d of doubles) {
    const multiple = Math.pow(2, d);
    const yrs = Number((exactYears * d).toFixed(1));
    const val = principal * multiple;
    milestones.push({
      doublingCount: d,
      multiple,
      years: yrs,
      portfolioValue: val,
    });
  }

  return {
    interestRate: r,
    heuristicYears,
    exactYears,
    variancePercentage,
    ruleOf69Years,
    ruleOf70Years,
    milestones,
  };
}

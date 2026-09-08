/** Percent as a decimal. */
export function pct(rate: number) {
  return rate / 100;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type LoanInput = {
  principal: number;
  annualRate: number;
  months: number;
};

export type AmortRow = {
  period: number;
  year: number;
  month: number;
  opening: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  closing: number;
};

export function monthlyRate(annualRate: number) {
  return pct(annualRate) / 12;
}

export function loanEmi({ principal, annualRate, months }: LoanInput) {
  if (principal <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualRate);
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export function loanSchedule(input: LoanInput): {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  rows: AmortRow[];
} {
  const emi = loanEmi(input);
  const r = monthlyRate(input.annualRate);
  const rows: AmortRow[] = [];
  let balance = input.principal;
  let totalInterest = 0;

  for (let i = 1; i <= input.months && balance > 0.005; i++) {
    const opening = balance;
    const interestPaid = opening * r;
    let principalPaid = emi - interestPaid;
    if (principalPaid > opening) principalPaid = opening;
    const payment = principalPaid + interestPaid;
    balance = Math.max(0, opening - principalPaid);
    totalInterest += interestPaid;
    rows.push({
      period: i,
      year: Math.ceil(i / 12),
      month: ((i - 1) % 12) + 1,
      opening,
      payment,
      principalPaid,
      interestPaid,
      closing: balance,
    });
  }

  const totalPayment = input.principal + totalInterest;
  return { emi, totalPayment, totalInterest, rows };
}

export function annualizeSchedule(rows: AmortRow[]) {
  const map = new Map<
    number,
    { year: number; opening: number; principalPaid: number; interestPaid: number; closing: number }
  >();
  for (const row of rows) {
    const existing = map.get(row.year);
    if (!existing) {
      map.set(row.year, {
        year: row.year,
        opening: row.opening,
        principalPaid: row.principalPaid,
        interestPaid: row.interestPaid,
        closing: row.closing,
      });
    } else {
      existing.principalPaid += row.principalPaid;
      existing.interestPaid += row.interestPaid;
      existing.closing = row.closing;
    }
  }
  return [...map.values()];
}

export type SipInput = {
  monthly: number;
  annualRate: number;
  months: number;
  stepUp: number;
  inflation: number;
};

export type YearRow = {
  year: number;
  invested: number;
  interest: number;
  closing: number;
};

export function sipProjection(input: SipInput) {
  const i = monthlyRate(input.annualRate);
  const years = Math.ceil(input.months / 12);
  const rows: YearRow[] = [];
  let corpus = 0;
  let totalInvested = 0;
  let sip = input.monthly;

  for (let y = 0; y < years; y++) {
    const monthsThisYear = Math.min(12, input.months - y * 12);
    let yearInvested = 0;
    let yearInterest = 0;
    for (let m = 0; m < monthsThisYear; m++) {
      corpus += sip;
      yearInvested += sip;
      const growth = corpus * i;
      corpus += growth;
      yearInterest += growth;
    }
    totalInvested += yearInvested;
    rows.push({
      year: y + 1,
      invested: yearInvested,
      interest: yearInterest,
      closing: corpus,
    });
    if (input.stepUp > 0) sip *= 1 + pct(input.stepUp);
  }

  const inflation = pct(input.inflation);
  const yearsExact = input.months / 12;
  const realValue = inflation > 0 ? corpus / Math.pow(1 + inflation, yearsExact) : corpus;

  return {
    maturity: corpus,
    invested: totalInvested,
    gain: corpus - totalInvested,
    realValue,
    rows,
  };
}

export type InvestmentInput = {
  principal: number;
  deposit: number;
  depositAnnual: boolean;
  annualRate: number;
  compoundsPerYear: number;
  months: number;
  stepUp: number;
};

export function investmentProjection(input: InvestmentInput) {
  const n = Math.max(1, input.compoundsPerYear);
  const r = pct(input.annualRate) / n;
  const years = input.months / 12;
  const periods = Math.round(years * n);
  const depositsPerYear = input.depositAnnual ? 1 : 12;
  const depositPerPeriod = (input.deposit * depositsPerYear) / n;

  let balance = input.principal;
  let invested = input.principal;
  let deposit = depositPerPeriod;
  const yearly: YearRow[] = [];
  let yearInvested = 0;
  let yearInterest = 0;
  let yearIndex = 1;

  for (let p = 1; p <= periods; p++) {
    balance += deposit;
    invested += deposit;
    yearInvested += deposit;
    const growth = balance * r;
    balance += growth;
    yearInterest += growth;
    if (p % n === 0 || p === periods) {
      yearly.push({
        year: yearIndex,
        invested: yearInvested,
        interest: yearInterest,
        closing: balance,
      });
      yearInvested = 0;
      yearInterest = 0;
      yearIndex += 1;
      if (input.stepUp > 0) deposit *= 1 + pct(input.stepUp);
    }
  }

  return {
    maturity: balance,
    invested,
    gain: balance - invested,
    rows: yearly,
  };
}

export type PlannerInputs = {
  clientName: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  annualIncome: number;
  incomeGrowth: number;
  annualExpenses: number;
  inflation: number;
  currentCorpus: number;
  monthlySip: number;
  sipStepUp: number;
  annualLumpSum: number;
  preReturn: number;
  postReturn: number;
  emergencyFund: number;
  emergencyMonths: number;
  totalDebt: number;
  annualDebtPayment: number;
  annualRetirementIncome: number;
};

export const DEFAULT_PLANNER: PlannerInputs = {
  clientName: "Valued Client",
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  annualIncome: 2_040_000,
  incomeGrowth: 7,
  annualExpenses: 600_000,
  inflation: 7,
  currentCorpus: 500_000,
  monthlySip: 40_000,
  sipStepUp: 10,
  annualLumpSum: 0,
  preReturn: 9,
  postReturn: 7,
  emergencyFund: 300_000,
  emergencyMonths: 6,
  totalDebt: 0,
  annualDebtPayment: 0,
  annualRetirementIncome: 0,
};

export type AccumulationRow = {
  year: number;
  age: number;
  income: number;
  expenses: number;
  annualContribution: number;
  openingCorpus: number;
  investmentGrowth: number;
  closingCorpus: number;
  savingsRate: number;
};

export type WithdrawalRow = {
  year: number;
  age: number;
  expenses: number;
  retirementIncome: number;
  withdrawal: number;
  openingCorpus: number;
  growth: number;
  closingCorpus: number;
};

export function accumulate(inputs: PlannerInputs, override?: Partial<PlannerInputs>) {
  const r = { ...inputs, ...override };
  const years = Math.max(0, r.retirementAge - r.currentAge);
  const monthlyI = Math.pow(1 + pct(r.preReturn), 1 / 12) - 1;
  const rows: AccumulationRow[] = [];
  let corpus = r.currentCorpus;
  let income = r.annualIncome;
  let expenses = r.annualExpenses;
  let totalContributions = 0;
  let totalGrowth = 0;

  for (let y = 0; y < years; y++) {
    const opening = corpus;
    const sip = r.monthlySip * Math.pow(1 + pct(r.sipStepUp), y);
    let contrib = 0;
    let growth = 0;
    for (let m = 0; m < 12; m++) {
      corpus += sip;
      contrib += sip;
      const g = corpus * monthlyI;
      corpus += g;
      growth += g;
    }
    if (r.annualLumpSum > 0) {
      corpus += r.annualLumpSum;
      contrib += r.annualLumpSum;
    }
    totalContributions += contrib;
    totalGrowth += growth;
    const surplus = income - expenses - r.annualDebtPayment;
    rows.push({
      year: y + 1,
      age: r.currentAge + y + 1,
      income,
      expenses,
      annualContribution: contrib,
      openingCorpus: opening,
      investmentGrowth: growth,
      closingCorpus: corpus,
      savingsRate: income > 0 ? surplus / income : 0,
    });
    income *= 1 + pct(r.incomeGrowth);
    expenses *= 1 + pct(r.inflation);
  }

  return { rows, finalCorpus: corpus, totalContributions, totalGrowth };
}

export function withdraw(
  startCorpus: number,
  startExpense: number,
  inputs: PlannerInputs,
  override?: Partial<Pick<PlannerInputs, "postReturn" | "inflation">>,
) {
  const post = override?.postReturn ?? inputs.postReturn;
  const inf = override?.inflation ?? inputs.inflation;
  const years = Math.max(0, inputs.lifeExpectancy - inputs.retirementAge);
  const rows: WithdrawalRow[] = [];
  let corpus = startCorpus;
  let expenses = startExpense;
  const yearsToRet = Math.max(0, inputs.retirementAge - inputs.currentAge);
  let retirementIncome =
    inputs.annualRetirementIncome > 0
      ? inputs.annualRetirementIncome * Math.pow(1 + pct(inf), yearsToRet)
      : 0;
  let depletionAge: number | null = null;

  for (let y = 0; y < years; y++) {
    const opening = corpus;
    const take = Math.max(0, expenses - retirementIncome);
    const growth = corpus * pct(post);
    corpus = corpus + growth - take;
    if (corpus < 0 && depletionAge === null) {
      depletionAge = inputs.retirementAge + y + 1;
      corpus = 0;
    }
    rows.push({
      year: y + 1,
      age: inputs.retirementAge + y + 1,
      expenses,
      retirementIncome,
      withdrawal: take,
      openingCorpus: opening,
      growth,
      closingCorpus: corpus,
    });
    expenses *= 1 + pct(inf);
    retirementIncome *= 1 + pct(inf);
  }

  return { rows, depletionAge, endCorpus: corpus };
}

export function requiredCorpus(
  startExpense: number,
  inputs: PlannerInputs,
  override?: Partial<Pick<PlannerInputs, "postReturn" | "inflation">>,
) {
  let lo = 0;
  let hi = Math.max(startExpense * 5, 1);
  for (let i = 0; i < 60; i++) {
    const { endCorpus, depletionAge } = withdraw(hi, startExpense, inputs, override);
    if (depletionAge === null && endCorpus >= 0) break;
    hi *= 2;
  }
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const { endCorpus, depletionAge } = withdraw(mid, startExpense, inputs, override);
    if (depletionAge === null && endCorpus >= 0) hi = mid;
    else lo = mid;
    if (hi - lo < 1) break;
  }
  return hi;
}

export function requiredSip(targetCorpus: number, inputs: PlannerInputs) {
  const fv = (sip: number) => accumulate(inputs, { monthlySip: sip }).finalCorpus;
  if (fv(inputs.monthlySip) >= targetCorpus) return inputs.monthlySip;
  let lo = 0;
  let hi = Math.max(inputs.monthlySip * 2, 1000);
  for (let i = 0; i < 60 && fv(hi) < targetCorpus; i++) hi *= 2;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (fv(mid) >= targetCorpus) hi = mid;
    else lo = mid;
    if (hi - lo < 1) break;
  }
  return hi;
}

export function earliestIndependenceAge(inputs: PlannerInputs) {
  for (let age = inputs.currentAge + 1; age <= inputs.lifeExpectancy; age++) {
    const trial = { ...inputs, retirementAge: age };
    const projected = accumulate(trial).finalCorpus;
    const expense =
      inputs.annualExpenses * Math.pow(1 + pct(inputs.inflation), age - inputs.currentAge);
    const need = requiredCorpus(expense, trial);
    if (projected >= need) return age;
  }
  return null;
}

export function trackLabel(ratio: number) {
  if (ratio >= 1.1) return "Excellent";
  if (ratio >= 1) return "On Track";
  if (ratio >= 0.8) return "Borderline";
  return "Shortfall";
}

export function fundedLabel(ratio: number) {
  if (ratio >= 1) return "Fully funded";
  if (ratio >= 0.75) return "Almost funded";
  if (ratio >= 0.5) return "Needs improvement";
  return "Underfunded";
}

export function buildPlan(inputs: PlannerInputs) {
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const retirementYears = Math.max(0, inputs.lifeExpectancy - inputs.retirementAge);
  const annualInvest = inputs.monthlySip * 12 + inputs.annualLumpSum;
  const annualSavings = inputs.annualIncome - inputs.annualExpenses - inputs.annualDebtPayment;
  const savingsRate = inputs.annualIncome > 0 ? annualSavings / inputs.annualIncome : 0;
  const investmentRate = inputs.annualIncome > 0 ? annualInvest / inputs.annualIncome : 0;
  const expenseRatio = inputs.annualIncome > 0 ? inputs.annualExpenses / inputs.annualIncome : 0;
  const cashFlowDeficit = annualSavings < 0;
  const monthlyExpense = inputs.annualExpenses / 12;
  const emergencyMonths = inputs.emergencyMonths > 0 ? inputs.emergencyMonths : 6;
  const requiredEmergencyFund = monthlyExpense * emergencyMonths;
  const emergencyCoverage = requiredEmergencyFund > 0 ? inputs.emergencyFund / requiredEmergencyFund : 0;
  const debtToIncome = inputs.annualIncome > 0 ? inputs.totalDebt / inputs.annualIncome : 0;

  const acc = accumulate(inputs);
  const firstYearRetirementExpense =
    inputs.annualExpenses * Math.pow(1 + pct(inputs.inflation), yearsToRetirement);
  const need = requiredCorpus(firstYearRetirementExpense, inputs);
  const ret = withdraw(acc.finalCorpus, firstYearRetirementExpense, inputs);
  const surplusOrShortfall = acc.finalCorpus - need;
  const fundingRatio = need > 0 ? acc.finalCorpus / need : 0;
  const sipNeed = requiredSip(need, inputs);
  const monthlySipGap = Math.max(0, sipNeed - inputs.monthlySip);
  const financialIndependenceAge = earliestIndependenceAge(inputs);

  const scenarios = (
    [
      {
        key: "conservative",
        label: "Conservative",
        pre: Math.max(1, inputs.preReturn - 3),
        post: Math.max(1, inputs.postReturn - 2),
      },
      { key: "base", label: "Base", pre: inputs.preReturn, post: inputs.postReturn },
      {
        key: "optimistic",
        label: "Optimistic",
        pre: inputs.preReturn + 3,
        post: inputs.postReturn + 2,
      },
    ] as const
  ).map((s) => {
    const projected = accumulate(inputs, { preReturn: s.pre }).finalCorpus;
    const required = requiredCorpus(firstYearRetirementExpense, inputs, { postReturn: s.post });
    const { depletionAge } = withdraw(projected, firstYearRetirementExpense, inputs, {
      postReturn: s.post,
    });
    return {
      key: s.key,
      label: s.label,
      preReturn: s.pre,
      postReturn: s.post,
      projectedCorpus: projected,
      requiredCorpus: required,
      fundingRatio: required > 0 ? projected / required : 0,
      depletionAge,
    };
  });

  const health = [
    { label: "Retirement readiness", score: clamp(fundingRatio, 0, 1.2) / 1.2, weight: 0.35 },
    { label: "Savings rate", score: clamp(savingsRate / 0.3, 0, 1), weight: 0.15 },
    { label: "Emergency fund", score: clamp(emergencyCoverage, 0, 1), weight: 0.1 },
    { label: "Debt burden", score: 1 - clamp(debtToIncome / 0.4, 0, 1), weight: 0.1 },
    { label: "Investment rate", score: clamp(investmentRate / 0.25, 0, 1), weight: 0.1 },
    { label: "Cash-flow stability", score: cashFlowDeficit ? 0 : 1, weight: 0.1 },
    { label: "Diversification", score: clamp(investmentRate / 0.25, 0, 1), weight: 0.1 },
  ];
  const financialHealth = health.reduce((s, h) => s + h.score * h.weight, 0) * 100;

  const recommendations: { id: string; title: string; detail: string }[] = [];
  if (fundingRatio >= 1) {
    recommendations.push({
      id: "on-track",
      title: "You are on track under these assumptions",
      detail:
        "Projected corpus meets or exceeds the required corpus. Keep investing and re-check yearly.",
    });
  } else {
    if (monthlySipGap > 0) {
      recommendations.push({
        id: "increase-sip",
        title: `Increase monthly SIP by about ${Math.round(monthlySipGap).toLocaleString("en-IN")}`,
        detail: `Raising SIP from ${Math.round(inputs.monthlySip).toLocaleString("en-IN")} closes the corpus gap under current returns.`,
      });
    }
    if (financialIndependenceAge && financialIndependenceAge > inputs.retirementAge) {
      recommendations.push({
        id: "delay",
        title: `Consider retiring at ${financialIndependenceAge} instead of ${inputs.retirementAge}`,
        detail: "A later retirement age lets contributions and compounding close the shortfall.",
      });
    }
    if (emergencyCoverage < 1) {
      recommendations.push({
        id: "emergency",
        title: "Build the emergency fund to six months of expenses",
        detail: "A fully funded cash buffer keeps you from interrupting SIPs during shocks.",
      });
    }
  }

  return {
    yearsToRetirement,
    retirementYears,
    annualSavings,
    savingsRate,
    investmentRate,
    expenseRatio,
    cashFlowDeficit,
    requiredEmergencyFund,
    emergencyCoverage,
    debtToIncome,
    accumulation: acc.rows,
    projectedCorpus: acc.finalCorpus,
    totalContributions: acc.totalContributions,
    totalGrowth: acc.totalGrowth,
    firstYearRetirementExpense,
    requiredCorpus: need,
    retirement: ret.rows,
    depletionAge: ret.depletionAge,
    surplusOrShortfall,
    fundingRatio,
    sustainabilityStatus: trackLabel(fundingRatio),
    requiredMonthlySip: sipNeed,
    monthlySipGap,
    financialIndependenceAge,
    scenarios,
    financialHealth,
    healthBreakdown: health.map((h) => ({ ...h, score: h.score * 100 })),
    recommendations,
  };
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

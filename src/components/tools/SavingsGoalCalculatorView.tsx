import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateSavingsGoal, SavingsGoalInput } from '../../lib/financial/savingsGoal';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  Target, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  Info
} from 'lucide-react';

interface SavingsGoalCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const SavingsGoalCalculatorView: React.FC<SavingsGoalCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('savings-goal-calculator');

  const [inputs, setInputs] = useState<SavingsGoalInput>({
    targetGoalAmount: 50000,
    initialSavings: 5000,
    timeHorizonYears: 3,
    expectedAnnualReturnRate: 6.0,
  });

  const result = useMemo(() => calculateSavingsGoal(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      targetGoalAmount: 50000,
      initialSavings: 5000,
      timeHorizonYears: 3,
      expectedAnnualReturnRate: 6.0,
    });
  };

  const handleCopy = () => {
    const text = `Savings Goal Plan - CodePackr Finance\n` +
      `Target Goal: ${formatAmount(result.targetGoalAmount)}\n` +
      `Initial Seed Savings: ${formatAmount(result.initialSavings)}\n` +
      `Time Horizon: ${inputs.timeHorizonYears} Years\n` +
      `Required Monthly Savings: ${formatAmount(result.requiredMonthlySavings)}\n` +
      `Required Annual Savings: ${formatAmount(result.requiredAnnualSavings)}\n` +
      `Your Contributions: ${formatAmount(result.totalSelfContributed)}\n` +
      `Interest Earned Boost: ${formatAmount(result.totalInterestEarned)} (${result.interestSharePercent}% of goal)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Milestone', 'Target Amount', 'Estimated Month', 'Estimated Year'],
      ...result.milestones.map(m => [m.label, m.amount, `Month ${m.estimatedMonth}`, `Year ${m.estimatedYear}`]),
      ['Total Target Goal', result.targetGoalAmount, '-', '-'],
      ['Required Monthly Deposit', result.requiredMonthlySavings, '-', '-'],
      ['Self Contributed', result.totalSelfContributed, '-', '-'],
      ['Interest Earned', result.totalInterestEarned, '-', '-'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `savings_goal_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="savings-goal-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Milestone & Target Planning
          </span>
          <span className="text-xs text-[var(--muted)]">Reverse Annuity Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="goal-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="goal-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="goal-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Plan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--brand)]" />
              Target Goal Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="goal-target" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Target Corpus / Purchase Amount ({currencyCode})
                </label>
                <input
                  id="goal-target"
                  type="number"
                  min="100"
                  step="1000"
                  value={inputs.targetGoalAmount || ''}
                  onChange={(e) => setInputs({ ...inputs, targetGoalAmount: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div>
                <label htmlFor="goal-initial" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Existing Savings / Seed Capital ({currencyCode})
                </label>
                <input
                  id="goal-initial"
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.initialSavings || ''}
                  onChange={(e) => setInputs({ ...inputs, initialSavings: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-tenure" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Timeline (Years)
                  </label>
                  <input
                    id="goal-tenure"
                    type="number"
                    min="0.25"
                    max="30"
                    step="0.5"
                    value={inputs.timeHorizonYears || ''}
                    onChange={(e) => setInputs({ ...inputs, timeHorizonYears: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="goal-rate" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Expected Return (% p.a.)
                  </label>
                  <input
                    id="goal-rate"
                    type="number"
                    min="0"
                    max="25"
                    step="0.5"
                    value={inputs.expectedAnnualReturnRate || ''}
                    onChange={(e) => setInputs({ ...inputs, expectedAnnualReturnRate: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acceleration Insight */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
            <span className="text-xs font-semibold text-[var(--brand)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Reach Goal 1 Year Faster
            </span>
            <p className="text-xs text-[var(--muted)]">
              By increasing your monthly savings by just <strong className="text-[var(--ink)] font-mono">{formatAmount(result.reachEarlyScenario.extraMonthlyNeeded)}/month</strong>, you can cross your target finish line 12 months ahead of schedule.
            </p>
          </div>
        </div>

        {/* Right Column: Required Action & Milestones */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Required Monthly Savings
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--brand)] tracking-tight">
                    {formatAmount(result.requiredMonthlySavings)}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">/ month</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {formatAmount(result.requiredAnnualSavings)}/year
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Your Direct Contribution</span>
                <span className="text-lg font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.totalSelfContributed)}</span>
                <span className="text-[10px] text-[var(--muted)]">Initial + Monthly cash</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-emerald-500 font-medium block">Interest Boost</span>
                <span className="text-lg font-bold text-emerald-500 mt-0.5 block">+{formatAmount(result.totalInterestEarned)}</span>
                <span className="text-[10px] text-[var(--muted)]">{result.interestSharePercent}% funded by growth</span>
              </div>
            </div>
          </div>

          {/* Milestones Card */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Goal Completion Milestones
            </h3>
            <div className="space-y-2.5">
              {result.milestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${m.percent === 100 ? 'text-emerald-500' : 'text-[var(--brand)]'}`} />
                    <div>
                      <span className="font-semibold text-[var(--ink)] block">{m.label} ({m.percent}%)</span>
                      <span className="text-[11px] text-[var(--muted)]">Month {m.estimatedMonth} (Year {m.estimatedYear})</span>
                    </div>
                  </div>
                  <span className="font-bold text-[var(--ink)] font-mono">{formatAmount(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

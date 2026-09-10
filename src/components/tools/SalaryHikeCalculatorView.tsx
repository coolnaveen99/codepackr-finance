import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateSalaryHike, SalaryHikeInput } from '../../lib/financial/salaryHike';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  Briefcase, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface SalaryHikeCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const SalaryHikeCalculatorView: React.FC<SalaryHikeCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('salary-hike-calculator');

  const [inputs, setInputs] = useState<SalaryHikeInput>({
    currentSalary: 1200000,
    salaryPeriod: 'annual',
    hikeType: 'percentage',
    hikePercentage: 20,
    offeredSalary: 1440000,
    inflationRate: 5.5,
  });

  const result = useMemo(() => calculateSalaryHike(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      currentSalary: 1200000,
      salaryPeriod: 'annual',
      hikeType: 'percentage',
      hikePercentage: 20,
      offeredSalary: 1440000,
      inflationRate: 5.5,
    });
  };

  const handleCopy = () => {
    const text = `Salary Hike & Increment Summary - CodePackr Finance\n` +
      `Current Annual Salary: ${formatAmount(result.currentAnnualSalary)} (${formatAmount(result.currentMonthlySalary)}/mo)\n` +
      `Hike Percentage: ${result.hikePercentage}%\n` +
      `New Annual Salary: ${formatAmount(result.newAnnualSalary)} (${formatAmount(result.newMonthlySalary)}/mo)\n` +
      `Annual Increment: +${formatAmount(result.absoluteAnnualHike)}\n` +
      `Monthly In-Hand Boost: +${formatAmount(result.absoluteMonthlyHike)}/mo\n` +
      `Real Hike (Inflation-Adjusted): ${result.realHikePercentage}%\n` +
      `Assessment: ${result.hikeTierLabel}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Current', 'New (After Hike)', 'Delta / Increase'],
      ['Annual CTC / Salary', result.currentAnnualSalary, result.newAnnualSalary, result.absoluteAnnualHike],
      ['Monthly Gross Salary', result.currentMonthlySalary, result.newMonthlySalary, result.absoluteMonthlyHike],
      ['Nominal Hike %', '-', `${result.hikePercentage}%`, '-'],
      ['Real Hike % (Inflation-Adjusted)', '-', `${result.realHikePercentage}%`, '-'],
      ['Increment Tier', '-', result.hikeTierLabel, '-'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `salary_hike_assessment_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="salary-hike-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Career & Compensation
          </span>
          <span className="text-xs text-[var(--muted)]">Increment Evaluation</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="hike-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="hike-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="hike-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--brand)]" />
                Current Compensation
              </h2>
              <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
                <button
                  onClick={() => setInputs({ ...inputs, salaryPeriod: 'annual' })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                    inputs.salaryPeriod === 'annual' ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  Annual CTC
                </button>
                <button
                  onClick={() => setInputs({ ...inputs, salaryPeriod: 'monthly' })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                    inputs.salaryPeriod === 'monthly' ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  Monthly Pay
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="hike-current-salary" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Current {inputs.salaryPeriod === 'annual' ? 'Annual Salary / CTC' : 'Monthly Gross Pay'} ({currencyCode})
                </label>
                <input
                  id="hike-current-salary"
                  type="number"
                  min="0"
                  step="10000"
                  value={inputs.currentSalary || ''}
                  onChange={(e) => setInputs({ ...inputs, currentSalary: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              {/* Hike Calculation Mode */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-2">Calculation Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputs({ ...inputs, hikeType: 'percentage' })}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      inputs.hikeType === 'percentage'
                        ? 'bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    Hike Percentage (%)
                  </button>
                  <button
                    onClick={() => setInputs({ ...inputs, hikeType: 'new_salary' })}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      inputs.hikeType === 'new_salary'
                        ? 'bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    New Offered Salary
                  </button>
                </div>
              </div>

              {inputs.hikeType === 'percentage' ? (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="hike-pct-range" className="text-xs font-medium text-[var(--muted)]">
                      Hike Percentage (%)
                    </label>
                    <span className="text-sm font-bold text-[var(--brand)] font-mono">{inputs.hikePercentage}%</span>
                  </div>
                  <input
                    id="hike-pct-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={inputs.hikePercentage}
                    onChange={(e) => setInputs({ ...inputs, hikePercentage: Number(e.target.value) })}
                    className="w-full accent-[var(--brand)] cursor-pointer"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="hike-offered-input" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    New Offered {inputs.salaryPeriod === 'annual' ? 'Annual Salary' : 'Monthly Salary'} ({currencyCode})
                  </label>
                  <input
                    id="hike-offered-input"
                    type="number"
                    min="0"
                    step="10000"
                    value={inputs.offeredSalary || ''}
                    onChange={(e) => setInputs({ ...inputs, offeredSalary: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              )}

              <div>
                <label htmlFor="hike-inflation" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Expected Benchmark Inflation (% p.a.)
                </label>
                <input
                  id="hike-inflation"
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={inputs.inflationRate || ''}
                  onChange={(e) => setInputs({ ...inputs, inflationRate: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Outcomes & Real Purchasing Power */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  New Compensation Package
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
                    {formatAmount(result.newAnnualSalary)}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">/ year</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                +{result.hikePercentage}% Hike
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Monthly In-Hand Boost</span>
                <span className="text-xl font-bold text-emerald-500 mt-0.5 block">+{formatAmount(result.absoluteMonthlyHike)}</span>
                <span className="text-[10px] text-[var(--muted)]">Per month gross</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Annual Gross Increase</span>
                <span className="text-xl font-bold text-[var(--ink)] mt-0.5 block">+{formatAmount(result.absoluteAnnualHike)}</span>
                <span className="text-[10px] text-[var(--muted)]">Annualized raise</span>
              </div>

              <div className="col-span-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">Real Purchasing Power Gain</span>
                  <span className="text-xs text-[var(--muted)]">Adjusted for {inputs.inflationRate}% inflation</span>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {result.realHikePercentage > 0 ? `+${result.realHikePercentage}%` : `${result.realHikePercentage}%`}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between">
              <span className="text-xs text-[var(--muted)] font-medium">Market Appraisal Rating</span>
              <span className="text-xs font-bold text-[var(--brand)]">{result.hikeTierLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

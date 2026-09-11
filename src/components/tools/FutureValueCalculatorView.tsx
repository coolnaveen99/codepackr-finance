import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateFutureValue, FutureValueInput, CompoundingFrequency, DepositTiming } from '../../lib/financial/futureValue';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { FinancialInteractiveChart, ChartDataPoint } from '../charts/FinancialInteractiveChart';
import { 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  Sparkles,
  Layers,
  Info
} from 'lucide-react';

interface FutureValueCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const FutureValueCalculatorView: React.FC<FutureValueCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('future-value-calculator');

  const [inputs, setInputs] = useState<FutureValueInput>({
    presentValue: 20000,
    periodicDeposit: 500,
    depositFrequency: 'monthly',
    annualInterestRate: 8.0,
    compoundingFrequency: 'monthly',
    timeHorizonYears: 10,
    depositTiming: 'end',
  });

  const result = useMemo(() => calculateFutureValue(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      presentValue: 20000,
      periodicDeposit: 500,
      depositFrequency: 'monthly',
      annualInterestRate: 8.0,
      compoundingFrequency: 'monthly',
      timeHorizonYears: 10,
      depositTiming: 'end',
    });
  };

  const handleCopy = () => {
    const text = `Time Value of Money (TVM) Future Value - CodePackr Finance\n` +
      `Present Value (Starting Principal): ${formatAmount(result.presentValue)}\n` +
      `Periodic Deposit: ${formatAmount(inputs.periodicDeposit)} (${inputs.depositFrequency})\n` +
      `Annual Interest Rate: ${inputs.annualInterestRate}%\n` +
      `Compounding Frequency: ${inputs.compoundingFrequency}\n` +
      `Time Horizon: ${inputs.timeHorizonYears} Years\n` +
      `Total Principal Contributed: ${formatAmount(result.totalPrincipalContributed)}\n` +
      `Total Interest Earned: ${formatAmount(result.totalInterestEarned)}\n` +
      `Future Value (Maturity Corpus): ${formatAmount(result.futureValue)}\n` +
      `Wealth Multiple: ${result.wealthMultiple}x`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Year', 'Total Principal Deposited', 'Interest Earned This Year', 'Cumulative Interest', 'Total Ending Balance'],
      ...result.yearlySchedule.map(y => [
        y.year,
        y.totalDeposited,
        y.interestEarnedYear,
        y.totalInterestEarned,
        y.balance,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `future_value_projection_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    const points: ChartDataPoint[] = [
      {
        label: 'Year 0',
        year: 0,
        series1: Math.round(inputs.presentValue),
        series2: Math.round(inputs.presentValue),
      },
    ];

    result.yearlySchedule.forEach((row) => {
      points.push({
        label: `Year ${row.year}`,
        year: row.year,
        series1: Math.round(row.balance),
        series2: Math.round(inputs.presentValue + row.totalDeposited),
      });
    });

    return points;
  }, [inputs.presentValue, result.yearlySchedule]);

  return (
    <div id="future-value-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Financial Mathematics
          </span>
          <span className="text-xs text-[var(--muted)]">Time Value of Money (TVM)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="fv-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="fv-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="fv-export-btn"
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
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--brand)]" />
              Cash Flow Parameters
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="fv-pv" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Initial Present Value (Starting Balance) ({currencyCode})
                </label>
                <input
                  id="fv-pv"
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.presentValue || ''}
                  onChange={(e) => setInputs({ ...inputs, presentValue: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fv-pmt" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Periodic Deposit ({currencyCode})
                  </label>
                  <input
                    id="fv-pmt"
                    type="number"
                    min="0"
                    step="50"
                    value={inputs.periodicDeposit || ''}
                    onChange={(e) => setInputs({ ...inputs, periodicDeposit: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="fv-freq" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Deposit Frequency
                  </label>
                  <select
                    id="fv-freq"
                    value={inputs.depositFrequency}
                    onChange={(e) => setInputs({ ...inputs, depositFrequency: e.target.value as 'monthly' | 'annually' })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fv-rate" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Annual Interest Rate (% p.a.)
                  </label>
                  <input
                    id="fv-rate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={inputs.annualInterestRate || ''}
                    onChange={(e) => setInputs({ ...inputs, annualInterestRate: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="fv-compound" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Compounding Frequency
                  </label>
                  <select
                    id="fv-compound"
                    value={inputs.compoundingFrequency}
                    onChange={(e) => setInputs({ ...inputs, compoundingFrequency: e.target.value as CompoundingFrequency })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  >
                    <option value="monthly">Monthly (12/yr)</option>
                    <option value="quarterly">Quarterly (4/yr)</option>
                    <option value="semi-annually">Semi-Annually (2/yr)</option>
                    <option value="annually">Annually (1/yr)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fv-tenure" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Time Period (Years)
                  </label>
                  <input
                    id="fv-tenure"
                    type="number"
                    min="0.5"
                    max="50"
                    step="1"
                    value={inputs.timeHorizonYears || ''}
                    onChange={(e) => setInputs({ ...inputs, timeHorizonYears: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="fv-timing" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Payment Timing
                  </label>
                  <select
                    id="fv-timing"
                    value={inputs.depositTiming || 'end'}
                    onChange={(e) => setInputs({ ...inputs, depositTiming: e.target.value as DepositTiming })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  >
                    <option value="end">End of Period (Ordinary)</option>
                    <option value="beginning">Beginning of Period (Due)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {formulaMeta && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--brand)]" />
                Discrete TVM Equation
              </span>
              <p className="text-xs font-mono text-[var(--ink)] bg-[var(--bg)] p-2 rounded-lg border border-[var(--line)]">
                {formulaMeta.formulaText}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Results & Schedule */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Calculated Future Value
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--ink)] tracking-tight">
                    {formatAmount(result.futureValue)}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 font-mono">
                {result.wealthMultiple}x Multiplier
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Total Out-of-Pocket</span>
                <span className="text-lg font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.totalPrincipalContributed)}</span>
                <span className="text-[10px] text-[var(--muted)]">PV + recurring deposits</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-emerald-500 font-medium block">Total Interest Accrued</span>
                <span className="text-lg font-bold text-emerald-500 mt-0.5 block">+{formatAmount(result.totalInterestEarned)}</span>
                <span className="text-[10px] text-[var(--muted)]">Compounded gains</span>
              </div>
            </div>
          </div>

          {/* Multi-View Interactive Chart (Investor.gov Line Chart as default, with Donut, Area, and Bar options) */}
          <FinancialInteractiveChart
            id="future-value-interactive-chart"
            title="Future Value Growth Projection & Capital Formation"
            subtitle={`Initial ${formatAmount(inputs.presentValue)} plus ${formatAmount(inputs.periodicDeposit)}/${inputs.depositFrequency} over ${inputs.timeHorizonYears} years at ${inputs.annualInterestRate}% p.a.`}
            series1Name="Future Value (Maturity Corpus)"
            series2Name="Total Out-of-Pocket Contributed"
            series1Color="#B83A24"
            series2Color="#388E8E"
            data={chartData}
            donutSegments={[
              {
                label: 'Principal Contributed',
                value: result.totalPrincipalContributed,
                color: 'var(--brand)',
                percentage: result.futureValue > 0 ? (result.totalPrincipalContributed / result.futureValue) * 100 : 0,
                sublabel: 'PV + total periodic deposits',
              },
              {
                label: 'Compound Interest',
                value: result.totalInterestEarned,
                color: '#10b981',
                percentage: result.futureValue > 0 ? (result.totalInterestEarned / result.futureValue) * 100 : 0,
                sublabel: 'Compounded returns earned',
              },
            ]}
            centerLabel="Maturity Corpus"
            centerValue={formatAmount(result.futureValue)}
            centerSub={`${result.wealthMultiple}x Wealth Multiple`}
            yAxisLabel="Portfolio Balance"
            defaultChartType="line"
          />

          {/* Schedule Preview */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              Compounded Balance Schedule
            </h3>
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {result.yearlySchedule.map((row) => (
                <div key={row.year} className="flex items-center justify-between py-1 border-b border-[var(--line)] last:border-0">
                  <span className="text-[var(--muted)]">Year {row.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-500 font-medium">+{formatAmount(row.totalInterestEarned)}</span>
                    <span className="text-[var(--ink)] font-bold">{formatAmount(row.balance)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

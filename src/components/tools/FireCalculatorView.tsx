import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Flame, CheckCircle2, Download, Check } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateFire, FIRE_ENGINE_VERSION } from '../../lib/financial/fire';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { FinancialInteractiveChart, ChartDataPoint } from '../charts/FinancialInteractiveChart';

interface FireCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const FireCalculatorView: React.FC<FireCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('fire');

  const [currentAgeStr, setCurrentAgeStr] = useState('30');
  const [annualExpensesStr, setAnnualExpensesStr] = useState('1200000');
  const [currentNetWorthStr, setCurrentNetWorthStr] = useState('3000000');
  const [annualSavingsStr, setAnnualSavingsStr] = useState('800000');
  const [annualReturnStr, setAnnualReturnStr] = useState('11.0');
  const [inflationStr, setInflationStr] = useState('6.0');
  const [swrStr, setSwrStr] = useState('4.0');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const currentAge = parseFloat(currentAgeStr) || 30;
  const currentAnnualExpenses = parseFloat(annualExpensesStr) || 0;
  const currentNetWorth = parseFloat(currentNetWorthStr) || 0;
  const annualSavings = parseFloat(annualSavingsStr) || 0;
  const expectedAnnualReturn = parseFloat(annualReturnStr) || 10;
  const expectedInflation = parseFloat(inflationStr) || 6;
  const safeWithdrawalRate = parseFloat(swrStr) || 4;

  const result = useMemo(() => {
    return calculateFire({
      currentAge,
      currentAnnualExpenses,
      currentNetWorth,
      annualSavings,
      expectedAnnualReturn,
      expectedInflation,
      safeWithdrawalRate,
    });
  }, [currentAge, currentAnnualExpenses, currentNetWorth, annualSavings, expectedAnnualReturn, expectedInflation, safeWithdrawalRate]);

  const handleReset = () => {
    setCurrentAgeStr('30');
    setAnnualExpensesStr('1200000');
    setCurrentNetWorthStr('3000000');
    setAnnualSavingsStr('800000');
    setAnnualReturnStr('11.0');
    setInflationStr('6.0');
    setSwrStr('4.0');
  };

  const handleExportCsv = () => {
    let csv = 'Year,Age,Projected Portfolio (Constant Value),Target FIRE Corpus,FIRE Status\n';
    result.trajectory.forEach((t) => {
      csv += `${t.year},${t.age},${t.corpus.toFixed(2)},${t.fireTarget.toFixed(2)},${t.isFireReached ? 'Achieved' : 'Accumulating'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fire-plan-${currentAge}-to-fi.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    return result.trajectory.map((t) => ({
      label: `Age ${t.age}`,
      year: t.year,
      series1: Math.round(t.corpus),
      series2: Math.round(t.fireTarget),
    }));
  }, [result.trajectory]);

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency Toolbar */}
        <div
          className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Active Currency:
            </span>
            <span className="text-xs font-mono font-bold text-[var(--brand)] flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--brand)]/10">
              <span>{currency.flag}</span>
              <span>
                {currency.code} ({currency.symbol.trim()})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <CurrencySelector idPrefix="fire-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              CURRENT AGE
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={currentAgeStr}
              onChange={(e) => handleCleanInput(e.target.value, setCurrentAgeStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ANNUAL LIVING EXPENSES ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualExpensesStr}
              onChange={(e) => handleCleanInput(e.target.value, setAnnualExpensesStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              CURRENT INVESTED NET WORTH ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={currentNetWorthStr}
              onChange={(e) => handleCleanInput(e.target.value, setCurrentNetWorthStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ANNUAL SAVINGS ADDED ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualSavingsStr}
              onChange={(e) => handleCleanInput(e.target.value, setAnnualSavingsStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* Economic Assumptions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              EXPECTED ANNUAL RETURN (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualReturnStr}
              onChange={(e) => handleCleanInput(e.target.value, setAnnualReturnStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              EXPECTED INFLATION (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={inflationStr}
              onChange={(e) => handleCleanInput(e.target.value, setInflationStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              SAFE WITHDRAWAL RATE (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={swrStr}
              onChange={(e) => handleCleanInput(e.target.value, setSwrStr)}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>
        </div>

        {/* Results Highlight Card */}
        <div
          className="p-5 rounded-2xl border space-y-4"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                {result.yearsToFire !== null
                  ? `Financial Independence in ${result.yearsToFire} Years (At Age ${result.ageAtFire})`
                  : 'Accumulating Towards Independence'}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
              Savings Rate: {result.savingsRatePercentage.toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Standard FIRE (25x)
              </div>
              <div className="text-2xl font-black text-[var(--brand)] font-mono">
                {formatAmount(result.standardFireNumber)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Full baseline lifestyle
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Lean FIRE (75%)
              </div>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {formatAmount(result.leanFireNumber)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Minimalist budget
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Fat FIRE (135%)
              </div>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {formatAmount(result.fatFireNumber)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Abundant travel & luxury
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Coast FIRE Target
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatAmount(result.coastFireNumber)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                Needed today for age 60
              </div>
            </div>
          </div>
        </div>

        {/* Multi-View Interactive Chart (Investor.gov Line Chart as default, with Donut, Area, and Bar options) */}
        <FinancialInteractiveChart
          id="fire-interactive-chart"
          title="Financial Independence Trajectory & Milestone Crossover"
          subtitle={`Trajectory from Age ${currentAge} with ${formatAmount(annualSavings)} annual savings and ${expectedAnnualReturn}% return vs inflation-adjusted FIRE target`}
          series1Name="Projected Net Worth"
          series2Name="Standard FIRE Target"
          series1Color="#B83A24"
          series2Color="#388E8E"
          data={chartData}
          donutSegments={[
            {
              label: 'Current Net Worth',
              value: currentNetWorth,
              color: '#10b981',
              percentage: result.standardFireNumber > 0 ? Math.min(100, (currentNetWorth / result.standardFireNumber) * 100) : 0,
              sublabel: 'Accumulated wealth today',
            },
            {
              label: 'Corpus Gap to Standard FI',
              value: Math.max(0, result.standardFireNumber - currentNetWorth),
              color: 'var(--brand)',
              percentage: result.standardFireNumber > 0 ? Math.max(0, 100 - Math.min(100, (currentNetWorth / result.standardFireNumber) * 100)) : 0,
              sublabel: 'Remaining accumulation needed',
            },
          ]}
          centerLabel="Target FI Corpus"
          centerValue={formatAmount(result.standardFireNumber)}
          centerSub={result.yearsToFire !== null ? `${result.yearsToFire} yrs to FI (Age ${result.ageAtFire})` : 'Target unreachable'}
          yAxisLabel="Portfolio Capital"
          defaultChartType="line"
        />

        {/* Trajectory Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
              Projected FI Accumulation Trajectory
            </h3>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:bg-[var(--surface-2)]"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              {copiedCsv ? 'Downloaded CSV' : 'Export CSV'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border max-h-72" style={{ borderColor: 'var(--line)' }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="border-b" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}>
                  <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Year</th>
                  <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Age</th>
                  <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Projected Corpus</th>
                  <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>FIRE Target</th>
                  <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.trajectory.slice(0, 35).map((row) => (
                  <tr
                    key={row.year}
                    className={`border-b ${row.isFireReached ? 'bg-emerald-500/5' : ''}`}
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <td className="py-2 px-3 font-mono">{row.year === 0 ? 'Today' : `Yr ${row.year}`}</td>
                    <td className="py-2 px-3 font-mono">{row.age}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold" style={{ color: 'var(--ink)' }}>
                      {formatAmount(row.corpus)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono" style={{ color: 'var(--muted)' }}>
                      {formatAmount(row.fireTarget)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {row.isFireReached ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">Accumulating</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Card */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'FIRE Target = Annual Expenses * (100 / Safe Withdrawal Rate)'}
            </p>
            <p>
              <strong>Trinity Study Safe Withdrawal:</strong> A 4% withdrawal rate historically sustained retirement portfolios over 30-year horizons with a 50/50 to 75/25 stock/bond allocation. For retirements lasting 40+ years, many practitioners use 3.25% to 3.5%.
            </p>
            <p>
              <strong>Model Version:</strong> {FIRE_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateLoanAmortization, LoanAmortizationInput } from '../../lib/financial/loanAmortization';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { FinancialInteractiveChart, ChartDataPoint } from '../charts/FinancialInteractiveChart';
import { 
  Table, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  PieChart, 
  DollarSign, 
  Calendar,
  Layers,
  Info
} from 'lucide-react';

interface LoanAmortizationCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const LoanAmortizationCalculatorView: React.FC<LoanAmortizationCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly'>('yearly');
  const formulaMeta = getFormulaDefinition('loan-amortization-calculator');

  const [inputs, setInputs] = useState<LoanAmortizationInput>({
    loanAmount: 300000,
    annualInterestRate: 7.0,
    loanTenureYears: 15,
  });

  const result = useMemo(() => calculateLoanAmortization(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      loanAmount: 300000,
      annualInterestRate: 7.0,
      loanTenureYears: 15,
    });
  };

  const handleCopy = () => {
    const text = `Loan Amortization Summary - CodePackr Finance\n` +
      `Principal Loan: ${formatAmount(inputs.loanAmount)}\n` +
      `Monthly EMI: ${formatAmount(result.monthlyEmi)}\n` +
      `Total Interest Payable: ${formatAmount(result.totalInterest)}\n` +
      `Total Payment: ${formatAmount(result.totalPayment)}\n` +
      `Principal Ratio: ${result.principalToInterestRatio}%\n` +
      `Interest Ratio: ${result.interestToPrincipalRatio}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    let rows: (string | number)[][] = [];
    if (activeTab === 'yearly') {
      rows = [
        ['Year', 'Beginning Balance', 'Total EMI Paid', 'Principal Paid', 'Interest Paid', 'Ending Balance', 'Cumulative Interest'],
        ...result.yearlySchedule.map(y => [
          y.year,
          y.beginningBalance,
          y.totalEmiPaid,
          y.principalPaid,
          y.interestPaid,
          y.endingBalance,
          y.cumulativeInterest,
        ]),
      ];
    } else {
      rows = [
        ['Month', 'Year', 'Beginning Balance', 'EMI', 'Principal Paid', 'Interest Paid', 'Ending Balance', 'Cumulative Interest'],
        ...result.monthlySchedule.map(m => [
          m.month,
          m.year,
          m.beginningBalance,
          m.emi,
          m.principalPaid,
          m.interestPaid,
          m.endingBalance,
          m.cumulativeInterest,
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amortization_schedule_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    const points: ChartDataPoint[] = [
      {
        label: 'Year 0',
        year: 0,
        series1: 0,
        series2: 0,
      },
    ];

    let runningPaid = 0;
    let runningPrincipal = 0;

    result.yearlySchedule.forEach((y) => {
      runningPaid += y.totalEmiPaid;
      runningPrincipal += y.principalPaid;
      points.push({
        label: `Year ${y.year}`,
        year: y.year,
        series1: Math.round(runningPaid),
        series2: Math.round(runningPrincipal),
      });
    });

    return points;
  }, [result.yearlySchedule]);

  return (
    <div id="loan-amortization-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Full Schedule Ledger
          </span>
          <span className="text-xs text-[var(--muted)]">Reducing Balance Math</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="amort-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="amort-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="amort-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Input & High-Level Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--brand)]" />
            Loan Parameters
          </h2>

          <div className="space-y-3">
            <div>
              <label htmlFor="amort-principal" className="block text-xs font-medium text-[var(--muted)] mb-1">
                Loan Amount ({currencyCode})
              </label>
              <input
                id="amort-principal"
                type="number"
                min="1000"
                step="5000"
                value={inputs.loanAmount || ''}
                onChange={(e) => setInputs({ ...inputs, loanAmount: Number(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amort-rate" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Interest Rate (% p.a.)
                </label>
                <input
                  id="amort-rate"
                  type="number"
                  min="0.1"
                  max="40"
                  step="0.1"
                  value={inputs.annualInterestRate || ''}
                  onChange={(e) => setInputs({ ...inputs, annualInterestRate: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>
              <div>
                <label htmlFor="amort-tenure" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Loan Tenure (Years)
                </label>
                <input
                  id="amort-tenure"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={inputs.loanTenureYears || ''}
                  onChange={(e) => setInputs({ ...inputs, loanTenureYears: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                />
              </div>
            </div>
          </div>

          {formulaMeta && (
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1">
              <span className="text-[11px] text-[var(--muted)] font-medium block">Amortization Equation</span>
              <p className="text-xs font-mono text-[var(--ink)]">{formulaMeta.formulaText}</p>
            </div>
          )}
        </div>

        {/* Results Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Monthly Installment</span>
            <span className="text-2xl font-extrabold text-[var(--brand)] font-mono">{formatAmount(result.monthlyEmi)}</span>
            <span className="text-[10px] text-[var(--muted)]">{result.totalMonths} payments</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Total Interest</span>
            <span className="text-2xl font-extrabold text-amber-500 font-mono">{formatAmount(result.totalInterest)}</span>
            <span className="text-[10px] text-[var(--muted)]">{result.interestToPrincipalRatio}% of total</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-[var(--muted)]">Total Outlay</span>
            <span className="text-2xl font-extrabold text-[var(--ink)] font-mono">{formatAmount(result.totalPayment)}</span>
            <span className="text-[10px] text-[var(--muted)]">Principal + Interest</span>
          </div>

          {/* Principal vs Interest Ratio Bar */}
          <div className="col-span-2 sm:col-span-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[var(--brand)] font-semibold">Principal: {result.principalToInterestRatio}%</span>
              <span className="text-amber-500 font-semibold">Interest: {result.interestToPrincipalRatio}%</span>
            </div>
            <div className="h-2.5 w-full bg-[var(--line)] rounded-full overflow-hidden flex">
              <div className="h-full bg-[var(--brand)]" style={{ width: `${result.principalToInterestRatio}%` }} />
              <div className="h-full bg-amber-500" style={{ width: `${result.interestToPrincipalRatio}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-View Interactive Chart (Investor.gov Line Chart as default, with Donut, Area, and Bar options) */}
      <FinancialInteractiveChart
        id="amortization-interactive-chart"
        title="Amortization Cumulative Repayment & Interest Accrual"
        subtitle={`Total repayment profile across ${result.totalMonths} monthly installments for loan of ${formatAmount(inputs.loanAmount)}`}
        series1Name="Total Cumulative Paid"
        series2Name="Principal Repaid"
        series1Color="#B83A24"
        series2Color="#388E8E"
        data={chartData}
        donutSegments={[
          {
            label: 'Principal Loan',
            value: inputs.loanAmount,
            color: 'var(--brand)',
            percentage: result.principalToInterestRatio,
            sublabel: 'Borrowed initial amount',
          },
          {
            label: 'Total Interest',
            value: result.totalInterest,
            color: '#f59e0b',
            percentage: result.interestToPrincipalRatio,
            sublabel: 'Total borrowing cost',
          },
        ]}
        centerLabel="Total Outlay"
        centerValue={formatAmount(result.totalPayment)}
        centerSub={`${result.interestToPrincipalRatio}% Interest`}
        yAxisLabel="Cumulative Amount"
        defaultChartType="line"
      />

      {/* Schedule Table Section */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                activeTab === 'yearly'
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Annual Summary
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                activeTab === 'monthly'
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Monthly Ledger
            </button>
          </div>
          <span className="text-xs text-[var(--muted)] font-mono">
            {activeTab === 'yearly' ? `${result.yearlySchedule.length} years` : `${result.monthlySchedule.length} months`}
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-[var(--surface)] border-b border-[var(--line)] text-[var(--muted)]">
              <tr>
                <th className="py-2.5 px-3">{activeTab === 'yearly' ? 'Year' : 'Month'}</th>
                <th className="py-2.5 px-3">Beginning Balance</th>
                <th className="py-2.5 px-3">Total Payment</th>
                <th className="py-2.5 px-3 text-emerald-500">Principal Paid</th>
                <th className="py-2.5 px-3 text-amber-500">Interest Paid</th>
                <th className="py-2.5 px-3">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {activeTab === 'yearly'
                ? result.yearlySchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-[var(--bg)] transition">
                      <td className="py-2 px-3 font-semibold text-[var(--ink)]">Year {row.year}</td>
                      <td className="py-2 px-3 text-[var(--muted)]">{formatAmount(row.beginningBalance)}</td>
                      <td className="py-2 px-3 font-medium text-[var(--ink)]">{formatAmount(row.totalEmiPaid)}</td>
                      <td className="py-2 px-3 text-emerald-500 font-semibold">{formatAmount(row.principalPaid)}</td>
                      <td className="py-2 px-3 text-amber-500 font-semibold">{formatAmount(row.interestPaid)}</td>
                      <td className="py-2 px-3 text-[var(--ink)]">{formatAmount(row.endingBalance)}</td>
                    </tr>
                  ))
                : result.monthlySchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-[var(--bg)] transition">
                      <td className="py-1.5 px-3 font-medium text-[var(--ink)]">M{row.month} (Y{row.year})</td>
                      <td className="py-1.5 px-3 text-[var(--muted)]">{formatAmount(row.beginningBalance)}</td>
                      <td className="py-1.5 px-3 text-[var(--ink)]">{formatAmount(row.emi)}</td>
                      <td className="py-1.5 px-3 text-emerald-500">{formatAmount(row.principalPaid)}</td>
                      <td className="py-1.5 px-3 text-amber-500">{formatAmount(row.interestPaid)}</td>
                      <td className="py-1.5 px-3 text-[var(--ink)]">{formatAmount(row.endingBalance)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Landmark, Download, CheckCircle2, TrendingUp, Table } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateEpf, EpfInputs } from '../../lib/financial/epf';

interface EpfCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const EpfCalculatorView: React.FC<EpfCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [currentAgeStr, setCurrentAgeStr] = useState('28');
  const [retirementAgeStr, setRetirementAgeStr] = useState('58');
  const [monthlyBasicSalaryStr, setMonthlyBasicSalaryStr] = useState('50000');
  const [currentEpfBalanceStr, setCurrentEpfBalanceStr] = useState('200000');
  const [employeeContributionPercentStr, setEmployeeContributionPercentStr] = useState('12');
  const [employerContributionPercentStr, setEmployerContributionPercentStr] = useState('3.67');
  const [interestRateStr, setInterestRateStr] = useState('8.25');
  const [annualSalaryHikePercentStr, setAnnualSalaryHikePercentStr] = useState('7');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const currentAge = parseFloat(currentAgeStr) || 28;
  const retirementAge = parseFloat(retirementAgeStr) || 58;
  const monthlyBasicSalary = parseFloat(monthlyBasicSalaryStr) || 0;
  const currentEpfBalance = parseFloat(currentEpfBalanceStr) || 0;
  const employeeContributionPercent = parseFloat(employeeContributionPercentStr) || 12;
  const employerContributionPercent = parseFloat(employerContributionPercentStr) || 3.67;
  const interestRate = parseFloat(interestRateStr) || 8.25;
  const annualSalaryHikePercent = parseFloat(annualSalaryHikePercentStr) || 7;

  const result = useMemo(() => {
    const inputs: EpfInputs = {
      currentAge,
      retirementAge,
      monthlyBasicSalary,
      currentEpfBalance,
      employeeContributionPercent,
      employerContributionPercent,
      interestRate,
      annualSalaryHikePercent,
    };
    return calculateEpf(inputs);
  }, [
    currentAge,
    retirementAge,
    monthlyBasicSalary,
    currentEpfBalance,
    employeeContributionPercent,
    employerContributionPercent,
    interestRate,
    annualSalaryHikePercent,
  ]);

  const handleReset = () => {
    setCurrentAgeStr('28');
    setRetirementAgeStr('58');
    setMonthlyBasicSalaryStr('50000');
    setCurrentEpfBalanceStr('200000');
    setEmployeeContributionPercentStr('12');
    setEmployerContributionPercentStr('3.67');
    setInterestRateStr('8.25');
    setAnnualSalaryHikePercentStr('7');
  };

  const handleCopyCsv = () => {
    const headers = 'Age,Year,Salary,Opening,Employee Contrib,Employer Contrib,Interest,Closing\n';
    const rows = result.schedule
      .map(
        (s) =>
          `${s.age},${s.year},${s.salary.toFixed(0)},${s.openingBalance.toFixed(0)},${s.employeeDeposit.toFixed(
            0
          )},${s.employerDeposit.toFixed(0)},${s.interestEarned.toFixed(0)},${s.closingBalance.toFixed(0)}`
      )
      .join('\n');
    navigator.clipboard.writeText(headers + rows);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ToolHeader
        tool={tool}
        onBack={onBackToHome}
        actions={
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
              title="Reset Default Values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-500" />
              EPF Contribution Parameters
            </h3>

            {/* Age Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Age
                </label>
                <input
                  type="text"
                  value={currentAgeStr}
                  onChange={(e) => handleCleanInput(e.target.value, setCurrentAgeStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="28"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Retirement Age
                </label>
                <input
                  type="text"
                  value={retirementAgeStr}
                  onChange={(e) => handleCleanInput(e.target.value, setRetirementAgeStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="58"
                />
              </div>
            </div>

            {/* Monthly Basic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Basic Salary + DA
              </label>
              <input
                type="text"
                value={monthlyBasicSalaryStr}
                onChange={(e) => handleCleanInput(e.target.value, setMonthlyBasicSalaryStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="50000"
              />
            </div>

            {/* Current Balance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Existing EPF Balance
              </label>
              <input
                type="text"
                value={currentEpfBalanceStr}
                onChange={(e) => handleCleanInput(e.target.value, setCurrentEpfBalanceStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="200000"
              />
            </div>

            {/* Rates & Hikes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  EPFO Interest Rate (%)
                </label>
                <input
                  type="text"
                  value={interestRateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInterestRateStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="8.25"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Salary Hike (%)
                </label>
                <input
                  type="text"
                  value={annualSalaryHikePercentStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnnualSalaryHikePercentStr)}
                  className="w-full px-3 py-2 rounded-xl text-sm border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-7 space-y-5">
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Maturity Accumulation at Age {retirementAge}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {result.yearsOfService} Years Compounding
              </span>
            </div>

            {/* Total Maturity Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Total EPF Retirement Corpus
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.finalMaturityAmount)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Accumulated across your employee share, employer EPF contribution, and compounding interest
              </p>
            </div>

            {/* Contribution Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border text-center" style={{ borderColor: 'var(--line)' }}>
                <span className="text-[11px] text-slate-500 block mb-1">Your Contribution</span>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {formatAmount(result.totalEmployeeContribution)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border text-center" style={{ borderColor: 'var(--line)' }}>
                <span className="text-[11px] text-slate-500 block mb-1">Employer EPF Share</span>
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatAmount(result.totalEmployerContribution)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border text-center" style={{ borderColor: 'var(--line)' }}>
                <span className="text-[11px] text-slate-500 block mb-1">Compound Interest</span>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatAmount(result.totalInterestEarned)}
                </div>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{
                    width: `${(result.totalEmployeeContribution / result.finalMaturityAmount) * 100}%`,
                  }}
                />
                <div
                  className="bg-indigo-500 h-full transition-all"
                  style={{
                    width: `${(result.totalEmployerContribution / result.finalMaturityAmount) * 100}%`,
                  }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${(result.totalInterestEarned / result.finalMaturityAmount) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Employee ({((result.totalEmployeeContribution / result.finalMaturityAmount) * 100).toFixed(0)}%)</span>
                <span>Employer ({((result.totalEmployerContribution / result.finalMaturityAmount) * 100).toFixed(0)}%)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Interest ({((result.totalInterestEarned / result.finalMaturityAmount) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Table Preview */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-slate-400" />
                Year-by-Year EPF Growth Table
              </h4>
              <button
                onClick={handleCopyCsv}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {copiedCsv ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                {copiedCsv ? 'Copied CSV!' : 'Copy Schedule'}
              </button>
            </div>

            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500 sticky top-0" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <th className="py-2 px-2 font-semibold">Age</th>
                    <th className="py-2 px-2 text-right font-semibold">Monthly Basic</th>
                    <th className="py-2 px-2 text-right font-semibold">Annual Deposits</th>
                    <th className="py-2 px-2 text-right font-semibold">Interest</th>
                    <th className="py-2 px-2 text-right font-semibold">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300">Age {row.age}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-400">{formatAmount(row.monthlyBasic)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(row.employeeAnnualContribution + row.employerAnnualContribution)}
                      </td>
                      <td className="py-1.5 px-2 text-right text-emerald-600 dark:text-emerald-400">
                        {formatAmount(row.interestEarned)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-blue-600 dark:text-blue-400">
                        {formatAmount(row.closingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Statutory EPF &amp; EPS Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Employer Contribution Split</span>
            Out of the employer's 12% statutory contribution, 8.33% (capped at ₹1,250/month) is diverted to Employee Pension Scheme (EPS-95), with the remaining 3.67% entering EPF.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Triple Tax Exemption (EEE)</span>
            EPF enjoys Exempt-Exempt-Exempt tax status up to statutory thresholds (annual employee contributions up to ₹2.5 Lakhs accrue 100% tax-free interest).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Monthly Compounding</span>
            Interest is computed monthly on the running balance and officially credited annually by EPFO at the close of the financial year.
          </div>
        </div>
      </div>
    </div>
  );
};

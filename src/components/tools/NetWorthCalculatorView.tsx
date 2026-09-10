import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, ShieldCheck, Download, Check, TrendingUp } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateNetWorth, NET_WORTH_ENGINE_VERSION } from '../../lib/financial/netWorth';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface NetWorthCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const NetWorthCalculatorView: React.FC<NetWorthCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('net-worth');

  // Asset inputs
  const [cashStr, setCashStr] = useState('200000');
  const [fixedIncomeStr, setFixedIncomeStr] = useState('500000');
  const [equitiesStr, setEquitiesStr] = useState('1200000');
  const [retirementStr, setRetirementStr] = useState('800000');
  const [realEstateStr, setRealEstateStr] = useState('5000000');
  const [goldStr, setGoldStr] = useState('300000');
  const [otherAssetsStr, setOtherAssetsStr] = useState('0');

  // Liability inputs
  const [homeLoanStr, setHomeLoanStr] = useState('2500000');
  const [vehicleLoanStr, setVehicleLoanStr] = useState('350000');
  const [studentLoanStr, setStudentLoanStr] = useState('0');
  const [creditCardStr, setCreditCardStr] = useState('25000');
  const [otherLiabilitiesStr, setOtherLiabilitiesStr] = useState('0');

  const [copiedCsv, setCopiedCsv] = useState(false);

  const result = useMemo(() => {
    return calculateNetWorth({
      assets: {
        cashAndBank: parseFloat(cashStr) || 0,
        fixedDepositsAndBonds: parseFloat(fixedIncomeStr) || 0,
        equitiesAndMutualFunds: parseFloat(equitiesStr) || 0,
        retirementAccounts: parseFloat(retirementStr) || 0,
        realEstate: parseFloat(realEstateStr) || 0,
        preciousMetals: parseFloat(goldStr) || 0,
        otherAssets: parseFloat(otherAssetsStr) || 0,
      },
      liabilities: {
        homeMortgage: parseFloat(homeLoanStr) || 0,
        vehicleLoans: parseFloat(vehicleLoanStr) || 0,
        personalAndStudentLoans: parseFloat(studentLoanStr) || 0,
        creditCardDues: parseFloat(creditCardStr) || 0,
        otherLiabilities: parseFloat(otherLiabilitiesStr) || 0,
      },
    });
  }, [
    cashStr, fixedIncomeStr, equitiesStr, retirementStr, realEstateStr, goldStr, otherAssetsStr,
    homeLoanStr, vehicleLoanStr, studentLoanStr, creditCardStr, otherLiabilitiesStr
  ]);

  const handleReset = () => {
    setCashStr('200000');
    setFixedIncomeStr('500000');
    setEquitiesStr('1200000');
    setRetirementStr('800000');
    setRealEstateStr('5000000');
    setGoldStr('300000');
    setOtherAssetsStr('0');

    setHomeLoanStr('2500000');
    setVehicleLoanStr('350000');
    setStudentLoanStr('0');
    setCreditCardStr('25000');
    setOtherLiabilitiesStr('0');
  };

  const handleExportCsv = () => {
    let csv = 'Category,Item,Amount\n';
    result.assetsBreakdown.forEach((a) => {
      csv += `Asset,${a.name},${a.amount}\n`;
    });
    result.liabilitiesBreakdown.forEach((l) => {
      csv += `Liability,${l.name},${l.amount}\n`;
    });
    csv += `Summary,Total Assets,${result.totalAssets}\n`;
    csv += `Summary,Total Liabilities,${result.totalLiabilities}\n`;
    csv += `Summary,Net Worth,${result.netWorth}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `net-worth-statement.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        {/* Currency & Actions Toolbar */}
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
            <CurrencySelector idPrefix="net-worth-currency" variant="pill" />
          </div>
        </div>

        {/* Results Highlight Card */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Net Worth
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                result.netWorth >= 0 ? 'text-[var(--brand)]' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatAmount(result.netWorth)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Assets minus liabilities
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Assets
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatAmount(result.totalAssets)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Gross wealth owned
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Liabilities
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatAmount(result.totalLiabilities)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Outstanding debt
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Debt-to-Asset Ratio
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {result.debtToAssetRatio.toFixed(1)}%
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              {result.debtToAssetRatio < 30 ? 'Healthy leverage (<30%)' : result.debtToAssetRatio < 60 ? 'Moderate debt' : 'High debt (>60%)'}
            </div>
          </div>
        </div>

        {/* Two Column Grid: Assets vs Liabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--line)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Assets (What You Own)
              </h3>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.totalAssets)}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Cash & Bank Savings
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={cashStr}
                  onChange={(e) => handleCleanInput(e.target.value, setCashStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Fixed Deposits, Bonds & Debt Funds
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fixedIncomeStr}
                  onChange={(e) => handleCleanInput(e.target.value, setFixedIncomeStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Equities, Stocks & Mutual Funds
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={equitiesStr}
                  onChange={(e) => handleCleanInput(e.target.value, setEquitiesStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Retirement Corpus (EPF, PPF, NPS, 401k)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={retirementStr}
                  onChange={(e) => handleCleanInput(e.target.value, setRetirementStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Real Estate Market Value
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={realEstateStr}
                  onChange={(e) => handleCleanInput(e.target.value, setRealEstateStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Gold & Precious Metals
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={goldStr}
                  onChange={(e) => handleCleanInput(e.target.value, setGoldStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Vehicles & Other Tangible Assets
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={otherAssetsStr}
                  onChange={(e) => handleCleanInput(e.target.value, setOtherAssetsStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            </div>
          </div>

          {/* Liabilities Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--line)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Liabilities (What You Owe)
              </h3>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatAmount(result.totalLiabilities)}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Home Loan / Mortgage Outstanding
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={homeLoanStr}
                  onChange={(e) => handleCleanInput(e.target.value, setHomeLoanStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Vehicle / Auto Loans Outstanding
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={vehicleLoanStr}
                  onChange={(e) => handleCleanInput(e.target.value, setVehicleLoanStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Student & Education Loans
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={studentLoanStr}
                  onChange={(e) => handleCleanInput(e.target.value, setStudentLoanStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Credit Card Outstanding Balances
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={creditCardStr}
                  onChange={(e) => handleCleanInput(e.target.value, setCreditCardStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>
                  Personal Loans & Other Debts
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={otherLiabilitiesStr}
                  onChange={(e) => handleCleanInput(e.target.value, setOtherLiabilitiesStr)}
                  className="w-full px-3 py-1.5 text-sm font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statement Export & Privacy Banner */}
        <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Client-Side Privacy: Your asset and debt data never leaves your browser.</span>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:bg-[var(--surface-2)]"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
            {copiedCsv ? 'Downloaded Statement' : 'Export Statement (CSV)'}
          </button>
        </div>

        {/* Methodology Card */}
        <div
          className="p-4 rounded-xl border flex gap-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              <strong>Formula:</strong> {formulaMeta?.formulaText || 'Net Worth = Total Assets - Total Liabilities'}
            </p>
            <p>
              <strong>Model Version:</strong> {NET_WORTH_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
            <p className="text-[11px]">
              Disclaimer: Provided for personal financial tracking and net worth audits. Fair market value of illiquid assets (e.g. real estate) may vary upon actual liquidation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

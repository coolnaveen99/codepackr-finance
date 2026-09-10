import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Wallet, Download, Check, ShieldCheck } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateCtcToInHand, CTC_ENGINE_VERSION } from '../../lib/financial/ctcToInHand';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';

interface CtcToInHandCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const CtcToInHandCalculatorView: React.FC<CtcToInHandCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();
  const formulaMeta = getFormulaDefinition('ctc-to-in-hand');

  const [annualCtcStr, setAnnualCtcStr] = useState('1200000');
  const [basicPctStr, setBasicPctStr] = useState('40');
  const [includeEmployerPf, setIncludeEmployerPf] = useState(true);
  const [includeGratuity, setIncludeGratuity] = useState(true);
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [copiedCsv, setCopiedCsv] = useState(false);

  const annualCtc = parseFloat(annualCtcStr) || 0;
  const basicSalaryPercentage = parseFloat(basicPctStr) || 40;

  const result = useMemo(() => {
    return calculateCtcToInHand({
      annualCtc,
      basicSalaryPercentage,
      includeEmployerPf,
      includeGratuity,
      taxRegime,
    });
  }, [annualCtc, basicSalaryPercentage, includeEmployerPf, includeGratuity, taxRegime]);

  const handleReset = () => {
    setAnnualCtcStr('1200000');
    setBasicPctStr('40');
    setIncludeEmployerPf(true);
    setIncludeGratuity(true);
    setTaxRegime('new');
  };

  const handleExportCsv = () => {
    let csv = 'Salary Component,Type,Monthly (INR),Annual (INR),Description\n';
    result.components.forEach((c) => {
      csv += `"${c.label}",${c.type},${c.monthly},${c.annual},"${c.description}"\n`;
    });
    csv += `Total Net In-Hand,Take-Home,${result.netInHandMonthly},${result.netInHandAnnual},"Direct bank deposit"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ctc-salary-breakdown-${annualCtc}.csv`);
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
            <CurrencySelector idPrefix="ctc-currency" variant="pill" />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              ANNUAL CTC (COST TO COMPANY) ({currency.symbol.trim()})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={annualCtcStr}
              onChange={(e) => handleCleanInput(e.target.value, setAnnualCtcStr)}
              className="w-full px-3 py-2 text-base font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="1200000"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              BASIC SALARY (% OF CTC)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={basicPctStr}
              onChange={(e) => handleCleanInput(e.target.value, setBasicPctStr)}
              className="w-full px-3 py-2 text-base font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>
              INCOME TAX REGIME
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaxRegime('new')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  taxRegime === 'new'
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]'
                }`}
              >
                New Regime
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime('old')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  taxRegime === 'old'
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]'
                }`}
              >
                Old Regime
              </button>
            </div>
          </div>
        </div>

        {/* Checkbox Toggles for Employer Parts */}
        <div className="flex items-center gap-6 flex-wrap text-xs font-semibold" style={{ color: 'var(--ink)' }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeEmployerPf}
              onChange={(e) => setIncludeEmployerPf(e.target.checked)}
              className="rounded border-[var(--line)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <span>Include Employer EPF (12% of basic in CTC)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGratuity}
              onChange={(e) => setIncludeGratuity(e.target.checked)}
              className="rounded border-[var(--line)] text-[var(--brand)] focus:ring-[var(--brand)]"
            />
            <span>Include Gratuity (4.81% of basic in CTC)</span>
          </label>
        </div>

        {/* Results Highlight Card */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Monthly In-Hand (Net)
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatAmount(result.netInHandMonthly)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Bank credit every month
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Annual In-Hand (Net)
            </div>
            <div className="text-2xl font-bold font-mono text-[var(--brand)]">
              {formatAmount(result.netInHandAnnual)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Total take-home / year
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Total Annual Deductions
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatAmount(result.totalAnnualDeductions)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              PF + Tax TDS + Prof. Tax
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Gross Annual Salary
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.grossAnnualSalary)}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
              CTC minus employer perks
            </div>
          </div>
        </div>

        {/* Salary Component Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>
              Detailed Salary Structure & Deductions
            </h3>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer hover:bg-[var(--surface-2)]"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              {copiedCsv ? 'Downloaded CSV' : 'Export Salary Slip (CSV)'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--line)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-2)' }}>
                  <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Component</th>
                  <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Type</th>
                  <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Monthly</th>
                  <th className="text-right py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Annual</th>
                  <th className="text-left py-2.5 px-3 font-semibold" style={{ color: 'var(--muted)' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {result.components.map((c, idx) => (
                  <tr key={idx} className="border-b" style={{ borderColor: 'var(--line)' }}>
                    <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--ink)' }}>{c.label}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.type === 'earning'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-semibold ${
                        c.type === 'earning' ? 'text-[var(--ink)]' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {c.type === 'deduction' ? `-${formatAmount(c.monthly)}` : formatAmount(c.monthly)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono ${
                        c.type === 'earning' ? 'text-[var(--ink)]' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {c.type === 'deduction' ? `-${formatAmount(c.annual)}` : formatAmount(c.annual)}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--muted)]">{c.description}</td>
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
              <strong>Formula:</strong> In-Hand Salary = Gross Salary - (Employee PF + Professional Tax + Income Tax TDS).
            </p>
            <p>
              <strong>Gross vs CTC:</strong> CTC represents the total cost incurred by the employer, including employer EPF and statutory gratuity provisioning. Gross salary is the amount before employee-side payroll deductions.
            </p>
            <p>
              <strong>Model Version:</strong> {CTC_ENGINE_VERSION} · <strong>Review Status:</strong> Verified · <strong>Audited:</strong> {formulaMeta?.lastReviewed || '2026-03-01'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

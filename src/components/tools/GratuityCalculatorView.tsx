import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { calculateGratuity, GratuityInput } from '../../lib/financial/gratuity';
import { getFormulaDefinition } from '../../lib/financial/formulaRegistry';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { 
  Award, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  DollarSign, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface GratuityCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const GratuityCalculatorView: React.FC<GratuityCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount, currencyCode } = useCurrency();
  const [copied, setCopied] = useState(false);
  const formulaMeta = getFormulaDefinition('gratuity-calculator');

  const [inputs, setInputs] = useState<GratuityInput>({
    monthlyBasicPlusDa: 65000,
    completedYearsOfService: 7,
    additionalMonths: 8,
    isCoveredUnderAct: true,
  });

  const result = useMemo(() => calculateGratuity(inputs), [inputs]);

  const handleReset = () => {
    setInputs({
      monthlyBasicPlusDa: 65000,
      completedYearsOfService: 7,
      additionalMonths: 8,
      isCoveredUnderAct: true,
    });
  };

  const handleCopy = () => {
    const text = `Gratuity Calculation Summary - CodePackr Finance\n` +
      `Last Drawn Monthly Basic + DA: ${formatAmount(inputs.monthlyBasicPlusDa)}\n` +
      `Completed Service Tenure: ${inputs.completedYearsOfService} Years, ${inputs.additionalMonths || 0} Months\n` +
      `Calculated Tenure (Rounded): ${result.tenureYearsCalculated} Years\n` +
      `Organization Status: ${inputs.isCoveredUnderAct ? 'Covered under Gratuity Act 1972' : 'Not Covered'}\n` +
      `Total Gratuity Payable: ${formatAmount(result.totalGratuityCalculated)}\n` +
      `Tax-Exempt Portion (Sec 10(10)): ${formatAmount(result.taxExemptGratuity)}\n` +
      `Taxable Gratuity: ${formatAmount(result.taxableGratuity)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Monthly Basic + DA', result.monthlyBasicPlusDa],
      ['Service Tenure (Years)', inputs.completedYearsOfService],
      ['Service Tenure (Additional Months)', inputs.additionalMonths || 0],
      ['Statutory Rounded Years', result.tenureYearsCalculated],
      ['Covered under Payment of Gratuity Act', result.isCoveredUnderAct ? 'Yes' : 'No'],
      ['Total Gratuity Payable', result.totalGratuityCalculated],
      ['Statutory Exemption Ceiling', result.statutoryExemptLimit],
      ['Tax-Exempt Amount', result.taxExemptGratuity],
      ['Taxable Portion', result.taxableGratuity],
      ['Formula Applied', result.formulaDescription],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gratuity_calculation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="gratuity-calculator-view" className="w-full max-w-6xl mx-auto space-y-6">
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            Statutory Employee Benefit
          </span>
          <span className="text-xs text-[var(--muted)]">Payment of Gratuity Act, 1972</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="grat-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="grat-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            id="grat-export-btn"
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
              <Award className="w-4 h-4 text-[var(--brand)]" />
              Service & Pay Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="grat-salary" className="block text-xs font-medium text-[var(--muted)] mb-1">
                  Last Drawn Monthly Basic Pay + Dearness Allowance (DA) ({currencyCode})
                </label>
                <input
                  id="grat-salary"
                  type="number"
                  min="0"
                  step="1000"
                  value={inputs.monthlyBasicPlusDa || ''}
                  onChange={(e) => setInputs({ ...inputs, monthlyBasicPlusDa: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold text-base focus:outline-none focus:border-[var(--brand)] transition"
                />
                <p className="text-[11px] text-[var(--muted)] mt-1">Excludes HRA, special allowances, and annual bonuses.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="grat-years" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Completed Years
                  </label>
                  <input
                    id="grat-years"
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={inputs.completedYearsOfService || ''}
                    onChange={(e) => setInputs({ ...inputs, completedYearsOfService: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
                <div>
                  <label htmlFor="grat-months" className="block text-xs font-medium text-[var(--muted)] mb-1">
                    Additional Months (0–11)
                  </label>
                  <input
                    id="grat-months"
                    type="number"
                    min="0"
                    max="11"
                    step="1"
                    value={inputs.additionalMonths || ''}
                    onChange={(e) => setInputs({ ...inputs, additionalMonths: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--brand)] transition"
                  />
                </div>
              </div>

              {/* Covered under Act Toggle */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-2">
                  Organization Coverage Under Gratuity Act
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInputs({ ...inputs, isCoveredUnderAct: true })}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      inputs.isCoveredUnderAct
                        ? 'bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    Covered under Act (26 Days)
                  </button>
                  <button
                    onClick={() => setInputs({ ...inputs, isCoveredUnderAct: false })}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      !inputs.isCoveredUnderAct
                        ? 'bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]'
                        : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    Not Covered (30 Days)
                  </button>
                </div>
              </div>

              {!result.isEligibleForGratuity && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Eligibility Notice:</strong> Under Section 4(1), minimum 5 continuous years of service is required to qualify for gratuity (except in cases of death or disablement).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Outcomes & Tax Exemption */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                  Total Gratuity Payable
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-emerald-500 tracking-tight">
                    {formatAmount(result.totalGratuityCalculated)}
                  </span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 font-mono">
                {result.tenureYearsCalculated} Years Counted
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-emerald-500 font-medium block">Tax-Exempt Portion</span>
                <span className="text-xl font-bold text-emerald-500 mt-0.5 block">{formatAmount(result.taxExemptGratuity)}</span>
                <span className="text-[10px] text-[var(--muted)]">Section 10(10) limit: ₹20 Lakhs</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] font-medium block">Taxable Gratuity</span>
                <span className="text-xl font-bold text-[var(--ink)] mt-0.5 block">{formatAmount(result.taxableGratuity)}</span>
                <span className="text-[10px] text-[var(--muted)]">Added to income if &gt; ₹20L</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1">
              <span className="text-[11px] text-[var(--muted)] font-medium block">Statutory Formula Applied</span>
              <p className="text-xs font-mono text-[var(--ink)]">{result.formulaDescription}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-start gap-3">
            <Info className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              <strong>Statutory Governance:</strong> {result.statutoryNotice} Gratuity received by government employees is completely tax-free without ceiling. For non-government private employees, the cumulative lifetime tax exemption limit under Section 10(10) is ₹20,00,000.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

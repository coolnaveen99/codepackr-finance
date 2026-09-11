import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Receipt, Download, CheckCircle2 } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateGst, GstInputs } from '../../lib/financial/gst';

interface GstCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const GstCalculatorView: React.FC<GstCalculatorViewProps> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { formatAmount } = useCurrency();

  const [amountStr, setAmountStr] = useState('25000');
  const [selectedRate, setSelectedRate] = useState<number>(18);
  const [customRateStr, setCustomRateStr] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [transactionType, setTransactionType] = useState<'intra-state' | 'inter-state'>('intra-state');

  const rawAmount = parseFloat(amountStr) || 0;
  const effectiveGstRate = isCustom ? parseFloat(customRateStr) || 0 : selectedRate;

  const result = useMemo(() => {
    const inputs: GstInputs = {
      amount: rawAmount,
      gstRate: effectiveGstRate,
      mode,
      transactionType,
    };
    return calculateGst(inputs);
  }, [rawAmount, effectiveGstRate, mode, transactionType]);

  const handleReset = () => {
    setAmountStr('25000');
    setSelectedRate(18);
    setIsCustom(false);
    setCustomRateStr('');
    setMode('exclusive');
    setTransactionType('intra-state');
  };

  const gstPresets = [0, 3, 5, 12, 18, 28];

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
              <Receipt className="w-4 h-4 text-blue-500" />
              GST Parameters
            </h3>

            {/* Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Calculation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('exclusive')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    mode === 'exclusive'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  GST Exclusive (Add Tax)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('inclusive')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    mode === 'inclusive'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  GST Inclusive (Extract Tax)
                </button>
              </div>
            </div>

            {/* Base Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {mode === 'exclusive' ? 'Base / Net Amount (Pre-Tax)' : 'Total Invoice Amount (Gross Incl. Tax)'}
              </label>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => handleCleanInput(e.target.value, setAmountStr)}
                className="w-full px-3 py-2 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 font-mono"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                placeholder="25000"
              />
            </div>

            {/* GST Rate Preset Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Statutory GST Slab (%)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {gstPresets.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRate(r);
                      setIsCustom(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                      !isCustom && selectedRate === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    isCustom ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Custom %:
                </button>
                <input
                  type="text"
                  disabled={!isCustom}
                  value={customRateStr}
                  onChange={(e) => {
                    setIsCustom(true);
                    handleCleanInput(e.target.value, setCustomRateStr);
                  }}
                  className="w-20 px-2 py-1 rounded-lg text-xs border font-mono disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="e.g. 7.5"
                />
              </div>
            </div>

            {/* Transaction Type (Intra vs Inter state) */}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Region
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('intra-state')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    transactionType === 'intra-state'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Intra-State (CGST + SGST)
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('inter-state')}
                  className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-colors ${
                    transactionType === 'inter-state'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Inter-State (IGST)
                </button>
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
                Tax Breakdown Summary
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Rate: {result.effectiveTaxRate}%
              </span>
            </div>

            {/* Total Gross Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Final Gross Invoice Total
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.grossAmount)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Net Base {formatAmount(result.netAmount)} + Total GST {formatAmount(result.totalGst)}
              </p>
            </div>

            {/* Formal Invoice Breakdown Table */}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Tax Component</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Applicable Rate</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">Taxable Net Base</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatAmount(result.netAmount)}
                    </td>
                  </tr>

                  {transactionType === 'intra-state' ? (
                    <>
                      <tr>
                        <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                          CGST (Central Tax)
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {(result.effectiveTaxRate / 2).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                          {formatAmount(result.cgst)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                          SGST (State / UT Tax)
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {(result.effectiveTaxRate / 2).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {formatAmount(result.sgst)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                        IGST (Integrated Tax)
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {result.effectiveTaxRate.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {formatAmount(result.igst)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-slate-50/50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white">Total GST Amount</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{result.effectiveTaxRate}%</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatAmount(result.totalGst)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Guidance */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Goods &amp; Services Tax (GST) Slabs &amp; Invoicing Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Intra-State Split</span>
            Supplies within the same state are split exactly 50/50 between Central GST (CGST) and State GST (SGST).
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Inter-State IGST</span>
            Supplies from one state to another (or imports) attract 100% Integrated GST (IGST) administered by the central government.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Reverse Calculation</span>
            To extract GST from retail prices that already include tax: Tax = Gross - [Gross ÷ (1 + Rate)].
          </div>
        </div>
      </div>
    </div>
  );
};

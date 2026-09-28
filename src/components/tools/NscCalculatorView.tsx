import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, FileText } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateNsc, NSC_ENGINE_VERSION, NSC_DEFAULT_RATE } from '../../lib/financial/nsc';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const NscCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [investStr, setInvestStr] = useState('100000');
  const [rateStr, setRateStr] = useState(String(NSC_DEFAULT_RATE));

  const result = useMemo(
    () =>
      calculateNsc({
        investment: parseFloat(investStr) || 0,
        rate: parseFloat(rateStr) || NSC_DEFAULT_RATE,
      }),
    [investStr, rateStr]
  );

  const reset = () => {
    setInvestStr('100000');
    setRateStr(String(NSC_DEFAULT_RATE));
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl border shadow-md space-y-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}>
        <div className="flex items-center justify-between pb-3 border-b flex-wrap gap-2" style={{ borderColor: 'var(--line)' }}>
          <span className="text-xs font-mono font-bold text-[var(--brand)]">{currency.flag} {currency.code}</span>
          <div className="flex gap-2">
            <button onClick={reset} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <CurrencySelector idPrefix="nsc-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>INVESTMENT AMOUNT</label>
            <input type="text" inputMode="decimal" value={investStr} onChange={(e) => clean(e.target.value, setInvestStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>INTEREST RATE (%)</label>
            <input type="text" inputMode="decimal" value={rateStr} onChange={(e) => clean(e.target.value, setRateStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>NSC Results (5-Year)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Maturity Amount</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.maturityAmount)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{result.tenureYears} yr @ {result.rate}%</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInterest)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Investment</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(parseFloat(investStr) || 0)}</div>
            </div>
          </div>

          {result.yearlyBreakdown.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left py-1">Year</th>
                    <th className="text-right py-1">Opening</th>
                    <th className="text-right py-1">Interest</th>
                    <th className="text-right py-1">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((r) => (
                    <tr key={r.year} style={{ color: 'var(--ink)' }}>
                      <td className="py-1">{r.year}</td>
                      <td className="text-right">{formatAmount(r.opening)}</td>
                      <td className="text-right">{formatAmount(r.interest)}</td>
                      <td className="text-right font-medium">{formatAmount(r.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-1 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{NSC_ENGINE_VERSION} · Default {NSC_DEFAULT_RATE}% (Q2 FY 2026-27) · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default NscCalculatorView;

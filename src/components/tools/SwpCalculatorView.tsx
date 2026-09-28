import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, TrendingDown } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateSwp, SWP_ENGINE_VERSION } from '../../lib/financial/swp';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const SwpCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [corpusStr, setCorpusStr] = useState('5000000');
  const [wdStr, setWdStr] = useState('25000');
  const [returnStr, setReturnStr] = useState('10');
  const [yearsStr, setYearsStr] = useState('20');
  const [stepUpStr, setStepUpStr] = useState('5');

  const result = useMemo(
    () =>
      calculateSwp({
        corpus: parseFloat(corpusStr) || 0,
        monthlyWithdrawal: parseFloat(wdStr) || 0,
        expectedReturnPercent: parseFloat(returnStr) || 0,
        tenureYears: parseFloat(yearsStr) || 1,
        inflationStepUpPercent: parseFloat(stepUpStr) || 0,
      }),
    [corpusStr, wdStr, returnStr, yearsStr, stepUpStr]
  );

  const reset = () => {
    setCorpusStr('5000000');
    setWdStr('25000');
    setReturnStr('10');
    setYearsStr('20');
    setStepUpStr('5');
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
            <CurrencySelector idPrefix="swp-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'INVESTMENT CORPUS', value: corpusStr, set: setCorpusStr },
            { label: 'MONTHLY WITHDRAWAL', value: wdStr, set: setWdStr },
            { label: 'EXPECTED RETURN (% p.a.)', value: returnStr, set: setReturnStr },
            { label: 'TENURE (YEARS)', value: yearsStr, set: setYearsStr },
            { label: 'ANNUAL STEP-UP ON WITHDRAWAL (%)', value: stepUpStr, set: setStepUpStr },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>{f.label}</label>
              <input type="text" inputMode="decimal" value={f.value} onChange={(e) => clean(e.target.value, f.set)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>SWP Results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Final Corpus</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.finalValue)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Withdrawn</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalWithdrawn)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Years Survived</div>
              <div className="text-xl font-bold" style={{ color: result.depleted ? '#dc2626' : 'var(--ink)' }}>
                {result.yearsSurvived}{result.depleted ? ' (depleted)' : ''}
              </div>
            </div>
          </div>

          {result.yearlyBreakdown.length > 0 && (
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left py-1">Year</th>
                    <th className="text-right py-1">Withdrawn</th>
                    <th className="text-right py-1">Growth</th>
                    <th className="text-right py-1">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((r) => (
                    <tr key={r.year} style={{ color: 'var(--ink)' }}>
                      <td className="py-1">{r.year}</td>
                      <td className="text-right">{formatAmount(r.withdrawn)}</td>
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
            Engine v{SWP_ENGINE_VERSION} · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwpCalculatorView;

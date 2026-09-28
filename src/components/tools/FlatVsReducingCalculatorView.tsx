import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Scale } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateFlatVsReducing, FLAT_VS_REDUCING_ENGINE_VERSION } from '../../lib/financial/flatVsReducing';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const FlatVsReducingCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [principalStr, setPrincipalStr] = useState('500000');
  const [rateStr, setRateStr] = useState('12');
  const [monthsStr, setMonthsStr] = useState('36');

  const result = useMemo(
    () =>
      calculateFlatVsReducing({
        principal: parseFloat(principalStr) || 0,
        annualRatePercent: parseFloat(rateStr) || 0,
        tenureMonths: parseFloat(monthsStr) || 12,
      }),
    [principalStr, rateStr, monthsStr]
  );

  const reset = () => {
    setPrincipalStr('500000');
    setRateStr('12');
    setMonthsStr('36');
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
            <CurrencySelector idPrefix="flat-red-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>PRINCIPAL</label>
            <input type="text" inputMode="decimal" value={principalStr} onChange={(e) => clean(e.target.value, setPrincipalStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>NOMINAL RATE (% p.a.)</label>
            <input type="text" inputMode="decimal" value={rateStr} onChange={(e) => clean(e.target.value, setRateStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>TENURE (MONTHS)</label>
            <input type="text" inputMode="numeric" value={monthsStr} onChange={(e) => clean(e.target.value, setMonthsStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Flat vs Reducing</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-bold mb-2" style={{ color: 'var(--muted)' }}>FLAT RATE</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>EMI</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.flatEmi)}</div>
              <div className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Total interest</div>
              <div className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{formatAmount(result.flatTotalInterest)}</div>
            </div>
            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--brand)' }}>
              <div className="text-xs font-bold mb-2 text-[var(--brand)]">REDUCING BALANCE</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>EMI</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.reducingEmi)}</div>
              <div className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Total interest</div>
              <div className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{formatAmount(result.reducingTotalInterest)}</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
            Extra interest under flat ≈ <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.interestDifference)}</strong>
            <br />
            Flat EMI is roughly equal to reducing rate of ~<strong style={{ color: 'var(--ink)' }}>{result.approxEquivalentReducingRate}%</strong> p.a.
          </div>
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
            </div>
          ))}
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{FLAT_VS_REDUCING_ENGINE_VERSION} · 100% client-side
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatVsReducingCalculatorView;

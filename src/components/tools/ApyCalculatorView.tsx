import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Shield } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateApy, APY_ENGINE_VERSION, ApyPensionTier } from '../../lib/financial/apy';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

const TIERS: ApyPensionTier[] = [1000, 2000, 3000, 4000, 5000];

export const ApyCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [ageStr, setAgeStr] = useState('30');
  const [tier, setTier] = useState<ApyPensionTier>(5000);

  const result = useMemo(
    () =>
      calculateApy({
        entryAge: parseFloat(ageStr) || 30,
        pensionTier: tier,
      }),
    [ageStr, tier]
  );

  const reset = () => {
    setAgeStr('30');
    setTier(5000);
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
            <CurrencySelector idPrefix="apy-currency" variant="pill" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>ENTRY AGE (18–40)</label>
          <input type="text" inputMode="decimal" value={ageStr} onChange={(e) => clean(e.target.value, setAgeStr)}
            className="w-full max-w-xs px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>GUARANTEED MONTHLY PENSION AT 60</label>
          <div className="flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <button key={t} onClick={() => setTier(t)}
                className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${tier === t ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`}
                style={tier !== t ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
                ₹{t.toLocaleString('en-IN')}/mo
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>APY Contribution Estimate</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Monthly Contribution</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.monthlyContribution)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Years to Contribute</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{result.yearsToContribute}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>until age 60</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Contributed</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalContributed)}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
            <div style={{ color: 'var(--muted)' }}>Guaranteed pension from age 60</div>
            <div className="font-bold text-lg text-[var(--brand)]">{formatAmount(result.pensionTier)} / month</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Annual contribution ~ {formatAmount(result.annualContribution)}
            </div>
          </div>

          <div className="space-y-1 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{APY_ENGINE_VERSION} · Approximate PFRDA chart · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApyCalculatorView;

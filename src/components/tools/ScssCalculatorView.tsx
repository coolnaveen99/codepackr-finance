import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Users } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateScss, SCSS_ENGINE_VERSION, SCSS_DEFAULT_RATE, SCSS_MAX_DEPOSIT } from '../../lib/financial/scss';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const ScssCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [depositStr, setDepositStr] = useState('1500000');
  const [rateStr, setRateStr] = useState(String(SCSS_DEFAULT_RATE));
  const [tenure, setTenure] = useState(5);

  const result = useMemo(
    () =>
      calculateScss({
        deposit: parseFloat(depositStr) || 0,
        rate: parseFloat(rateStr) || SCSS_DEFAULT_RATE,
        tenureYears: tenure,
      }),
    [depositStr, rateStr, tenure]
  );

  const reset = () => {
    setDepositStr('1500000');
    setRateStr(String(SCSS_DEFAULT_RATE));
    setTenure(5);
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
            <CurrencySelector idPrefix="scss-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>DEPOSIT (max ₹30L)</label>
            <input type="text" inputMode="decimal" value={depositStr} onChange={(e) => clean(e.target.value, setDepositStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>INTEREST RATE (%)</label>
            <input type="text" inputMode="decimal" value={rateStr} onChange={(e) => clean(e.target.value, setRateStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>TENURE</label>
          <div className="flex flex-wrap gap-2">
            {[5, 8].map((t) => (
              <button key={t} onClick={() => setTenure(t)}
                className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${tenure === t ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`}
                style={tenure !== t ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
                {t} years{t === 8 ? ' (with extension)' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>SCSS Results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Quarterly Interest</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.quarterlyInterest)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Annual Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.annualInterest)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Interest ({tenure}y)</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInterestOverTenure)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Principal at Maturity</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.maturityAmount)}</div>
            </div>
          </div>

          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            Effective deposit used: <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.cappedDeposit)}</strong>
            {parseFloat(depositStr) > SCSS_MAX_DEPOSIT ? ' (capped at scheme max)' : ''}
          </div>

          <div className="space-y-1 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{SCSS_ENGINE_VERSION} · Default {SCSS_DEFAULT_RATE}% (Q2 FY 2026-27) · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScssCalculatorView;

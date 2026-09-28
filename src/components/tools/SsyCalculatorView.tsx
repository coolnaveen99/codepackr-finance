import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Heart } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateSsy, SSY_ENGINE_VERSION, SSY_DEFAULT_RATE } from '../../lib/financial/ssy';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const SsyCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [depositStr, setDepositStr] = useState('150000');
  const [ageStr, setAgeStr] = useState('1');
  const [rateStr, setRateStr] = useState(String(SSY_DEFAULT_RATE));
  const [existingStr, setExistingStr] = useState('0');

  const result = useMemo(
    () =>
      calculateSsy({
        annualDeposit: parseFloat(depositStr) || 0,
        girlAge: parseFloat(ageStr) || 0,
        rate: parseFloat(rateStr) || SSY_DEFAULT_RATE,
        existingBalance: parseFloat(existingStr) || 0,
      }),
    [depositStr, ageStr, rateStr, existingStr]
  );

  const reset = () => {
    setDepositStr('150000');
    setAgeStr('1');
    setRateStr(String(SSY_DEFAULT_RATE));
    setExistingStr('0');
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
            <CurrencySelector idPrefix="ssy-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'ANNUAL DEPOSIT (max 1.5L)', value: depositStr, set: setDepositStr },
            { label: 'GIRL CURRENT AGE', value: ageStr, set: setAgeStr },
            { label: 'INTEREST RATE (%)', value: rateStr, set: setRateStr },
            { label: 'EXISTING BALANCE', value: existingStr, set: setExistingStr },
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
            <Heart className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>SSY Results (EEE Tax-Free)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Maturity Amount</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.maturityAmount)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{result.maturityYears} yr @ {result.rate}%</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Deposited</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalDeposited)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{result.depositYears} deposit years</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Tax-Free Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInterest)}</div>
            </div>
          </div>

          {result.yearlyBreakdown.length > 0 && (
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left py-1">Yr</th>
                    <th className="text-left py-1">Age</th>
                    <th className="text-right py-1">Deposit</th>
                    <th className="text-right py-1">Interest</th>
                    <th className="text-right py-1">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((r) => (
                    <tr key={r.year} style={{ color: 'var(--ink)' }}>
                      <td className="py-1">{r.year}</td>
                      <td>{r.age}</td>
                      <td className="text-right">{formatAmount(r.deposit)}</td>
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
            Engine v{SSY_ENGINE_VERSION} · Default {SSY_DEFAULT_RATE}% (Q2 FY 2026-27) · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default SsyCalculatorView;

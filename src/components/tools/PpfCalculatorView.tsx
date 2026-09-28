import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Shield } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculatePpf,
  PPF_ENGINE_VERSION,
  PPF_DEFAULT_RATE,
  PPF_MAX_ANNUAL,
} from '../../lib/financial/ppf';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const PpfCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [depositStr, setDepositStr] = useState('150000');
  const [rateStr, setRateStr] = useState(String(PPF_DEFAULT_RATE));
  const [tenure, setTenure] = useState(15);
  const [existingStr, setExistingStr] = useState('0');
  const [beforeFifth, setBeforeFifth] = useState(true);
  const [taxSlabStr, setTaxSlabStr] = useState('30');

  const result = useMemo(
    () =>
      calculatePpf({
        annualDeposit: parseFloat(depositStr) || 0,
        rate: parseFloat(rateStr) || PPF_DEFAULT_RATE,
        tenureYears: tenure,
        existingBalance: parseFloat(existingStr) || 0,
        depositBeforeFifth: beforeFifth,
        taxSlabPercent: parseFloat(taxSlabStr) || 0,
      }),
    [depositStr, rateStr, tenure, existingStr, beforeFifth, taxSlabStr]
  );

  const reset = () => {
    setDepositStr('150000');
    setRateStr(String(PPF_DEFAULT_RATE));
    setTenure(15);
    setExistingStr('0');
    setBeforeFifth(true);
    setTaxSlabStr('30');
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
            <CurrencySelector idPrefix="ppf-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'ANNUAL DEPOSIT (max 1.5L)', value: depositStr, set: setDepositStr },
            { label: 'INTEREST RATE (%)', value: rateStr, set: setRateStr },
            { label: 'EXISTING BALANCE', value: existingStr, set: setExistingStr },
            { label: 'TAX SLAB % (old regime 80C)', value: taxSlabStr, set: setTaxSlabStr },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>{f.label}</label>
              <input type="text" inputMode="decimal" value={f.value} onChange={(e) => clean(e.target.value, f.set)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>TENURE (YEARS)</label>
          <div className="flex flex-wrap gap-2">
            {[15, 20, 25, 30].map((t) => (
              <button key={t} onClick={() => setTenure(t)}
                className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${tenure === t ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`}
                style={tenure !== t ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
                {t} yr{t > 15 ? ' (ext)' : ''}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setBeforeFifth(!beforeFifth)}
          className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${beforeFifth ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`}
          style={!beforeFifth ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
          Deposit on/before 5th of month (full interest)
        </button>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>PPF Results (EEE Tax-Free)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Maturity Amount</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.maturityAmount)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{result.tenureYears} years @ {result.rate}%</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Deposited</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalDeposited)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Tax-Free Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInterest)}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
            <div style={{ color: 'var(--muted)' }}>Section 80C (old regime)</div>
            <div style={{ color: 'var(--ink)' }}>
              Annual deduction up to {formatAmount(Math.min(result.section80cAnnual, PPF_MAX_ANNUAL))} ·
              Est. lifetime tax savings ~ {formatAmount(result.lifetime80cSavings)}
            </div>
          </div>

          {result.yearlyBreakdown.length > 0 && (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left py-1">Year</th>
                    <th className="text-right py-1">Opening</th>
                    <th className="text-right py-1">Deposit</th>
                    <th className="text-right py-1">Interest</th>
                    <th className="text-right py-1">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((r) => (
                    <tr key={r.year} style={{ color: 'var(--ink)' }}>
                      <td className="py-1">{r.year}</td>
                      <td className="text-right">{formatAmount(r.opening)}</td>
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
            Engine v{PPF_ENGINE_VERSION} · Default rate {PPF_DEFAULT_RATE}% (Q2 FY 2026-27) · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default PpfCalculatorView;

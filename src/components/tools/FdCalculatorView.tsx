import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Landmark, AlertTriangle } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateFd,
  FD_ENGINE_VERSION,
  CompoundingFreq,
  PayoutType,
} from '../../lib/financial/fd';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const FdCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [principalStr, setPrincipalStr] = useState('100000');
  const [rateStr, setRateStr] = useState('7.0');
  const [yearsStr, setYearsStr] = useState('5');
  const [monthsStr, setMonthsStr] = useState('0');
  const [compounding, setCompounding] = useState<CompoundingFreq>('quarterly');
  const [payout, setPayout] = useState<PayoutType>('cumulative');
  const [senior, setSenior] = useState(false);
  const [taxSlabStr, setTaxSlabStr] = useState('30');
  const [applyTds, setApplyTds] = useState(false);
  const [inflationStr, setInflationStr] = useState('5');

  const result = useMemo(
    () =>
      calculateFd({
        principal: parseFloat(principalStr) || 0,
        annualRate: parseFloat(rateStr) || 0,
        tenureYears: parseFloat(yearsStr) || 0,
        tenureMonths: parseFloat(monthsStr) || 0,
        compounding,
        payout,
        seniorCitizen: senior,
        taxSlabPercent: parseFloat(taxSlabStr) || 0,
        applyTds,
        inflationPercent: parseFloat(inflationStr) || 0,
      }),
    [principalStr, rateStr, yearsStr, monthsStr, compounding, payout, senior, taxSlabStr, applyTds, inflationStr]
  );

  const reset = () => {
    setPrincipalStr('100000');
    setRateStr('7.0');
    setYearsStr('5');
    setMonthsStr('0');
    setCompounding('quarterly');
    setPayout('cumulative');
    setSenior(false);
    setTaxSlabStr('30');
    setApplyTds(false);
    setInflationStr('5');
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
            <CurrencySelector idPrefix="fd-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'PRINCIPAL', value: principalStr, set: setPrincipalStr },
            { label: 'ANNUAL RATE (%)', value: rateStr, set: setRateStr },
            { label: 'TENURE (YEARS)', value: yearsStr, set: setYearsStr },
            { label: 'EXTRA MONTHS', value: monthsStr, set: setMonthsStr },
            { label: 'TAX SLAB (%)', value: taxSlabStr, set: setTaxSlabStr },
            { label: 'INFLATION (%)', value: inflationStr, set: setInflationStr },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>{f.label}</label>
              <input type="text" inputMode="decimal" value={f.value} onChange={(e) => clean(e.target.value, f.set)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>COMPOUNDING</label>
            <select value={compounding} onChange={(e) => setCompounding(e.target.value as CompoundingFreq)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>PAYOUT</label>
            <select value={payout} onChange={(e) => setPayout(e.target.value as PayoutType)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
              <option value="cumulative">Cumulative (at maturity)</option>
              <option value="monthly">Monthly interest</option>
              <option value="quarterly">Quarterly interest</option>
              <option value="yearly">Yearly interest</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setSenior(!senior)} className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${senior ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`} style={!senior ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
            Senior citizen (+0.5%)
          </button>
          <button onClick={() => setApplyTds(!applyTds)} className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${applyTds ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''}`} style={!applyTds ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>
            Apply TDS (10%)
          </button>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>FD Results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Maturity Amount</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.maturityAmount)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>@ {result.effectiveRate.toFixed(2)}% p.a.</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Total Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInterest)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Post-tax Interest</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.postTaxInterest)}</div>
            </div>
          </div>
          {payout !== 'cumulative' && (
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              Interest payout per period: <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.interestPayoutPerPeriod)}</strong>
            </div>
          )}
          {result.tdsAmount > 0 && (
            <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
              TDS deducted: {formatAmount(result.tdsAmount)}
            </div>
          )}
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            Inflation-adjusted real maturity: <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.realMaturity)}</strong>
          </div>
          <div className="space-y-1 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{FD_ENGINE_VERSION} · 100% client-side · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default FdCalculatorView;

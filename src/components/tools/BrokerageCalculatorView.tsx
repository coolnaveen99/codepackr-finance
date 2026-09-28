import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Receipt } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateBrokerage, BROKERAGE_ENGINE_VERSION } from '../../lib/financial/brokerage';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const BrokerageCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [valueStr, setValueStr] = useState('100000');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [segment, setSegment] = useState<'delivery' | 'intraday'>('delivery');
  const [useFlat, setUseFlat] = useState(true);
  const [flatStr, setFlatStr] = useState('20');
  const [pctStr, setPctStr] = useState('0.03');

  const result = useMemo(
    () =>
      calculateBrokerage({
        tradeValue: parseFloat(valueStr) || 0,
        side,
        segment,
        useFlat,
        flatBrokerage: parseFloat(flatStr) || 20,
        brokeragePercent: parseFloat(pctStr) || 0.03,
      }),
    [valueStr, side, segment, useFlat, flatStr, pctStr]
  );

  const reset = () => {
    setValueStr('100000');
    setSide('buy');
    setSegment('delivery');
    setUseFlat(true);
    setFlatStr('20');
    setPctStr('0.03');
  };

  const active = 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]';

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
            <CurrencySelector idPrefix="brokerage-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>TRADE VALUE</label>
            <input type="text" inputMode="decimal" value={valueStr} onChange={(e) => clean(e.target.value, setValueStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>SIDE</label>
            <div className="flex gap-2">
              {(['buy', 'sell'] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`flex-1 py-2.5 rounded-xl border text-sm capitalize cursor-pointer ${side === s ? active : ''}`}
                  style={side !== s ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>SEGMENT</label>
            <div className="flex gap-2">
              {(['delivery', 'intraday'] as const).map((s) => (
                <button key={s} onClick={() => setSegment(s)} className={`flex-1 py-2.5 rounded-xl border text-sm capitalize cursor-pointer ${segment === s ? active : ''}`}
                  style={segment !== s ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>BROKERAGE PLAN</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setUseFlat(true)} className={`flex-1 py-2 rounded-xl border text-sm cursor-pointer ${useFlat ? active : ''}`}
                style={!useFlat ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>Flat ₹/order</button>
              <button onClick={() => setUseFlat(false)} className={`flex-1 py-2 rounded-xl border text-sm cursor-pointer ${!useFlat ? active : ''}`}
                style={useFlat ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>% of turnover</button>
            </div>
            {useFlat ? (
              <input type="text" inputMode="decimal" value={flatStr} onChange={(e) => clean(e.target.value, setFlatStr)}
                className="w-full px-3 py-2 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="20" />
            ) : (
              <input type="text" inputMode="decimal" value={pctStr} onChange={(e) => clean(e.target.value, setPctStr)}
                className="w-full px-3 py-2 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} placeholder="0.03" />
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-3" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Charges breakdown</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              ['Brokerage', result.brokerage],
              ['STT', result.stt],
              ['Exchange txn', result.exchangeTxnCharge],
              ['SEBI', result.sebiCharges],
              ['Stamp duty', result.stampDuty],
              ['GST', result.gst],
            ].map(([label, val]) => (
              <div key={String(label)} className="p-2 rounded-lg border" style={{ borderColor: 'var(--line)' }}>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
                <div className="font-semibold" style={{ color: 'var(--ink)' }}>{formatAmount(val as number)}</div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--brand)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Total charges</div>
            <div className="text-2xl font-bold text-[var(--brand)]">{formatAmount(result.totalCharges)}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Effective {result.effectivePercent.toFixed(4)}% of trade · Net {side === 'buy' ? 'debit' : 'credit'} ≈ {formatAmount(result.netDebitOrCredit)}
            </div>
          </div>
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
            </div>
          ))}
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{BROKERAGE_ENGINE_VERSION} · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerageCalculatorView;

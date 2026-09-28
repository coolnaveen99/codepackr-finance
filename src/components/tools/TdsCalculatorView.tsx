import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, FileText } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateTds, TDS_ENGINE_VERSION, TDS_SECTIONS, TdsSection } from '../../lib/financial/tds';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

const SECTION_OPTIONS: { id: TdsSection; label: string }[] = [
  { id: '194A', label: '194A — Interest' },
  { id: '194C', label: '194C — Contractors' },
  { id: '194H', label: '194H — Commission' },
  { id: '194I', label: '194I — Rent' },
  { id: '194J', label: '194J — Professional fees' },
  { id: '194O', label: '194O — E-commerce' },
  { id: 'custom', label: 'Custom rate' },
];

export const TdsCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [section, setSection] = useState<TdsSection>('194J');
  const [amountStr, setAmountStr] = useState('100000');
  const [pan, setPan] = useState(true);
  const [customRateStr, setCustomRateStr] = useState('10');

  const result = useMemo(
    () =>
      calculateTds({
        section,
        amount: parseFloat(amountStr) || 0,
        panAvailable: pan,
        customRatePercent: parseFloat(customRateStr) || 10,
      }),
    [section, amountStr, pan, customRateStr]
  );

  const reset = () => {
    setSection('194J');
    setAmountStr('100000');
    setPan(true);
    setCustomRateStr('10');
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
            <CurrencySelector idPrefix="tds-currency" variant="pill" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>SECTION</label>
          <select value={section} onChange={(e) => setSection(e.target.value as TdsSection)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
            {SECTION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>PAYMENT AMOUNT</label>
            <input type="text" inputMode="decimal" value={amountStr} onChange={(e) => clean(e.target.value, setAmountStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
          </div>
          {section === 'custom' && (
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>CUSTOM RATE (%)</label>
              <input type="text" inputMode="decimal" value={customRateStr} onChange={(e) => clean(e.target.value, setCustomRateStr)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
            </div>
          )}
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>PAN AVAILABLE?</label>
            <div className="flex gap-2">
              {[true, false].map((p) => (
                <button key={String(p)} onClick={() => setPan(p)} className={`flex-1 py-2.5 rounded-xl border text-sm cursor-pointer ${pan === p ? active : ''}`}
                  style={pan !== p ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}>{p ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-3" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>TDS estimate</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Rate</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{result.ratePercent}%</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>TDS amount</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.tdsAmount)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Net after TDS</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.netPayable)}</div>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Threshold used: {formatAmount(result.threshold)} · Amount above threshold: {formatAmount(result.taxableAmount)}
          </div>
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
            </div>
          ))}
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{TDS_ENGINE_VERSION} · Illustrative · Not tax advice
          </div>
        </div>
      </div>
    </div>
  );
};

export default TdsCalculatorView;

import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Plus, Trash2, TrendingUp } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateXirr, XIRR_ENGINE_VERSION, XirrCashFlow } from '../../lib/financial/xirr';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const yearAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
};

export const XirrCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [flows, setFlows] = useState<XirrCashFlow[]>([
    { date: yearAgo(), amount: -100000 },
    { date: today(), amount: 115000 },
  ]);

  const result = useMemo(() => calculateXirr(flows), [flows]);

  const update = (i: number, patch: Partial<XirrCashFlow>) => {
    setFlows((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  };

  const addRow = () => setFlows((prev) => [...prev, { date: today(), amount: 0 }]);
  const removeRow = (i: number) => setFlows((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
  const reset = () =>
    setFlows([
      { date: yearAgo(), amount: -100000 },
      { date: today(), amount: 115000 },
    ]);

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
            <CurrencySelector idPrefix="xirr-currency" variant="pill" />
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Negative amount = investment (outflow). Positive = redemption / dividend (inflow).
        </p>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold" style={{ color: 'var(--muted)' }}>
            <div className="col-span-5">Date</div>
            <div className="col-span-5">Amount</div>
            <div className="col-span-2" />
          </div>
          {flows.map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="date"
                value={f.date}
                onChange={(e) => update(i, { date: e.target.value })}
                className="col-span-5 px-3 py-2 rounded-xl border text-sm bg-transparent"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
              <input
                type="text"
                inputMode="decimal"
                value={f.amount === 0 ? '' : String(f.amount)}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.\-]/g, '');
                  update(i, { amount: v === '' || v === '-' ? 0 : parseFloat(v) });
                }}
                className="col-span-5 px-3 py-2 rounded-xl border text-sm bg-transparent"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
              <button onClick={() => removeRow(i)} className="col-span-2 p-2 rounded-lg border cursor-pointer flex justify-center" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
            <Plus className="w-4 h-4" /> Add cash flow
          </button>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-3" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>XIRR Result</h3>
          </div>
          {result.converged && result.xirrPercent != null ? (
            <div className="text-3xl font-bold text-[var(--brand)]">{result.xirrPercent.toFixed(2)}% p.a.</div>
          ) : (
            <div className="text-lg font-medium" style={{ color: 'var(--muted)' }}>Unable to compute — check cash flows</div>
          )}
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            Iterations: {result.iterations} · Converged: {result.converged ? 'yes' : 'no'}
          </div>
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
            </div>
          ))}
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{XIRR_ENGINE_VERSION} · 100% client-side
          </div>
        </div>
      </div>
    </div>
  );
};

export default XirrCalculatorView;

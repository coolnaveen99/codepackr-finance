import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Plus, Trash2, Layers } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateStockAverage, STOCK_AVERAGE_ENGINE_VERSION, StockPurchase } from '../../lib/financial/stockAverage';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

export const StockAverageCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [rows, setRows] = useState<StockPurchase[]>([
    { quantity: 10, pricePerShare: 100 },
    { quantity: 15, pricePerShare: 90 },
  ]);

  const result = useMemo(() => calculateStockAverage(rows), [rows]);

  const update = (i: number, patch: Partial<StockPurchase>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => setRows((prev) => [...prev, { quantity: 0, pricePerShare: 0 }]);
  const remove = (i: number) => setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  const reset = () => setRows([{ quantity: 10, pricePerShare: 100 }, { quantity: 15, pricePerShare: 90 }]);

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
            <CurrencySelector idPrefix="stock-avg-currency" variant="pill" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold" style={{ color: 'var(--muted)' }}>
            <div className="col-span-5">Quantity</div>
            <div className="col-span-5">Price / share</div>
            <div className="col-span-2" />
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input type="text" inputMode="decimal" value={r.quantity || ''} onChange={(e) => update(i, { quantity: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                className="col-span-5 px-3 py-2 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
              <input type="text" inputMode="decimal" value={r.pricePerShare || ''} onChange={(e) => update(i, { pricePerShare: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
                className="col-span-5 px-3 py-2 rounded-xl border text-sm bg-transparent" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
              <button onClick={() => remove(i)} className="col-span-2 p-2 rounded-lg border cursor-pointer flex justify-center" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border cursor-pointer" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
            <Plus className="w-4 h-4" /> Add purchase
          </button>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5 space-y-3" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>Average cost</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Avg price / share</div>
              <div className="text-2xl font-bold text-[var(--brand)]">{formatAmount(result.averagePrice)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Total quantity</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{result.totalQuantity}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Total invested</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.totalInvested)}</div>
            </div>
          </div>
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span>{n}</span>
            </div>
          ))}
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{STOCK_AVERAGE_ENGINE_VERSION} · 100% client-side
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAverageCalculatorView;

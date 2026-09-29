import React from 'react';
import { ArrowRight, Search, Lock } from 'lucide-react';
import { ToolDef } from '../types';
import { TOOLS } from '../data/tools';

interface FinanceHeroProps {
  onSelectTool: (tool: ToolDef) => void;
  onOpenSearch: () => void;
}

/** Unique metrics-first wealth dashboard hero — not the shared split + 3-card pattern */
export const FinanceHero: React.FC<FinanceHeroProps> = ({ onSelectTool, onOpenSearch }) => {
  const open = (pred: (t: ToolDef) => boolean) => {
    const t = TOOLS.find(pred);
    if (t) onSelectTool(t);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 shadow-md">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-teal-400/10 blur-3xl" />

      <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-10">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Client-Side · Privacy Guaranteed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Free Financial Calculators,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Built for Smart Money Decisions.
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Calculate, compare, and forecast loans, investments, retirement, salary, and personal finance — transparent assumptions, zero tracking.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('tool-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
            >
              Explore All Calculators
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:border-emerald-400 transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              Search Calculators
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500">Ctrl K</kbd>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => open(t => t.id.includes('loan') || t.id.includes('emi'))}
            className="rounded-2xl border border-emerald-200/80 bg-white/95 p-4 text-left shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Home Loan EMI</div>
            <div className="text-2xl font-black text-slate-900">₹43,391<span className="text-sm font-semibold text-slate-500">/mo</span></div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[68%] rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-500">
              <span>68% Principal</span>
              <span>32% Interest</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => open(t => t.id.includes('sip'))}
            className="rounded-2xl border border-teal-200/80 bg-white/95 p-4 text-left shadow-sm hover:border-teal-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-1">SIP Wealth Growth</div>
            <div className="text-2xl font-black text-slate-900">+₹32.4L<span className="text-sm font-semibold text-emerald-600"> gain</span></div>
            <div className="mt-2 flex items-end gap-0.5 h-8">
              {[30, 45, 55, 70, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-teal-400/80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="mt-1.5 text-[10px] font-semibold text-slate-500">₹10k/mo × 15y · 12% CAGR</div>
          </button>
          <button
            type="button"
            onClick={() => open(t => t.id.includes('fire') || t.id.includes('retirement'))}
            className="rounded-2xl border border-green-200/80 bg-white/95 p-4 text-left shadow-sm hover:border-green-400 hover:shadow-md transition cursor-pointer"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-green-700 mb-1">FIRE Early Retirement</div>
            <div className="flex items-center gap-3">
              <div className="relative size-12 shrink-0">
                <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#dcfce7" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray="78 100" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-green-700">78%</span>
              </div>
              <div>
                <div className="text-lg font-black text-slate-900">₹2.40 Cr</div>
                <div className="text-[10px] font-semibold text-slate-500">Freedom target · 4% SWR</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

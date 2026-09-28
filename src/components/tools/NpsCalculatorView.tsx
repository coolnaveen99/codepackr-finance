import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Landmark } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import { calculateNps, NPS_ENGINE_VERSION } from '../../lib/financial/nps';

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (v: string, set: (s: string) => void) => set(v.replace(/[^0-9.]/g, ''));

export const NpsCalculatorView: React.FC<Props> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();
  const [ageStr, setAgeStr] = useState('30');
  const [retireStr, setRetireStr] = useState('60');
  const [monthlyStr, setMonthlyStr] = useState('10000');
  const [returnStr, setReturnStr] = useState('10');
  const [stepUpStr, setStepUpStr] = useState('5');
  const [employerStr, setEmployerStr] = useState('0');
  const [annuityStr, setAnnuityStr] = useState('6');
  const [taxStr, setTaxStr] = useState('30');

  const result = useMemo(
    () =>
      calculateNps({
        currentAge: parseFloat(ageStr) || 30,
        retirementAge: parseFloat(retireStr) || 60,
        monthlyContribution: parseFloat(monthlyStr) || 0,
        expectedReturnPercent: parseFloat(returnStr) || 10,
        stepUpPercent: parseFloat(stepUpStr) || 0,
        employerMonthly: parseFloat(employerStr) || 0,
        annuityRatePercent: parseFloat(annuityStr) || 6,
        taxSlabPercent: parseFloat(taxStr) || 30,
      }),
    [ageStr, retireStr, monthlyStr, returnStr, stepUpStr, employerStr, annuityStr, taxStr]
  );

  const reset = () => {
    setAgeStr('30');
    setRetireStr('60');
    setMonthlyStr('10000');
    setReturnStr('10');
    setStepUpStr('5');
    setEmployerStr('0');
    setAnnuityStr('6');
    setTaxStr('30');
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
            <CurrencySelector idPrefix="nps-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'CURRENT AGE', value: ageStr, set: setAgeStr },
            { label: 'RETIREMENT AGE', value: retireStr, set: setRetireStr },
            { label: 'MONTHLY CONTRIBUTION', value: monthlyStr, set: setMonthlyStr },
            { label: 'EXPECTED RETURN (% p.a.)', value: returnStr, set: setReturnStr },
            { label: 'ANNUAL STEP-UP (%)', value: stepUpStr, set: setStepUpStr },
            { label: 'EMPLOYER MONTHLY', value: employerStr, set: setEmployerStr },
            { label: 'ANNUITY RATE (% p.a.)', value: annuityStr, set: setAnnuityStr },
            { label: 'TAX SLAB (%)', value: taxStr, set: setTaxStr },
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
            <Landmark className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>NPS Results</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Corpus at Retirement</div>
              <div className="text-xl font-bold text-[var(--brand)]">{formatAmount(result.corpusAtRetirement)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{result.years} years</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Lump Sum (60%)</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.lumpSum60)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Est. Monthly Pension</div>
              <div className="text-xl font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.estimatedMonthlyPension)}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>from 40% annuity corpus</div>
            </div>
          </div>

          <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
            <div style={{ color: 'var(--muted)' }}>Section 80CCD(1B) — extra ₹50k (old regime)</div>
            <div style={{ color: 'var(--ink)' }}>
              Annual up to {formatAmount(result.section80ccd1bAnnual)} · Est. lifetime tax savings ~ {formatAmount(result.lifetime80ccd1bSavings)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Total contributed: {formatAmount(result.totalContributed)} · Annuity corpus (40%): {formatAmount(result.annuityCorpus40)}
            </div>
          </div>

          {result.yearlyBreakdown.length > 0 && (
            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  <tr style={{ color: 'var(--muted)' }}>
                    <th className="text-left py-1">Yr</th>
                    <th className="text-left py-1">Age</th>
                    <th className="text-right py-1">Contrib</th>
                    <th className="text-right py-1">Growth</th>
                    <th className="text-right py-1">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyBreakdown.map((r) => (
                    <tr key={r.year} style={{ color: 'var(--ink)' }}>
                      <td className="py-1">{r.year}</td>
                      <td>{r.age}</td>
                      <td className="text-right">{formatAmount(r.contribution)}</td>
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
            Engine v{NPS_ENGINE_VERSION} · 100% client-side · Market-linked · Illustrative only
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpsCalculatorView;

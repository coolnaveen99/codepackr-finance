import React, { useMemo, useState } from 'react';
import {
  Info,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Activity,
  Percent,
} from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateTermInsurance,
  TERM_INSURANCE_ENGINE_VERSION,
} from '../../lib/financial/termInsurance';

interface TermInsuranceCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const TermInsuranceCalculatorView: React.FC<
  TermInsuranceCalculatorViewProps
> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { currency, formatAmount } = useCurrency();

  const [ageStr, setAgeStr] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [smoker, setSmoker] = useState(false);
  const [annualIncomeStr, setAnnualIncomeStr] = useState('360000');
  const [existingCoverStr, setExistingCoverStr] = useState('0');
  const [loansStr, setLoansStr] = useState('0');
  const [expensesStr, setExpensesStr] = useState('240000');
  const [yearsSupportStr, setYearsSupportStr] = useState('20');
  const [educationStr, setEducationStr] = useState('0');
  const [assetsStr, setAssetsStr] = useState('0');
  const [desiredCoverStr, setDesiredCoverStr] = useState('');
  const [policyTerm, setPolicyTerm] = useState(30);
  const [includeCI, setIncludeCI] = useState(false);
  const [includeADB, setIncludeADB] = useState(false);
  const [includeWOP, setIncludeWOP] = useState(false);

  const result = useMemo(() => {
    return calculateTermInsurance({
      age: parseFloat(ageStr) || 30,
      gender,
      smoker,
      annualIncome: parseFloat(annualIncomeStr) || 0,
      existingCover: parseFloat(existingCoverStr) || 0,
      outstandingLoans: parseFloat(loansStr) || 0,
      annualFamilyExpenses: parseFloat(expensesStr) || 0,
      yearsOfSupport: parseFloat(yearsSupportStr) || 20,
      educationGoals: parseFloat(educationStr) || 0,
      existingAssets: parseFloat(assetsStr) || 0,
      desiredCover: desiredCoverStr ? parseFloat(desiredCoverStr) : undefined,
      policyTerm,
      includeCI,
      includeADB,
      includeWOP,
    });
  }, [
    ageStr,
    gender,
    smoker,
    annualIncomeStr,
    existingCoverStr,
    loansStr,
    expensesStr,
    yearsSupportStr,
    educationStr,
    assetsStr,
    desiredCoverStr,
    policyTerm,
    includeCI,
    includeADB,
    includeWOP,
  ]);

  const handleReset = () => {
    setAgeStr('30');
    setGender('male');
    setSmoker(false);
    setAnnualIncomeStr('360000');
    setExistingCoverStr('0');
    setLoansStr('0');
    setExpensesStr('240000');
    setYearsSupportStr('20');
    setEducationStr('0');
    setAssetsStr('0');
    setDesiredCoverStr('');
    setPolicyTerm(30);
    setIncludeCI(false);
    setIncludeADB(false);
    setIncludeWOP(false);
  };

  return (
    <div>
      <ToolHeader tool={tool} onBackToHome={onBackToHome} onSelectRelated={onSelectRelated} />

      <div
        className="max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl border shadow-md space-y-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <div
          className="flex items-center justify-between pb-3 border-b flex-wrap gap-2"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
              Active Currency:
            </span>
            <span className="text-xs font-mono font-bold text-[var(--brand)] flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--brand)]/10">
              <span>{currency.flag}</span>
              <span>
                {currency.code} ({currency.symbol.trim()})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <CurrencySelector idPrefix="term-ins-currency" variant="pill" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              AGE
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={ageStr}
              onChange={(e) => handleCleanInput(e.target.value, setAgeStr)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              GENDER
            </label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize cursor-pointer transition-all ${
                    gender === g ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''
                  }`}
                  style={gender !== g ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              SMOKER?
            </label>
            <div className="flex gap-2">
              {[false, true].map((s) => (
                <button
                  key={String(s)}
                  onClick={() => setSmoker(s)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                    smoker === s ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]' : ''
                  }`}
                  style={smoker !== s ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}
                >
                  {s ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
              POLICY TERM (YRS)
            </label>
            <select
              value={policyTerm}
              onChange={(e) => setPolicyTerm(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              {[10, 15, 20, 25, 30, 35, 40].map((t) => (
                <option key={t} value={t}>
                  {t} years
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'ANNUAL INCOME', value: annualIncomeStr, set: setAnnualIncomeStr, hint: 'Rs 30k/mo = 3.6L' },
            { label: 'EXISTING TERM COVER', value: existingCoverStr, set: setExistingCoverStr },
            { label: 'OUTSTANDING LOANS', value: loansStr, set: setLoansStr },
            { label: 'ANNUAL FAMILY EXPENSES', value: expensesStr, set: setExpensesStr },
            { label: 'YEARS OF SUPPORT NEEDED', value: yearsSupportStr, set: setYearsSupportStr },
            { label: 'EDUCATION / GOALS CORPUS', value: educationStr, set: setEducationStr },
            { label: 'EXISTING LIQUID ASSETS', value: assetsStr, set: setAssetsStr },
            { label: 'DESIRED COVER (OPTIONAL)', value: desiredCoverStr, set: setDesiredCoverStr, hint: 'Leave blank for recommended' },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
                {f.label}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={f.value}
                onChange={(e) => handleCleanInput(e.target.value, f.set)}
                placeholder={f.hint}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-bold block mb-2" style={{ color: 'var(--ink)' }}>
            OPTIONAL RIDERS (ILLUSTRATIVE COST)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setIncludeCI(!includeCI)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer transition-all ${
                includeCI ? 'border-[var(--brand)] bg-[var(--brand)]/10' : ''
              }`}
              style={!includeCI ? { borderColor: 'var(--line)' } : undefined}
            >
              <Heart className="w-4 h-4 shrink-0" style={{ color: includeCI ? 'var(--brand)' : 'var(--muted)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--ink)' }}>Critical Illness</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>~35% of base</div>
              </div>
            </button>
            <button
              onClick={() => setIncludeADB(!includeADB)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer transition-all ${
                includeADB ? 'border-[var(--brand)] bg-[var(--brand)]/10' : ''
              }`}
              style={!includeADB ? { borderColor: 'var(--line)' } : undefined}
            >
              <Activity className="w-4 h-4 shrink-0" style={{ color: includeADB ? 'var(--brand)' : 'var(--muted)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--ink)' }}>Accidental / Disability</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>~8% of base</div>
              </div>
            </button>
            <button
              onClick={() => setIncludeWOP(!includeWOP)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer transition-all ${\n                includeWOP ? 'border-[var(--brand)] bg-[var(--brand)]/10' : ''
              }`}
              style={!includeWOP ? { borderColor: 'var(--line)' } : undefined}
            >
              <Percent className="w-4 h-4 shrink-0" style={{ color: includeWOP ? 'var(--brand)' : 'var(--muted)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--ink)' }}>Waiver of Premium</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>~12% of base</div>
              </div>
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-4"
          style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>
              Cover & Premium Estimate
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Income Multiple
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.coverIncomeMultiple)}
              </div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Human Life Value
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.coverHLV)}
              </div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Needs-Based
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.coverNeedsBased)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="p-4 rounded-xl border-2"
              style={{
                borderColor: result.isCoverLocked ? '#f59e0b' : 'var(--brand)',
                backgroundColor: result.isCoverLocked ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.06)',
              }}
            >
              <div className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                {result.isCoverLocked ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Insurer-Eligible Max (Locked)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected / Recommended Cover
                  </>
                )}
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.selectedCover)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Eligible max ~ {formatAmount(result.eligibleMaxCover)} ({result.eligibleMultipleUsed.toFixed(0)}x income)
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Est. Annual Premium (Base)
              </div>
              <div className="text-2xl font-bold text-[var(--brand)]">
                {formatAmount(result.estimatedAnnualPremium)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                ~ {formatAmount(result.estimatedMonthlyPremium)}/mo · Rs {result.premiumPerLakh}/lakh
              </div>
            </div>
          </div>

          {(includeCI || includeADB || includeWOP) && (
            <div className="p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
              <div className="font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                With selected riders
              </div>
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                {includeCI && <span>CI +{formatAmount(result.riderCI)}</span>}
                {includeADB && <span>ADB +{formatAmount(result.riderADB)}</span>}
                {includeWOP && <span>WOP +{formatAmount(result.riderWOP)}</span>}
              </div>
              <div className="mt-1 font-bold" style={{ color: 'var(--ink)' }}>
                Total ~ {formatAmount(result.totalWithRiders)}/yr
              </div>
            </div>
          )}

          {result.costOfDelayOneYear > 0 && (
            <div
              className="p-3 rounded-xl border flex items-start gap-2"
              style={{ borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.06)' }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <div className="text-sm">
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                  Cost of waiting 1 year:
                </span>{' '}
                <span style={{ color: 'var(--muted)' }}>
                  roughly {formatAmount(result.costOfDelayOneYear)} extra over the full policy term because of higher age-based rates.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{TERM_INSURANCE_ENGINE_VERSION} · 100% client-side · Illustrative only · Not a real quote.
            Check IRDAI claim settlement ratios before purchase. Many plans also offer small lump-sum + monthly
            payout, optional 7% annual cover increase, and flexible premium paying terms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermInsuranceCalculatorView;

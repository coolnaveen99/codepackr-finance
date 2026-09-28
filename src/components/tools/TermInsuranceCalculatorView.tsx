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

interface Props {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const clean = (value: string, setter: (v: string) => void) => {
  setter(value.replace(/[^0-9.]/g, ''));
};

/** Cover-till ages commonly used for term planning */
const COVER_TILL_OPTIONS = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

export const TermInsuranceCalculatorView: React.FC<Props> = ({
  tool,
  onBackToHome,
  onSelectRelated,
}) => {
  const { currency, formatAmount } = useCurrency();

  const [ageStr, setAgeStr] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [smoker, setSmoker] = useState(false);
  const [coverTillAge, setCoverTillAge] = useState(70);
  const [lifeCoverStr, setLifeCoverStr] = useState('10000000');
  const [annualIncomeStr, setAnnualIncomeStr] = useState('600000');
  const [existingCoverStr, setExistingCoverStr] = useState('0');
  const [loansStr, setLoansStr] = useState('0');
  const [expensesStr, setExpensesStr] = useState('300000');
  const [yearsSupportStr, setYearsSupportStr] = useState('20');
  const [educationStr, setEducationStr] = useState('0');
  const [assetsStr, setAssetsStr] = useState('0');
  const [includeCI, setIncludeCI] = useState(false);
  const [includeADB, setIncludeADB] = useState(false);
  const [includeWOP, setIncludeWOP] = useState(false);

  const ageNum = parseFloat(ageStr) || 30;
  const tillOptions = COVER_TILL_OPTIONS.filter((t) => t >= ageNum + 5);

  const result = useMemo(() => {
    return calculateTermInsurance({
      age: ageNum,
      gender,
      smoker,
      annualIncome: parseFloat(annualIncomeStr) || 0,
      existingCover: parseFloat(existingCoverStr) || 0,
      outstandingLoans: parseFloat(loansStr) || 0,
      annualFamilyExpenses: parseFloat(expensesStr) || 0,
      yearsOfSupport: parseFloat(yearsSupportStr) || 20,
      educationGoals: parseFloat(educationStr) || 0,
      existingAssets: parseFloat(assetsStr) || 0,
      desiredCover: parseFloat(lifeCoverStr) || undefined,
      coverTillAge,
      includeCI,
      includeADB,
      includeWOP,
    });
  }, [
    ageNum,
    gender,
    smoker,
    coverTillAge,
    lifeCoverStr,
    annualIncomeStr,
    existingCoverStr,
    loansStr,
    expensesStr,
    yearsSupportStr,
    educationStr,
    assetsStr,
    includeCI,
    includeADB,
    includeWOP,
  ]);

  const handleReset = () => {
    setAgeStr('30');
    setGender('male');
    setSmoker(false);
    setCoverTillAge(70);
    setLifeCoverStr('10000000');
    setAnnualIncomeStr('600000');
    setExistingCoverStr('0');
    setLoansStr('0');
    setExpensesStr('300000');
    setYearsSupportStr('20');
    setEducationStr('0');
    setAssetsStr('0');
    setIncludeCI(false);
    setIncludeADB(false);
    setIncludeWOP(false);
  };

  const activeBtn = 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]';
  const riderActive = 'border-[var(--brand)] bg-[var(--brand)]/10';

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
          <span className="text-xs font-mono font-bold text-[var(--brand)]">
            {currency.flag} {currency.code}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <CurrencySelector idPrefix="term-ins-currency" variant="pill" />
          </div>
        </div>

        {/* —— Quick premium inputs —— */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--ink)' }}>
            Premium inputs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
                CURRENT AGE
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={ageStr}
                onChange={(e) => clean(e.target.value, setAgeStr)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
                LIFE COVER (SUM ASSURED)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={lifeCoverStr}
                onChange={(e) => clean(e.target.value, setLifeCoverStr)}
                placeholder="e.g. 10000000 for 1 Cr"
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
                COVER TILL AGE
              </label>
              <select
                value={coverTillAge}
                onChange={(e) => setCoverTillAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent cursor-pointer"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                {(tillOptions.length ? tillOptions : COVER_TILL_OPTIONS).map((t) => (
                  <option key={t} value={t}>
                    {t} years ({Math.max(5, t - ageNum)} yr term)
                  </option>
                ))}
              </select>
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
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize cursor-pointer ${gender === g ? activeBtn : ''}`}
                    style={gender !== g ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>SMOKER?</span>
            {[false, true].map((s) => (
              <button
                key={String(s)}
                onClick={() => setSmoker(s)}
                className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${smoker === s ? activeBtn : ''}`}
                style={smoker !== s ? { borderColor: 'var(--line)', color: 'var(--ink)' } : undefined}
              >
                {s ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* —— Premium result (primary) —— */}
        <div
          className="rounded-2xl border-2 p-4 sm:p-5 space-y-4"
          style={{ borderColor: 'var(--brand)', backgroundColor: 'rgba(16,185,129,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--brand)]" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--ink)' }}>
              Estimated premium
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Cover {formatAmount(parseFloat(lifeCoverStr) || 0)} till age {result.coverTillAge}{' '}
            ({result.policyTermYears} year term) · age {ageNum} · {gender}
            {smoker ? ' · smoker' : ' · non-smoker'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border bg-[var(--surface)]" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Monthly premium
              </div>
              <div className="text-3xl font-bold text-[var(--brand)]">
                {formatAmount(result.estimatedMonthlyPremium)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                ~ ₹{result.premiumPerLakh} per lakh / year
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-[var(--surface)]" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>
                Yearly premium
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--ink)' }}>
                {formatAmount(result.estimatedAnnualPremium)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Paid annually (illustrative)
              </div>
            </div>
          </div>
          {result.costOfDelayOneYear > 0 && (
            <div
              className="p-3 rounded-xl border flex items-start gap-2 text-sm"
              style={{ borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.06)' }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              <span style={{ color: 'var(--muted)' }}>
                Waiting 1 year raises rate to ~{formatAmount(result.annualPremiumIfDelayedOneYear)}/yr — about{' '}
                <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.costOfDelayOneYear)}</strong> extra over the full term.
              </span>
            </div>
          )}
        </div>

        {/* —— Riders —— */}
        <div>
          <label className="text-xs font-bold block mb-2" style={{ color: 'var(--ink)' }}>
            OPTIONAL RIDERS (ILLUSTRATIVE)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setIncludeCI(!includeCI)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer ${includeCI ? riderActive : ''}`}
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
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer ${includeADB ? riderActive : ''}`}
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
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm cursor-pointer ${includeWOP ? riderActive : ''}`}
              style={!includeWOP ? { borderColor: 'var(--line)' } : undefined}
            >
              <Percent className="w-4 h-4 shrink-0" style={{ color: includeWOP ? 'var(--brand)' : 'var(--muted)' }} />
              <div>
                <div className="font-medium" style={{ color: 'var(--ink)' }}>Waiver of Premium</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>~12% of base</div>
              </div>
            </button>
          </div>
          {(includeCI || includeADB || includeWOP) && (
            <div className="mt-3 p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--line)' }}>
              With riders: <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.totalWithRidersMonthly)}/mo</strong>
              {' · '}
              <strong style={{ color: 'var(--ink)' }}>{formatAmount(result.totalWithRidersAnnual)}/yr</strong>
            </div>
          )}
        </div>

        {/* —— How much cover do you need? —— */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--ink)' }}>
            How much cover do you need? (optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'ANNUAL INCOME', value: annualIncomeStr, set: setAnnualIncomeStr },
              { label: 'EXISTING TERM COVER', value: existingCoverStr, set: setExistingCoverStr },
              { label: 'OUTSTANDING LOANS', value: loansStr, set: setLoansStr },
              { label: 'ANNUAL FAMILY EXPENSES', value: expensesStr, set: setExpensesStr },
              { label: 'YEARS OF SUPPORT NEEDED', value: yearsSupportStr, set: setYearsSupportStr },
              { label: 'EDUCATION / GOALS CORPUS', value: educationStr, set: setEducationStr },
              { label: 'EXISTING LIQUID ASSETS', value: assetsStr, set: setAssetsStr },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-bold block mb-1.5" style={{ color: 'var(--ink)' }}>
                  {f.label}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={f.value}
                  onChange={(e) => clean(e.target.value, f.set)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium bg-transparent"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-5 space-y-4"
          style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--line)' }}
        >
          <h3 className="font-bold" style={{ color: 'var(--ink)' }}>
            Cover recommendation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Income Multiple</div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.coverIncomeMultiple)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Human Life Value</div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.coverHLV)}</div>
            </div>
            <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--line)' }}>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>Needs-Based</div>
              <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{formatAmount(result.coverNeedsBased)}</div>
            </div>
          </div>
          <div
            className="p-4 rounded-xl border-2"
            style={{
              borderColor: result.isCoverLocked ? '#f59e0b' : 'var(--brand)',
              backgroundColor: result.isCoverLocked ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.06)',
            }}
          >
            <div className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
              {result.isCoverLocked ? (
                <><AlertTriangle className="w-3.5 h-3.5" /> Insurer-eligible max (income lock)</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Recommended cover</>
              )}
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
              {formatAmount(result.selectedCover)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Eligible max ~ {formatAmount(result.eligibleMaxCover)}
              {result.eligibleMultipleUsed > 0 ? ` (${result.eligibleMultipleUsed.toFixed(0)}× income)` : ''}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {result.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] pt-2 border-t" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Engine v{TERM_INSURANCE_ENGINE_VERSION} · 100% client-side · Illustrative only · Not a real quote
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermInsuranceCalculatorView;

import React, { useMemo, useState } from 'react';
import { Info, RotateCcw, Rocket, Layers, CheckCircle2, TrendingUp, Sliders } from 'lucide-react';
import { ToolDef } from '../../types';
import { ToolHeader } from '../ToolHeader';
import { useCurrency } from '../../lib/CurrencyContext';
import { CurrencySelector } from '../CurrencySelector';
import {
  calculateStartupValuation,
  StartupValuationInputs,
} from '../../lib/financial/startupValuation';

interface StartupValuationCalculatorViewProps {
  tool: ToolDef;
  onBackToHome?: () => void;
  onSelectRelated?: (t: ToolDef) => void;
}

const handleCleanInput = (value: string, setter: (v: string) => void) => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  setter(cleaned);
};

export const StartupValuationCalculatorView: React.FC<
  StartupValuationCalculatorViewProps
> = ({ tool, onBackToHome, onSelectRelated }) => {
  const { formatAmount } = useCurrency();

  // Berkus Criteria (0 - 500k each)
  const [soundIdea, setSoundIdea] = useState(400000);
  const [prototypeQuality, setPrototypeQuality] = useState(350000);
  const [qualityTeam, setQualityTeam] = useState(450000);
  const [strategicRelationships, setStrategicRelationships] = useState(300000);
  const [productRollout, setProductRollout] = useState(250000);

  // Scorecard / Market Comparable
  const [benchmarkPreMoneyStr, setBenchmarkPreMoneyStr] = useState('2000000');
  const [teamScore, setTeamScore] = useState(1.15); // 0.5 to 1.5
  const [marketSizeScore, setMarketSizeScore] = useState(1.1);
  const [productScore, setProductScore] = useState(1.0);
  const [competitionScore, setCompetitionScore] = useState(0.95);
  const [marketingScore, setMarketingScore] = useState(0.9);

  // Venture Capital Method
  const [targetExitYearStr, setTargetExitYearStr] = useState('5');
  const [projectedExitValuationStr, setProjectedExitValuationStr] = useState('25000000');
  const [targetRoiMultiplierStr, setTargetRoiMultiplierStr] = useState('10');
  const [investmentAmountStr, setInvestmentAmountStr] = useState('500000');
  const [anticipatedDilutionPercentStr, setAnticipatedDilutionPercentStr] = useState('20');

  const benchmarkPreMoney = parseFloat(benchmarkPreMoneyStr) || 2000000;
  const targetExitYear = parseFloat(targetExitYearStr) || 5;
  const projectedExitValuation = parseFloat(projectedExitValuationStr) || 25000000;
  const targetRoiMultiplier = parseFloat(targetRoiMultiplierStr) || 10;
  const investmentAmount = parseFloat(investmentAmountStr) || 500000;
  const anticipatedDilutionPercent = parseFloat(anticipatedDilutionPercentStr) || 20;

  const result = useMemo(() => {
    const inputs: StartupValuationInputs = {
      berkus: {
        soundIdea,
        prototypeQuality,
        qualityTeam,
        strategicRelationships,
        productRollout,
      },
      scorecard: {
        benchmarkPreMoney,
        teamScore,
        marketSizeScore,
        productScore,
        competitionScore,
        marketingScore,
      },
      vcMethod: {
        targetExitYear,
        projectedExitValuation,
        targetRoiMultiplier,
        investmentAmount,
        anticipatedDilutionPercent,
      },
    };
    return calculateStartupValuation(inputs);
  }, [
    soundIdea,
    prototypeQuality,
    qualityTeam,
    strategicRelationships,
    productRollout,
    benchmarkPreMoney,
    teamScore,
    marketSizeScore,
    productScore,
    competitionScore,
    marketingScore,
    targetExitYear,
    projectedExitValuation,
    targetRoiMultiplier,
    investmentAmount,
    anticipatedDilutionPercent,
  ]);

  const handleReset = () => {
    setSoundIdea(400000);
    setPrototypeQuality(350000);
    setQualityTeam(450000);
    setStrategicRelationships(300000);
    setProductRollout(250000);
    setBenchmarkPreMoneyStr('2000000');
    setTeamScore(1.15);
    setMarketSizeScore(1.1);
    setProductScore(1.0);
    setCompetitionScore(0.95);
    setMarketingScore(0.9);
    setTargetExitYearStr('5');
    setProjectedExitValuationStr('25000000');
    setTargetRoiMultiplierStr('10');
    setInvestmentAmountStr('500000');
    setAnticipatedDilutionPercentStr('20');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ToolHeader
        tool={tool}
        onBack={onBackToHome}
        actions={
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
              title="Reset Default Values"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-5">
          {/* Method 1: Berkus Method */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3.5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                1. Dave Berkus Pre-Revenue Model
              </h3>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatAmount(result.berkusValuation)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Sound Idea / Basic Value:</span>
                  <span className="font-mono text-slate-500">{formatAmount(soundIdea)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={soundIdea}
                  onChange={(e) => setSoundIdea(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Quality Prototype / De-risking:</span>
                  <span className="font-mono text-slate-500">{formatAmount(prototypeQuality)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={prototypeQuality}
                  onChange={(e) => setPrototypeQuality(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Quality Management / Execution Team:</span>
                  <span className="font-mono text-slate-500">{formatAmount(qualityTeam)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={qualityTeam}
                  onChange={(e) => setQualityTeam(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Strategic Alliances &amp; Partners:</span>
                  <span className="font-mono text-slate-500">{formatAmount(strategicRelationships)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={strategicRelationships}
                  onChange={(e) => setStrategicRelationships(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Product Rollout or Sales Traction:</span>
                  <span className="font-mono text-slate-500">{formatAmount(productRollout)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={productRollout}
                  onChange={(e) => setProductRollout(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Method 2: Venture Capital Method */}
          <div
            className="p-5 rounded-2xl border shadow-xs space-y-3.5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                2. Venture Capital (VC) Method
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatAmount(result.vcPreMoneyValuation)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Projected Exit Value
                </label>
                <input
                  type="text"
                  value={projectedExitValuationStr}
                  onChange={(e) => handleCleanInput(e.target.value, setProjectedExitValuationStr)}
                  className="w-full px-3 py-1.5 rounded-xl border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="25000000"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  VC Target Return (Multiple)
                </label>
                <input
                  type="text"
                  value={targetRoiMultiplierStr}
                  onChange={(e) => handleCleanInput(e.target.value, setTargetRoiMultiplierStr)}
                  className="w-full px-3 py-1.5 rounded-xl border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investment Sought
                </label>
                <input
                  type="text"
                  value={investmentAmountStr}
                  onChange={(e) => handleCleanInput(e.target.value, setInvestmentAmountStr)}
                  className="w-full px-3 py-1.5 rounded-xl border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Future Dilution Buffer (%)
                </label>
                <input
                  type="text"
                  value={anticipatedDilutionPercentStr}
                  onChange={(e) => handleCleanInput(e.target.value, setAnticipatedDilutionPercentStr)}
                  className="w-full px-3 py-1.5 rounded-xl border font-mono"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--line)' }}
                  placeholder="20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results */}
        <div className="lg:col-span-6 space-y-5">
          <div
            className="p-6 rounded-2xl border shadow-xs space-y-5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Synthesized Valuation Benchmark
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Pre-Money Equity
              </span>
            </div>

            {/* Triangulated Average Hero */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200/60 dark:border-blue-800/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Triangulated Pre-Money Valuation
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                {formatAmount(result.triangulatedValuation)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Blended synthesis across Berkus, Scorecard, and VC Method frameworks
              </p>
            </div>

            {/* Method Breakdown Table */}
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--line)' }}>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Methodology</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Target Stage</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Implied Pre-Money</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-blue-600 dark:text-blue-400">
                      Berkus Method
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans">Idea / Pre-Seed</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.berkusValuation)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-indigo-600 dark:text-indigo-400">
                      Scorecard Valuation
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans">Angel / Seed</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.scorecardValuation)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                      VC Method
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-sans">Institutional Seed</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(result.vcPreMoneyValuation)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Investor Equity Stake */}
            <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Implied Investor Ownership for {formatAmount(investmentAmount)} Check:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                  {result.vcRequiredEquityPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${Math.min(100, result.vcRequiredEquityPercent)}%` }}
                />
                <div
                  className="bg-slate-300 dark:bg-slate-600 h-full transition-all"
                  style={{ width: `${Math.max(0, 100 - result.vcRequiredEquityPercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Investor Stake ({result.vcRequiredEquityPercent.toFixed(1)}%)</span>
                <span>Founders &amp; Pool ({(100 - result.vcRequiredEquityPercent).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Note */}
      <div
        className="p-6 rounded-2xl border shadow-xs space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
      >
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Pre-Revenue Angel &amp; Venture Valuation Frameworks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Berkus Risk-Capping</span>
            Assigns up to $500k to each of 5 foundational business pillars, providing an objective $0–$2.5M valuation range before historical financials exist.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Payne Scorecard Comparison</span>
            Benchmarks against median angel transactions in your geographic hub, adjusting by weighted factor scores for team caliber and market size.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border" style={{ borderColor: 'var(--line)' }}>
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Venture Capital Backward Math</span>
            Works backward from an expected acquisition price, dividing by the required fund hurdle multiple (typically 10x-30x) to establish today's post-money price.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  Landmark,
  PiggyBank,
  Target,
  BadgeIndianRupee,
  ShieldCheck,
  LineChart,
  WalletCards,
  ArrowRight,
  Sparkles,
  Calculator,
  Percent,
  Calendar,
  Layers,
  Scale,
  CreditCard,
  Building,
  BriefcaseBusiness,
} from 'lucide-react';
import { ToolDef } from '../types';
import { TOOLS } from '../data/tools';
import { useCurrency } from '../lib/CurrencyContext';

// Helper Components for Rich Mini Graphical Charts
interface MiniSparklineProps {
  id: string;
  strokeColor: string;
  gradientColor: string;
  pathD: string;
  areaD: string;
  height?: number;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  id,
  strokeColor,
  gradientColor,
  pathD,
  areaD,
  height = 32,
}) => (
  <div className="w-full relative overflow-hidden" style={{ height }}>
    <svg
      className="w-full h-full"
      viewBox="0 0 200 32"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={gradientColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="animate-draw-line"
      />
      <path
        d={areaD}
        fill={`url(#grad-${id})`}
        className="animate-fade-chart-area"
      />
    </svg>
  </div>
);

interface Segment {
  width: string;
  color: string;
  label?: string;
  dotColor?: string;
}

const MiniSegmentedBar: React.FC<{
  segments: Segment[];
  className?: string;
}> = ({ segments, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
      {segments.map((s, idx) => (
        <div
          key={idx}
          className={`${s.color} h-full transition-all duration-700 ease-out`}
          style={{ width: s.width }}
          title={s.label}
        />
      ))}
    </div>
    <div className="flex items-center justify-between text-[10px] text-[color:var(--ink-muted)]">
      {segments.map((s, idx) => (
        <span key={idx} className="flex items-center gap-1 truncate">
          <span
            className={`w-1.5 h-1.5 rounded-full ${s.dotColor || s.color}`}
          />
          {s.label}
        </span>
      ))}
    </div>
  </div>
);

const MiniProgressRing: React.FC<{
  percent: number;
  strokeColor: string;
  label?: string;
  size?: number;
}> = ({ percent, strokeColor, label, size = 36 }) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="3.5"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      <span className="absolute text-[9px] font-black text-[color:var(--ink)] tabular-nums">
        {percent}%
      </span>
    </div>
  );
};

export type HeroToolAd = {
  id: string;
  toolId: string;
  title: string;
  badge: string;
  badgeTone: 'emerald' | 'teal' | 'purple' | 'blue' | 'amber';
  icon: React.ComponentType<{ className?: string }>;
  body: React.ReactNode;
  footerLeft: string;
  cta: string;
  accent: 'blue' | 'teal' | 'purple' | 'orange' | 'cyan' | 'emerald';
};

interface HeroPreviewCardsProps {
  onSelectTool: (tool: ToolDef) => void;
  visibleSlots?: 2 | 3;
}

export const HeroPreviewCards: React.FC<HeroPreviewCardsProps> = ({
  onSelectTool,
  visibleSlots = 3,
}) => {
  const { currency } = useCurrency();
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Large rotating pool of 25 authentic finance tool ads, ALL featuring rich interactive charts
  const adPool: HeroToolAd[] = useMemo(() => {
    const isINR = currency.code === 'INR';
    const sym = currency.symbol.trim();

    return [
      {
        id: 'ad-emi',
        toolId: 'loan-calculator',
        title: 'Home Loan EMI',
        badge: '8.5% APR',
        badgeTone: 'emerald',
        icon: Landmark,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center text-[11px] text-[color:var(--ink-muted)]">
              <span>{isINR ? '₹50,00,000 · 20Y' : `${sym}400,000 · 30Y`}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isINR ? '₹43,391/mo' : `${sym}2,528/mo`}
              </span>
            </div>
            {/* Visual Principal vs Interest Bar */}
            <MiniSegmentedBar
              segments={[
                { width: '68%', color: 'bg-emerald-500', label: '68% Principal', dotColor: 'bg-emerald-500' },
                { width: '32%', color: 'bg-amber-400', label: '32% Interest', dotColor: 'bg-amber-400' },
              ]}
            />
          </div>
        ),
        footerLeft: 'Amortization · 100% private',
        cta: 'Calculate EMI',
      },
      {
        id: 'ad-sip',
        toolId: 'sip-calculator',
        title: 'SIP Wealth Growth',
        badge: '12.0% CAGR',
        badgeTone: 'teal',
        icon: TrendingUp,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? '₹10,000/mo × 15y' : `${sym}500/mo × 15y`}
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {isINR ? '+₹32.46L Gain' : `+${sym}184.2K Gain`}
              </span>
            </div>
            {/* Upward Compounding Curve Sparkline SVG */}
            <MiniSparkline
              id="sip"
              strokeColor="#14b8a6"
              gradientColor="#14b8a6"
              pathD="M0 29 Q 60 27, 110 17 T 200 3"
              areaD="M0 29 Q 60 27, 110 17 T 200 3 L 200 32 L 0 32 Z"
            />
            <div className="flex items-center justify-between text-[10px] text-[color:var(--ink-muted)] pt-0.5">
              <span>Target Corpus:</span>
              <strong className="text-xs font-extrabold text-[color:var(--ink)]">
                {isINR ? '₹50.46 Lakh' : `${sym}274,200`}
              </strong>
            </div>
          </div>
        ),
        footerLeft: 'Exponential compounding',
        cta: 'Build SIP Plan',
      },
      {
        id: 'ad-fire',
        toolId: 'fire-calculator',
        title: 'FIRE Early Retirement',
        badge: '25× Rule',
        badgeTone: 'purple',
        icon: Target,
        accent: 'purple',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={78}
                strokeColor="stroke-purple-500"
                label="FIRE"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">
                    {isINR ? 'Expenses ₹80k/mo' : `Expenses ${sym}4k/mo`}
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">4% SWR</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[color:var(--ink-muted)]">Freedom Target:</span>
                  <span className="text-xs font-extrabold text-[color:var(--ink)]">
                    {isINR ? '₹2.40 Crore' : `${sym}1,200,000`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Lean & Fat FIRE glidepath',
        cta: 'Check Timeline',
      },
      {
        id: 'ad-savings-goal',
        toolId: 'savings-goal-calculator',
        title: 'Savings Goal Projector',
        badge: '6 Vehicles',
        badgeTone: 'emerald',
        icon: PiggyBank,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={65}
                strokeColor="stroke-emerald-500"
                label="Saved"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">
                    {isINR ? 'Target ₹1,00,000' : `Target ${sym}10,000`}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {isINR ? '₹16,394/mo' : `${sym}1,640/mo`}
                  </span>
                </div>
                <div className="text-[10px] text-[color:var(--ink-muted)] flex justify-between">
                  <span>6 Month Horizon</span>
                  <span className="text-emerald-600 font-semibold">On Track</span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Reverse Annuity PMT',
        cta: 'Compare 6 Plans',
      },
      {
        id: 'ad-tax',
        toolId: 'income-tax-calculator',
        title: 'Income Tax Estimator',
        badge: 'New vs Old',
        badgeTone: 'blue',
        icon: Landmark,
        accent: 'blue',
        body: (
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Gross Salary ₹15.0L' : `Gross Pay ${sym}100k`}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {isINR ? 'Save ₹46,800' : 'Optimized Slab'}
              </span>
            </div>
            {/* Dual Tax Regime Comparison Bar */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-12 text-[color:var(--ink-muted)]">New:</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[38%]" />
                </div>
                <span className="font-bold text-emerald-600 text-[10px]">Lower Tax</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-12 text-[color:var(--ink-muted)]">Old:</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 w-[62%]" />
                </div>
                <span className="text-[color:var(--ink-muted)] text-[10px]">Standard</span>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'FY 2024-25 & 2025-26 regimes',
        cta: 'Compare Regimes',
      },
      {
        id: 'ad-ctc',
        toolId: 'ctc-to-in-hand-calculator',
        title: 'CTC to In-Hand Pay',
        badge: 'Take-Home',
        badgeTone: 'emerald',
        icon: BadgeIndianRupee,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Annual CTC ₹18.0L' : `Annual CTC ${sym}120k`}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {isINR ? '₹1.14L/mo Net' : `${sym}7,620/mo`}
              </span>
            </div>
            {/* Net In-Hand vs Deductions Bar */}
            <MiniSegmentedBar
              segments={[
                { width: '74%', color: 'bg-emerald-500', label: '74% In-Hand', dotColor: 'bg-emerald-500' },
                { width: '18%', color: 'bg-blue-400', label: '18% Tax', dotColor: 'bg-blue-400' },
                { width: '8%', color: 'bg-amber-400', label: '8% EPF', dotColor: 'bg-amber-400' },
              ]}
            />
          </div>
        ),
        footerLeft: 'Statutory salary breakdown',
        cta: 'Compute Take-Home',
      },
      {
        id: 'ad-lumpsum',
        toolId: 'lumpsum-calculator',
        title: 'Compound Interest',
        badge: 'Exponential',
        badgeTone: 'teal',
        icon: LineChart,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Deposit ₹2.0L @ 11%' : `Deposit ${sym}20k @ 11%`}
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">15 Years</span>
            </div>
            <MiniSparkline
              id="lumpsum"
              strokeColor="#0d9488"
              gradientColor="#0d9488"
              pathD="M0 28 Q 70 26, 120 15 T 200 4"
              areaD="M0 28 Q 70 26, 120 15 T 200 4 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Maturity Value:</span>
              <span className="text-xs font-extrabold text-[color:var(--ink)]">
                {isINR ? '₹9.56 Lakh (4.7×)' : `${sym}95,600 (4.7×)`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Compounding frequency options',
        cta: 'Model Compounding',
      },
      {
        id: 'ad-prepayment',
        toolId: 'loan-prepayment-calculator',
        title: 'Loan Prepayment Saver',
        badge: 'Save Interest',
        badgeTone: 'amber',
        icon: WalletCards,
        accent: 'orange',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">+₹5,000 / mo extra</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {isINR ? 'Save ₹8.2L' : `Save ${sym}42k`}
              </span>
            </div>
            {/* Interest Saved vs Retained Bar */}
            <MiniSegmentedBar
              segments={[
                { width: '42%', color: 'bg-emerald-500', label: '42% Saved', dotColor: 'bg-emerald-500' },
                { width: '58%', color: 'bg-slate-300 dark:bg-slate-600', label: '58% Balance', dotColor: 'bg-slate-400' },
              ]}
            />
            <div className="flex justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Pay off 4.2 years early</span>
              <span className="text-emerald-600 font-bold">Fast Freedom</span>
            </div>
          </div>
        ),
        footerLeft: 'Lump-sum & recurring simulations',
        cta: 'Model Savings',
      },
      {
        id: 'ad-emergency-fund',
        toolId: 'emergency-fund-calculator',
        title: 'Emergency Cushion',
        badge: '6 Months',
        badgeTone: 'emerald',
        icon: ShieldCheck,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={100}
                strokeColor="stroke-emerald-500"
                label="Safe"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">
                    {isINR ? 'Expenses ₹55k/mo' : `Expenses ${sym}3.5k/mo`}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Fully Funded</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[color:var(--ink-muted)]">6m Safety Reserve:</span>
                  <span className="text-xs font-extrabold text-[color:var(--ink)]">
                    {isINR ? '₹3.30 Lakh' : `${sym}21,000`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Liquid vs High-Yield parking',
        cta: 'Calculate Safety',
      },
      {
        id: 'ad-dti',
        toolId: 'debt-to-income-calculator',
        title: 'Debt-to-Income (DTI)',
        badge: 'Risk Ratio',
        badgeTone: 'blue',
        icon: Scale,
        accent: 'blue',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={27}
                strokeColor="stroke-blue-500"
                label="DTI"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">Debt 26.7% / Inc</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt;36% Max</span>
                </div>
                <div className="text-[10px] text-[color:var(--ink-muted)] flex justify-between">
                  <span>Lender Rating:</span>
                  <span className="text-emerald-600 font-bold">Prime Approval</span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Lender threshold audits',
        cta: 'Check DTI Health',
      },
      {
        id: 'ad-cagr',
        toolId: 'cagr-calculator',
        title: 'CAGR Growth Rate',
        badge: 'Annualized',
        badgeTone: 'teal',
        icon: LineChart,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? '₹1.5L → ₹4.2L in 7y' : `${sym}15k → ${sym}42k in 7y`}
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">15.85% p.a.</span>
            </div>
            <MiniSparkline
              id="cagr"
              strokeColor="#0d9488"
              gradientColor="#0d9488"
              pathD="M0 27 Q 60 25, 120 15 T 200 4"
              areaD="M0 27 Q 60 25, 120 15 T 200 4 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Compound Multiplier:</span>
              <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">2.8× Capital</span>
            </div>
          </div>
        ),
        footerLeft: 'Geometric annual mean',
        cta: 'Check CAGR',
      },
      {
        id: 'ad-roi',
        toolId: 'roi-calculator',
        title: 'Return on Investment (ROI)',
        badge: 'Profitability',
        badgeTone: 'emerald',
        icon: Sparkles,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Capital ₹2.5L · Profit ₹85k' : `Cap ${sym}25k · Profit ${sym}8.5k`}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+34.0%</span>
            </div>
            <MiniSegmentedBar
              segments={[
                { width: '74%', color: 'bg-emerald-500', label: '74% Base Capital', dotColor: 'bg-emerald-500' },
                { width: '26%', color: 'bg-teal-400', label: '26% Net Gain', dotColor: 'bg-teal-400' },
              ]}
            />
            <div className="text-[10px] text-[color:var(--ink-muted)] flex justify-between">
              <span>Annualized yield: 15.7%</span>
              <span className="text-emerald-600 font-bold">Net Positive</span>
            </div>
          </div>
        ),
        footerLeft: 'Direct yield and payback time',
        cta: 'Evaluate ROI',
      },
      {
        id: 'ad-inflation',
        toolId: 'inflation-calculator',
        title: 'Inflation & Purchasing Power',
        badge: 'Erosion',
        badgeTone: 'amber',
        icon: Percent,
        accent: 'orange',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? '₹10 Lakh in 20 Years' : `${sym}100,000 in 20 Years`}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">@ 6.0% p.a.</span>
            </div>
            {/* Purchasing Power Erosion Curve (Downward) */}
            <MiniSparkline
              id="inflation"
              strokeColor="#f59e0b"
              gradientColor="#f59e0b"
              pathD="M0 5 Q 70 12, 130 22 T 200 28"
              areaD="M0 5 Q 70 12, 130 22 T 200 28 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Real Purchasing Power:</span>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                {isINR ? '₹3.11 Lakh (31%)' : `${sym}31,180 (31%)`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Real inflation-adjusted value',
        cta: 'Forecast Erosion',
      },
      {
        id: 'ad-net-worth',
        toolId: 'net-worth-calculator',
        title: 'Net Worth Balance Sheet',
        badge: 'Wealth Audit',
        badgeTone: 'purple',
        icon: Landmark,
        accent: 'purple',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">Assets vs Liabilities</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">+18% YoY</span>
            </div>
            {/* Net Worth Assets vs Debt Bar */}
            <MiniSegmentedBar
              segments={[
                { width: '75%', color: 'bg-purple-500', label: '75% Assets', dotColor: 'bg-purple-500' },
                { width: '25%', color: 'bg-rose-400', label: '25% Debt', dotColor: 'bg-rose-400' },
              ]}
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Current Net Worth:</span>
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                {isINR ? '₹32.30 Lakh' : `${sym}323,000`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Liquid & illiquid assets tally',
        cta: 'Track Net Worth',
      },
      {
        id: 'ad-mortgage',
        toolId: 'mortgage-affordability-calculator',
        title: 'Mortgage Affordability',
        badge: '28/36 Rule',
        badgeTone: 'blue',
        icon: Building,
        accent: 'blue',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={28}
                strokeColor="stroke-blue-500"
                label="28%"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">Income Ratio</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Approved</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[color:var(--ink-muted)]">Max Home Price:</span>
                  <span className="text-xs font-extrabold text-[color:var(--ink)]">
                    {isINR ? '₹84.5 Lakh' : `${sym}580,000`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Front-end and back-end ratios',
        cta: 'Test Affordability',
      },
      {
        id: 'ad-credit-card',
        toolId: 'credit-card-payoff-calculator',
        title: 'Credit Card Debt Payoff',
        badge: '36% APR',
        badgeTone: 'amber',
        icon: CreditCard,
        accent: 'orange',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Balance ₹1,20,000' : `Balance ${sym}8,000`}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">14m Payoff</span>
            </div>
            {/* Payoff Trajectory Curve (Falling to 0) */}
            <MiniSparkline
              id="cc-payoff"
              strokeColor="#f59e0b"
              gradientColor="#f59e0b"
              pathD="M0 4 Q 60 14, 130 23 T 200 29"
              areaD="M0 4 Q 60 14, 130 23 T 200 29 L 200 32 L 0 32 Z"
            />
            <div className="text-[10px] text-[color:var(--ink-muted)] flex justify-between">
              <span>Avalanche vs Snowball</span>
              <span className="text-emerald-600 font-semibold">Zero Interest Trap</span>
            </div>
          </div>
        ),
        footerLeft: 'Accelerated debt-free engine',
        cta: 'Eliminate Debt',
      },
      {
        id: 'ad-gratuity',
        toolId: 'gratuity-calculator',
        title: 'Gratuity Payout',
        badge: '1972 Act',
        badgeTone: 'emerald',
        icon: BriefcaseBusiness,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-3">
              <MiniProgressRing
                percent={100}
                strokeColor="stroke-emerald-500"
                label="Vested"
              />
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[color:var(--ink-muted)]">
                    {isINR ? 'Basic ₹50k · 8Y' : '8Y Service'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Tax-Free</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-[color:var(--ink-muted)]">Entitlement:</span>
                  <span className="text-xs font-extrabold text-[color:var(--ink)]">
                    {isINR ? '₹2,30,769' : `${sym}24,000`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
        footerLeft: '15/26 formula · Sec 10(10)',
        cta: 'Compute Gratuity',
      },
      {
        id: 'ad-salary-hike',
        toolId: 'salary-hike-calculator',
        title: 'Salary Appraisal Hike',
        badge: '+18% Hike',
        badgeTone: 'teal',
        icon: TrendingUp,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Base ₹12.0L' : `Base ${sym}80k`}
              </span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {isINR ? '+₹2.16L / yr' : `+${sym}14.4k / yr`}
              </span>
            </div>
            {/* Stepped Hike Curve */}
            <MiniSparkline
              id="hike"
              strokeColor="#14b8a6"
              gradientColor="#14b8a6"
              pathD="M0 24 L 90 24 L 90 8 L 200 8"
              areaD="M0 24 L 90 24 L 90 8 L 200 8 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Post-Appraisal CTC:</span>
              <span className="text-xs font-extrabold text-[color:var(--ink)]">
                {isINR ? '₹14.16 Lakh' : `${sym}94,400`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Monthly delta & in-hand tax impact',
        cta: 'Evaluate Hike',
      },
      {
        id: 'ad-future-value',
        toolId: 'future-value-calculator',
        title: 'Future Value of Annuity',
        badge: 'Compounded',
        badgeTone: 'blue',
        icon: LineChart,
        accent: 'blue',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? '₹8,000/mo @ 9.5%' : `${sym}400/mo @ 9.5%`}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">12 Years</span>
            </div>
            <MiniSparkline
              id="fv"
              strokeColor="#3b82f6"
              gradientColor="#3b82f6"
              pathD="M0 28 Q 70 25, 120 15 T 200 4"
              areaD="M0 28 Q 70 25, 120 15 T 200 4 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Future Value (FV):</span>
              <span className="text-xs font-extrabold text-[color:var(--ink)]">
                {isINR ? '₹20.52 Lakh' : `${sym}102,600`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Ordinary annuity & annuity due',
        cta: 'Calculate FV',
      },
      {
        id: 'ad-epf',
        toolId: 'epf-calculator',
        title: 'EPF Retirement Corpus',
        badge: '8.25% Interest',
        badgeTone: 'emerald',
        icon: PiggyBank,
        accent: 'emerald',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Basic ₹45k + 12%' : 'Provident Fund'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">EEE Tax Free</span>
            </div>
            <MiniSparkline
              id="epf"
              strokeColor="#10b981"
              gradientColor="#10b981"
              pathD="M0 28 Q 65 24, 115 14 T 200 3"
              areaD="M0 28 Q 65 24, 115 14 T 200 3 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Corpus at Age 58:</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {isINR ? '₹86.42 Lakh' : `${sym}420,000`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'EPFO statutory interest compounding',
        cta: 'Forecast EPF',
      },
      {
        id: 'ad-rule72',
        toolId: 'rule-of-72-calculator',
        title: 'Rule of 72 Doubling Time',
        badge: 'Mental Math',
        badgeTone: 'teal',
        icon: Calculator,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">Expected Return: 9.0% p.a.</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">72 / 9 = 8.0</span>
            </div>
            {/* Step Doubling Curve: 1x -> 2x -> 4x */}
            <MiniSparkline
              id="rule72"
              strokeColor="#0d9488"
              gradientColor="#0d9488"
              pathD="M0 28 L 60 28 L 60 16 L 130 16 L 130 4 L 200 4"
              areaD="M0 28 L 60 28 L 60 16 L 130 16 L 130 4 L 200 4 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>2× Doubling Cycle:</span>
              <span className="text-xs font-extrabold text-[color:var(--ink)]">Every 8.0 Years</span>
            </div>
          </div>
        ),
        footerLeft: 'Compound doubling rule comparison',
        cta: 'Test Returns',
      },
      {
        id: 'ad-dividend',
        toolId: 'dividend-yield-calculator',
        title: 'Dividend Yield Income',
        badge: 'Passive Cash',
        badgeTone: 'purple',
        icon: TrendingUp,
        accent: 'purple',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Portfolio ₹8.0L · 4.2%' : `Portfolio ${sym}50k · 4.2%`}
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">Quarterly</span>
            </div>
            {/* Steady Recurring Cash Flow Curve */}
            <MiniSparkline
              id="dividend"
              strokeColor="#a855f7"
              gradientColor="#a855f7"
              pathD="M0 16 Q 50 12, 100 16 T 200 14"
              areaD="M0 16 Q 50 12, 100 16 T 200 14 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Annual Passive Income:</span>
              <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                {isINR ? '₹33,600 / yr' : `${sym}2,100 / yr`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Dividend payout & yield on cost',
        cta: 'Model Dividends',
      },
      {
        id: 'ad-break-even',
        toolId: 'break-even-calculator',
        title: 'Break-Even Business Audit',
        badge: 'Margin',
        badgeTone: 'blue',
        icon: BriefcaseBusiness,
        accent: 'blue',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">Fixed Costs vs 40% Margin</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Break-Even</span>
            </div>
            <MiniSegmentedBar
              segments={[
                { width: '60%', color: 'bg-slate-400', label: '60% Cost', dotColor: 'bg-slate-400' },
                { width: '40%', color: 'bg-blue-500', label: '40% Margin', dotColor: 'bg-blue-500' },
              ]}
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Required Sales Revenue:</span>
              <span className="text-xs font-extrabold text-[color:var(--ink)]">
                {isINR ? '₹4,50,000' : `${sym}45,000`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Safety margin & unit economics',
        cta: 'Run Break-Even',
      },
      {
        id: 'ad-rent-vs-buy',
        toolId: 'rent-vs-buy-calculator',
        title: 'Rent vs Buy Modeling',
        badge: '30y Horizon',
        badgeTone: 'emerald',
        icon: Building,
        accent: 'emerald',
        body: (
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">
                {isINR ? 'Buy ₹75L vs Rent ₹25k' : `Buy ${sym}500k vs Rent`}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Opportunity Cost</span>
            </div>
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-12 text-[color:var(--ink-muted)]">Buy:</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[72%]" />
                </div>
                <span className="font-bold text-emerald-600 text-[10px]">Equity</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-12 text-[color:var(--ink-muted)]">Rent:</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 w-[64%]" />
                </div>
                <span className="text-[color:var(--ink-muted)] text-[10px]">Invested</span>
              </div>
            </div>
          </div>
        ),
        footerLeft: 'Maintenance & property tax factors',
        cta: 'Compare Decisions',
      },
      {
        id: 'ad-npv-irr',
        toolId: 'npv-calculator',
        title: 'Net Present Value (NPV)',
        badge: 'Capital Budget',
        badgeTone: 'teal',
        icon: LineChart,
        accent: 'teal',
        body: (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-[color:var(--ink-muted)]">10% Discount Rate · 5Y</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">Positive NPV</span>
            </div>
            <MiniSparkline
              id="npv"
              strokeColor="#0d9488"
              gradientColor="#0d9488"
              pathD="M0 25 Q 50 20, 100 14 T 200 5"
              areaD="M0 25 Q 50 20, 100 14 T 200 5 L 200 32 L 0 32 Z"
            />
            <div className="flex items-baseline justify-between text-[10px] text-[color:var(--ink-muted)]">
              <span>Net Present Value:</span>
              <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                {isINR ? '+₹2,45,200' : `+${sym}24,520`}
              </span>
            </div>
          </div>
        ),
        footerLeft: 'Discounted cash flow NPV engine',
        cta: 'Analyze Investment',
      },
    ];
  }, [currency.code, currency.symbol]);

  const numSlots = visibleSlots === 2 ? 2 : 3;

  // Active indices for each visible slot
  const [slotIndices, setSlotIndices] = useState<number[]>(() => {
    return Array.from({ length: numSlots }, (_, i) => i % 25);
  });

  // Track fade state per slot
  const [fadingSlots, setFadingSlots] = useState<boolean[]>(() => {
    return Array.from({ length: numSlots }, () => false);
  });

  // Check reduced motion preference
  const isReducedMotion = useRef<boolean>(false);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch {}
  }, []);

  // Set up staggered rotation intervals for each slot
  useEffect(() => {
    if (isReducedMotion.current) return;

    const baseInterval = 6500;
    const staggerOffset = 2200;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    // Helper to rotate a single slot
    const rotateSlot = (slotIdx: number) => {
      // Pause if hovered or document not visible
      if (hoveredSlot === slotIdx) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      // Trigger fade out
      setFadingSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = true;
        return next;
      });

      // Change card after 180ms fade
      setTimeout(() => {
        setSlotIndices((prevIndices) => {
          const currentOccupied = new Set(prevIndices);
          let candidate = (prevIndices[slotIdx] + 1) % adPool.length;
          // Find next index not currently displayed in any visible slot
          let attempts = 0;
          while (currentOccupied.has(candidate) && attempts < adPool.length) {
            candidate = (candidate + 1) % adPool.length;
            attempts++;
          }

          const nextIndices = [...prevIndices];
          nextIndices[slotIdx] = candidate;
          return nextIndices;
        });

        // Fade back in
        setTimeout(() => {
          setFadingSlots((prev) => {
            const next = [...prev];
            next[slotIdx] = false;
            return next;
          });
        }, 40);
      }, 180);
    };

    // Stagger initial starts
    for (let slot = 0; slot < numSlots; slot++) {
      const initialDelay = slot * staggerOffset;
      const t = setTimeout(() => {
        rotateSlot(slot);
        const inv = setInterval(() => rotateSlot(slot), baseInterval);
        intervals.push(inv);
      }, initialDelay + baseInterval);
      timeouts.push(t);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [adPool.length, hoveredSlot, numSlots]);

  const handleCardClick = (ad: HeroToolAd) => {
    const foundTool = TOOLS.find((t) => t.id === ad.toolId);
    if (foundTool) {
      onSelectTool(foundTool);
    }
  };

  const getBadgeClass = (tone: HeroToolAd['badgeTone']) => {
    switch (tone) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'teal':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
    }
  };

  // Staggered margin shifts matching classic Codepackr layout
  const getSlotMargin = (index: number) => {
    if (numSlots === 2) {
      return index === 0 ? 'ml-3' : 'mr-3';
    }
    // 3 slots
    if (index === 0) return 'ml-4';
    if (index === 1) return 'mr-2';
    return 'ml-6';
  };

  // Floating animations per slot matching previous organic movement
  const getFloatingClass = (slotIdx: number) => {
    if (slotIdx === 0) return 'animate-float-card-1';
    if (slotIdx === 1) return 'animate-float-card-2';
    return 'animate-float-card-3';
  };

  return (
    <div
      id="hero-preview-cards-stack"
      className="hero-floating-cards hidden lg:flex lg:col-span-5 flex-col gap-4 relative"
    >
      {/* Ambient gradient glow behind stack */}
      <div
        className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-blue-500/15 rounded-3xl blur-2xl pointer-events-none opacity-80"
        aria-hidden="true"
      />

      {slotIndices.map((adIndex, slotIdx) => {
        const ad = adPool[adIndex] || adPool[0];
        const isFading = fadingSlots[slotIdx];
        const IconComponent = ad.icon;

        return (
          <article
            key={`slot-${slotIdx}`}
            id={`hero-ad-slot-${slotIdx}`}
            onMouseEnter={() => setHoveredSlot(slotIdx)}
            onMouseLeave={() => setHoveredSlot(null)}
            onClick={() => handleCardClick(ad)}
            className={`group cursor-pointer p-4 rounded-2xl bg-[color:var(--surface)]/90 dark:bg-[color:var(--surface)]/85 backdrop-blur-md border border-emerald-500/25 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.035] hover:border-emerald-500 transition-all duration-200 ease-out relative overflow-hidden min-h-[148px] flex flex-col justify-between ${getFloatingClass(
              slotIdx
            )} ${getSlotMargin(slotIdx)}`}
          >
            {/* Inner Content with smooth cross-fade */}
            <div
              className={`transition-opacity duration-200 flex flex-col justify-between h-full ${
                isFading ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'
              }`}
            >
              <div>
                {/* Header: Icon chip + Title + Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[color:var(--ink)] tracking-tight">
                        {ad.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getBadgeClass(
                      ad.badgeTone
                    )}`}
                  >
                    {ad.badge}
                  </span>
                </div>

                {/* Body: Elevated mono/numeric block with rich visual chart */}
                <div
                  className="p-2.5 rounded-xl border mb-2"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--line)',
                  }}
                >
                  {ad.body}
                </div>
              </div>

              {/* Footer: Muted left text + Brand CTA with ArrowRight */}
              <div className="flex items-center justify-between text-[10px] text-[color:var(--ink-muted)] pt-0.5">
                <span className="truncate max-w-[170px]">{ad.footerLeft}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-0.5 shrink-0">
                  {ad.cta}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

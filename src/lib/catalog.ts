import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  DollarSign,
  Percent,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
} from "lucide-react";

export type CalcGroup = "retirement" | "loans" | "investing" | "everyday";

export type CalculatorTool = {
  id: string;
  path: string;
  name: string;
  description: string;
  group: CalcGroup;
  icon: LucideIcon;
  popular?: boolean;
  isNew?: boolean;
};

export const GROUPS: { id: CalcGroup | "all"; label: string }[] = [
  { id: "all", label: "All calculators" },
  { id: "retirement", label: "Retirement" },
  { id: "loans", label: "Loans" },
  { id: "investing", label: "Investing" },
  { id: "everyday", label: "Everyday" },
];

export const CALCULATORS: CalculatorTool[] = [
  {
    id: "financial-planner",
    path: "/financial-planner",
    name: "Financial Planning & Retirement",
    description:
      "Analyze retirement readiness, projected vs required corpus, savings gap, scenarios, and recommendations.",
    group: "retirement",
    icon: Target,
    popular: true,
    isNew: true,
  },
  {
    id: "loan-calculator",
    path: "/loan-calculator",
    name: "Loan & EMI Calculator",
    description: "Calculate monthly loan EMI, total interest, and a comprehensive repayment timeline.",
    group: "loans",
    icon: DollarSign,
  },
  {
    id: "sip-calculator",
    path: "/sip-calculator",
    name: "SIP Calculator",
    description:
      "Calculate Systematic Investment Plan returns, wealth gain, step-up SIPs, and growth charts.",
    group: "investing",
    icon: TrendingUp,
    popular: true,
  },
  {
    id: "investment-calculator",
    path: "/investment-calculator",
    name: "Investment Calculator",
    description:
      "Project investment growth with periodic deposits, compounding choices, and a tenure switcher.",
    group: "investing",
    icon: PiggyBank,
    popular: true,
  },
  {
    id: "calculator",
    path: "/calculator",
    name: "Scientific Calculator",
    description: "Fast arithmetic, trigonometric, exponential, and algebraic calculations.",
    group: "everyday",
    icon: Calculator,
  },
  {
    id: "percentage-calculator",
    path: "/percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages, percent increases and decreases, and fractional ratios.",
    group: "everyday",
    icon: Percent,
  },
  {
    id: "tip-calculator",
    path: "/tip-calculator",
    name: "Tip Calculator",
    description: "Quickly calculate bill tips, total payable, and split by person count.",
    group: "everyday",
    icon: Receipt,
  },
];

export function findCalculator(id: string) {
  return CALCULATORS.find((c) => c.id === id);
}

export function relatedCalculators(id: string, limit = 3) {
  const current = findCalculator(id);
  if (!current) return CALCULATORS.slice(0, limit);
  const same = CALCULATORS.filter((c) => c.id !== id && c.group === current.group);
  const rest = CALCULATORS.filter((c) => c.id !== id && c.group !== current.group);
  return [...same, ...rest].slice(0, limit);
}

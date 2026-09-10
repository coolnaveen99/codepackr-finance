import { ToolDef, ToolCategory } from '../types';

export const CATEGORIES: { id: ToolCategory | 'all'; label: string; count?: number }[] = [
  { id: 'all', label: 'All Calculators' },
  { id: 'calculators', label: 'Financial Calculators' },
];

export const TOOLS: ToolDef[] = [
  // Financial Calculators
  {
    id: 'financial-planner',
    name: 'Financial Planning & Retirement Calculator',
    category: 'calculators',
    description: 'Analyze retirement readiness, projected vs required corpus, corpus sustainability, savings gap, scenarios, and get actionable recommendations.',
    keywords: ['retirement', 'financial planning', 'corpus', 'fire', 'financial independence', 'sip', 'inflation', 'readiness', 'sustainability', 'calculator'],
    icon: 'Target',
    popular: true,
    isNew: true,
  },
  {
    id: 'loan-calculator',
    name: 'Loan & EMI Calculator',
    category: 'calculators',
    description: 'Calculate monthly loan EMI, total interest, and comprehensive repayment timeline.',
    keywords: ['loan', 'emi', 'mortgage', 'interest', 'finance'],
    icon: 'DollarSign',
    popular: true,
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    category: 'calculators',
    description: 'Calculate Systematic Investment Plan (SIP) returns, wealth gain, and interactive growth charts.',
    keywords: ['sip', 'mutual-funds', 'investment', 'wealth', 'finance', 'returns', 'calculator', 'graph'],
    icon: 'TrendingUp',
    popular: true,
  },
  {
    id: 'investment-calculator',
    name: 'Investment Calculator',
    category: 'calculators',
    description: 'Calculate investment growth with periodic deposits, tenure switcher, and interactive circular graphs.',
    keywords: ['investment', 'compound-interest', 'savings', 'growth', 'apy', 'finance', 'calculator', 'graph'],
    icon: 'PiggyBank',
    popular: true,
  },
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    category: 'calculators',
    description: 'Calculate simple (non-compounding) interest and maturity amount on a fixed principal, with a yearly breakdown.',
    keywords: ['simple interest', 'interest calculator', 'principal', 'maturity amount', 'loan', 'deposit', 'finance', 'calculator'],
    icon: 'Percent',
    isNew: true,
  },
];

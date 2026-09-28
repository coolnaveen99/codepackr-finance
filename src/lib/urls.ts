import { ToolDef } from '../types';
import { TOOLS } from '../data/tools';

export type SpecialPage = 'home' | 'contact' | 'privacy' | 'admin' | 'about' | 'financial-disclaimer' | 'cookie-policy' | 'calculation-methodology' | 'editorial-policy' | 'notFound';

export const SLUG_TO_TOOL_ID: Record<string, string> = {
  'financial-planner': 'financial-planner',
  'retirement-calculator': 'financial-planner',
  'sip-calculator': 'sip-calculator',
  'investment-calculator': 'investment-calculator',
  'compound-interest-calculator': 'investment-calculator',
  'loan-calculator': 'loan-calculator',
  'emi-calculator': 'loan-calculator',
  'simple-interest-calculator': 'simple-interest-calculator',
  'cagr-calculator': 'cagr-calculator',
  'inflation-calculator': 'inflation-calculator',
  'emergency-fund-calculator': 'emergency-fund-calculator',
  'net-worth-calculator': 'net-worth-calculator',
  'roi-calculator': 'roi-calculator',
  'fire-calculator': 'fire-calculator',
  'income-tax-calculator': 'income-tax-calculator',
  'ctc-to-in-hand-calculator': 'ctc-to-in-hand-calculator',
  'loan-amortization-calculator': 'loan-amortization-calculator',
  'loan-prepayment-calculator': 'loan-prepayment-calculator',
  'debt-to-income-calculator': 'debt-to-income-calculator',
  'lumpsum-calculator': 'lumpsum-calculator',
  'future-value-calculator': 'future-value-calculator',
  'savings-goal-calculator': 'savings-goal-calculator',
  'salary-hike-calculator': 'salary-hike-calculator',
  'gratuity-calculator': 'gratuity-calculator',
  'npv-calculator': 'npv-calculator',
  'irr-calculator': 'irr-calculator',
  'break-even-calculator': 'break-even-calculator',
  'business-valuation-calculator': 'business-valuation-calculator',
  'dcf-calculator': 'dcf-calculator',
  'wacc-calculator': 'wacc-calculator',
  'mortgage-affordability-calculator': 'mortgage-affordability-calculator',
  'credit-card-payoff-calculator': 'credit-card-payoff-calculator',
  'gst-calculator': 'gst-calculator',
  'capital-gains-tax-calculator': 'capital-gains-tax-calculator',
  'hra-calculator': 'hra-calculator',
  'startup-valuation-calculator': 'startup-valuation-calculator',
  'burn-rate-calculator': 'burn-rate-calculator',
  'epf-calculator': 'epf-calculator',
  'rent-vs-buy-calculator': 'rent-vs-buy-calculator',
  'rule-of-72-calculator': 'rule-of-72-calculator',
  'annuity-calculator': 'annuity-calculator',
  'dividend-yield-calculator': 'dividend-yield-calculator',
  'term-insurance-calculator': 'term-insurance-calculator',
  'term-insurance': 'term-insurance-calculator',
  'fd-calculator': 'fd-calculator',
  'fd': 'fd-calculator',
  'fixed-deposit-calculator': 'fd-calculator',
  'rd-calculator': 'rd-calculator',
  'rd': 'rd-calculator',
  'recurring-deposit-calculator': 'rd-calculator',
  'ppf-calculator': 'ppf-calculator',
  'ppf': 'ppf-calculator',
  'public-provident-fund-calculator': 'ppf-calculator',
  'swp-calculator': 'swp-calculator',
  'swp': 'swp-calculator',
  'systematic-withdrawal-calculator': 'swp-calculator',
  'ssy-calculator': 'ssy-calculator',
  'ssy': 'ssy-calculator',
  'sukanya-samriddhi-calculator': 'ssy-calculator',
  'nps-calculator': 'nps-calculator',
  'nps': 'nps-calculator',
  'national-pension-system-calculator': 'nps-calculator',
  'nsc-calculator': 'nsc-calculator',
  'nsc': 'nsc-calculator',
  'scss-calculator': 'scss-calculator',
  'scss': 'scss-calculator',
  'senior-citizen-savings-calculator': 'scss-calculator',
  'apy-calculator': 'apy-calculator',
  'apy': 'apy-calculator',
  'atal-pension-yojana-calculator': 'apy-calculator',
};

export const TOOL_ID_TO_CANONICAL_SLUG: Record<string, string> = {
  'financial-planner': 'financial-planner',
  'loan-calculator': 'loan-calculator',
  'sip-calculator': 'sip-calculator',
  'investment-calculator': 'investment-calculator',
  'simple-interest-calculator': 'simple-interest-calculator',
  'cagr-calculator': 'cagr-calculator',
  'inflation-calculator': 'inflation-calculator',
  'emergency-fund-calculator': 'emergency-fund-calculator',
  'net-worth-calculator': 'net-worth-calculator',
  'roi-calculator': 'roi-calculator',
  'fire-calculator': 'fire-calculator',
  'income-tax-calculator': 'income-tax-calculator',
  'ctc-to-in-hand-calculator': 'ctc-to-in-hand-calculator',
  'loan-amortization-calculator': 'loan-amortization-calculator',
  'loan-prepayment-calculator': 'loan-prepayment-calculator',
  'debt-to-income-calculator': 'debt-to-income-calculator',
  'lumpsum-calculator': 'lumpsum-calculator',
  'future-value-calculator': 'future-value-calculator',
  'savings-goal-calculator': 'savings-goal-calculator',
  'salary-hike-calculator': 'salary-hike-calculator',
  'gratuity-calculator': 'gratuity-calculator',
  'npv-calculator': 'npv-calculator',
  'irr-calculator': 'irr-calculator',
  'break-even-calculator': 'break-even-calculator',
  'business-valuation-calculator': 'business-valuation-calculator',
  'dcf-calculator': 'dcf-calculator',
  'wacc-calculator': 'wacc-calculator',
  'mortgage-affordability-calculator': 'mortgage-affordability-calculator',
  'credit-card-payoff-calculator': 'credit-card-payoff-calculator',
  'gst-calculator': 'gst-calculator',
  'capital-gains-tax-calculator': 'capital-gains-tax-calculator',
  'hra-calculator': 'hra-calculator',
  'startup-valuation-calculator': 'startup-valuation-calculator',
  'burn-rate-calculator': 'burn-rate-calculator',
  'epf-calculator': 'epf-calculator',
  'rent-vs-buy-calculator': 'rent-vs-buy-calculator',
  'rule-of-72-calculator': 'rule-of-72-calculator',
  'annuity-calculator': 'annuity-calculator',
  'dividend-yield-calculator': 'dividend-yield-calculator',
  'term-insurance-calculator': 'term-insurance-calculator',
  'fd-calculator': 'fd-calculator',
  'rd-calculator': 'rd-calculator',
  'ppf-calculator': 'ppf-calculator',
  'swp-calculator': 'swp-calculator',
  'ssy-calculator': 'ssy-calculator',
  'nps-calculator': 'nps-calculator',
  'nsc-calculator': 'nsc-calculator',
  'scss-calculator': 'scss-calculator',
  'apy-calculator': 'apy-calculator',
};

export function getToolPath(tool: ToolDef | string): string {
  const toolId = typeof tool === 'string' ? tool : tool.id;
  const slug = TOOL_ID_TO_CANONICAL_SLUG[toolId] || toolId;
  return `/${slug}`;
}

export function getToolDirectUrl(tool: ToolDef | string): string {
  return `https://finance.codepackr.com${getToolPath(tool)}`;
}

export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'calculators': 'all',
  'loans': 'loans',
  'investments': 'investments',
  'tax': 'tax',
  'salary': 'salary',
  'retirement': 'retirement',
  'personal-finance': 'personal-finance',
  'business-finance': 'business-finance',
};

export function resolveCurrentRoute(): {
  page: SpecialPage;
  tool: ToolDef | null;
  category?: string;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', tool: null };
  }

  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const searchParams = new URLSearchParams(window.location.search);

  if (pathname === 'admin.html' || pathname === 'admin' || searchParams.get('page') === 'admin') {
    return { page: 'admin', tool: null };
  }
  if (pathname === 'contact.html' || pathname === 'contact' || searchParams.get('page') === 'contact') {
    return { page: 'contact', tool: null };
  }
  if (pathname === 'privacy.html' || pathname === 'privacy' || searchParams.get('page') === 'privacy') {
    return { page: 'privacy', tool: null };
  }
  if (pathname === 'terms.html' || pathname === 'terms' || searchParams.get('page') === 'terms') {
    return { page: 'privacy', tool: null, category: 'terms' };
  }

  const trustPages = ['about', 'financial-disclaimer', 'cookie-policy', 'calculation-methodology', 'editorial-policy'] as const;
  if (trustPages.includes(pathname as typeof trustPages[number])) {
    return { page: pathname as typeof trustPages[number], tool: null };
  }

  if (pathname && pathname !== 'index.html') {
    const rawPath = pathname.replace(/\.html$/, '');
    const pathSegments = rawPath.split('/').filter(Boolean);
    const rawSlug = pathSegments.length === 2 && CATEGORY_SLUG_MAP[pathSegments[0]]
      ? pathSegments[1]
      : rawPath;

    if (pathSegments.length === 1 && CATEGORY_SLUG_MAP[rawSlug]) {
      return { page: 'home', tool: null, category: CATEGORY_SLUG_MAP[rawSlug] };
    }

    const mappedToolId = SLUG_TO_TOOL_ID[rawSlug] || rawSlug;
    const foundTool = TOOLS.find((t) => t.id === mappedToolId || t.id === rawSlug);
    if (foundTool) {
      return { page: 'home', tool: foundTool };
    }
  }

  const toolParam = searchParams.get('tool');
  if (toolParam) {
    const mappedToolId = SLUG_TO_TOOL_ID[toolParam] || toolParam;
    const foundTool = TOOLS.find((t) => t.id === mappedToolId);
    if (foundTool) {
      return { page: 'home', tool: foundTool };
    }
  }

  const catParam = searchParams.get('cat') || searchParams.get('category');

  if (!pathname || pathname === 'index.html' || pathname === 'index') {
    return { page: 'home', tool: null, category: catParam || undefined };
  }

  return { page: 'notFound', tool: null };
}

import { ToolDef } from '../types';
import { TOOLS } from '../data/tools';

/**
 * Mapping of legacy or direct HTML slugs to Tool IDs or special pages
 */
export const SLUG_TO_TOOL_ID: Record<string, string> = {
  // Financial Calculators
  'financial-planner': 'financial-planner',
  'retirement-calculator': 'financial-planner',
  'financial-planning-calculator': 'financial-planner',
  'financial-independence-calculator': 'financial-planner',
  'sip-calculator': 'sip-calculator',
  'investment-calculator': 'investment-calculator',
  'compound-investment-calculator': 'investment-calculator',
  'compound-interest-calculator': 'investment-calculator',
  'loan-calculator': 'loan-calculator',
  'emi-calculator': 'loan-calculator',
  'mortgage-calculator': 'loan-calculator',
  'simple-interest-calculator': 'simple-interest-calculator',
  'simple-interest': 'simple-interest-calculator',
};

/**
 * Preferred direct canonical URL slug for each tool ID
 */
export const TOOL_ID_TO_CANONICAL_SLUG: Record<string, string> = {
  'financial-planner': 'financial-planner',
  'loan-calculator': 'loan-calculator',
  'sip-calculator': 'sip-calculator',
  'investment-calculator': 'investment-calculator',
  'simple-interest-calculator': 'simple-interest-calculator',
};

/**
 * Returns the clean direct path for a tool: e.g. "/json-formatter"
 */
export function getToolPath(tool: ToolDef | string): string {
  const toolId = typeof tool === 'string' ? tool : tool.id;
  const slug = TOOL_ID_TO_CANONICAL_SLUG[toolId] || toolId;
  return `/${slug}`;
}

/**
 * Returns the full direct canonical URL: e.g. "https://finance.codepackr.com/json-formatter"
 */
export function getToolDirectUrl(tool: ToolDef | string): string {
  return `https://finance.codepackr.com${getToolPath(tool)}`;
}

/**
 * Mapping of direct category URL slugs to category filter keys
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'calculators': 'calculators',
};

/**
 * Resolves the active route based on the current window location (pathname + search)
 */
export function resolveCurrentRoute(): {
  page: 'home' | 'contact' | 'privacy' | 'admin';
  tool: ToolDef | null;
  category?: string;
} {
  if (typeof window === 'undefined') {
    return { page: 'home', tool: null };
  }

  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const searchParams = new URLSearchParams(window.location.search);

  // 0. Check admin console page
  if (pathname === 'admin.html' || pathname === 'admin' || searchParams.get('page') === 'admin') {
    return { page: 'admin', tool: null };
  }

  // 1. Check contact page
  if (pathname === 'contact.html' || pathname === 'contact' || searchParams.get('page') === 'contact') {
    return { page: 'contact', tool: null };
  }

  // 2. Check privacy and terms pages
  if (pathname === 'privacy.html' || pathname === 'privacy' || searchParams.get('page') === 'privacy') {
    return { page: 'privacy', tool: null };
  }

  if (pathname === 'terms.html' || pathname === 'terms' || searchParams.get('page') === 'terms') {
    return { page: 'privacy', tool: null, category: 'terms' };
  }

  // 3. Check direct path slug (e.g. "json-formatter.html", "json-formatter", or "formatters")
  if (pathname && pathname !== 'index.html') {
    const rawSlug = pathname.replace(/\.html$/, '');

    // Check category hubs first
    if (CATEGORY_SLUG_MAP[rawSlug]) {
      return { page: 'home', tool: null, category: CATEGORY_SLUG_MAP[rawSlug] };
    }

    const mappedToolId = SLUG_TO_TOOL_ID[rawSlug] || rawSlug;
    const foundTool = TOOLS.find((t) => t.id === mappedToolId || t.id === rawSlug);
    if (foundTool) {
      return { page: 'home', tool: foundTool };
    }
  }

  // 4. Check query param: ?tool=...
  const toolParam = searchParams.get('tool');
  if (toolParam) {
    const mappedToolId = SLUG_TO_TOOL_ID[toolParam] || toolParam;
    const foundTool = TOOLS.find((t) => t.id === mappedToolId);
    if (foundTool) {
      return { page: 'home', tool: foundTool };
    }
  }

  // 5. Category filter param: ?cat=... or ?category=...
  const catParam = searchParams.get('cat') || searchParams.get('category');

  return { page: 'home', tool: null, category: catParam || undefined };
}

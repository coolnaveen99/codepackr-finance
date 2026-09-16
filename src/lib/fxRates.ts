/**
 * Live FX rates for Codepackr Finance via Frankfurter (ECB reference rates).
 * No API key. Browser-safe CORS. Falls back to static rates on failure.
 *
 * Docs: https://www.frankfurter.app/docs
 * Endpoint: https://api.frankfurter.app/latest?from=USD
 */

import { CURRENCIES, type CurrencyDefinition } from './currency';
import { safeLocalStorage } from './storage';

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD';
const CACHE_KEY = 'codepackr_fx_rates_v1';
const TOGGLE_KEY = 'codepackr_fx_live_enabled';
/** Cache live rates for 12 hours (ECB publishes ~once per business day). */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export type FxStatus = 'idle' | 'loading' | 'live' | 'cached' | 'static' | 'error';

export interface FxSnapshot {
  base: 'USD';
  date: string; // YYYY-MM-DD from API
  rates: Record<string, number>; // code -> units per 1 USD
  fetchedAt: number; // epoch ms
}

function staticRatesFromCurrencies(): Record<string, number> {
  const rates: Record<string, number> = { USD: 1 };
  for (const c of CURRENCIES) {
    rates[c.code] = c.rateVsUsd;
  }
  return rates;
}

export function getStaticFxSnapshot(): FxSnapshot {
  return {
    base: 'USD',
    date: 'static',
    rates: staticRatesFromCurrencies(),
    fetchedAt: 0,
  };
}

export function readCachedFx(): FxSnapshot | null {
  try {
    const raw = safeLocalStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxSnapshot;
    if (!parsed?.rates || typeof parsed.fetchedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isCacheFresh(snapshot: FxSnapshot | null): boolean {
  if (!snapshot || !snapshot.fetchedAt) return false;
  return Date.now() - snapshot.fetchedAt < CACHE_TTL_MS;
}

export function isLiveFxEnabledDefault(): boolean {
  const saved = safeLocalStorage.getItem(TOGGLE_KEY);
  if (saved === null) return true; // approved UX: toggle on by default
  return saved === '1' || saved === 'true';
}

export function setLiveFxEnabled(enabled: boolean): void {
  safeLocalStorage.setItem(TOGGLE_KEY, enabled ? '1' : '0');
}

export async function fetchFrankfurterRates(): Promise<FxSnapshot> {
  const res = await fetch(FRANKFURTER_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    // Avoid long hangs offline
    signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? (AbortSignal as any).timeout(8000)
      : undefined,
  });
  if (!res.ok) {
    throw new Error(`Frankfurter HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    base?: string;
    date?: string;
    rates?: Record<string, number>;
  };
  if (!data.rates || typeof data.rates !== 'object') {
    throw new Error('Invalid Frankfurter payload');
  }

  const rates: Record<string, number> = { USD: 1 };
  for (const [code, value] of Object.entries(data.rates)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      rates[code.toUpperCase()] = value;
    }
  }

  const snapshot: FxSnapshot = {
    base: 'USD',
    date: data.date || new Date().toISOString().slice(0, 10),
    rates,
    fetchedAt: Date.now(),
  };

  try {
    safeLocalStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage failures
  }

  return snapshot;
}

/** Merge live rates onto currency definitions; keep static for unsupported codes. */
export function applyRatesToCurrencies(
  snapshot: FxSnapshot,
  catalog: CurrencyDefinition[] = CURRENCIES
): CurrencyDefinition[] {
  return catalog.map((c) => {
    if (c.code === 'USD') return { ...c, rateVsUsd: 1 };
    const live = snapshot.rates[c.code];
    if (typeof live === 'number' && live > 0) {
      return { ...c, rateVsUsd: live };
    }
    return c;
  });
}

export function formatFxDate(date: string): string {
  if (!date || date === 'static') return 'static table';
  try {
    const d = new Date(date + 'T12:00:00Z');
    return d.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

/** Popular codes for the rate strip in the currency dropdown. */
export const FX_STRIP_CODES = ['EUR', 'GBP', 'INR', 'JPY', 'CAD'] as const;

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CurrencyDefinition,
  CURRENCIES,
  POPULAR_CURRENCIES,
  DEFAULT_CURRENCY_CODE,
  getCurrency,
  formatCurrencyAmount,
} from './currency';
import { safeLocalStorage } from './storage';
import {
  type FxStatus,
  type FxSnapshot,
  applyRatesToCurrencies,
  fetchFrankfurterRates,
  getStaticFxSnapshot,
  isCacheFresh,
  isLiveFxEnabledDefault,
  readCachedFx,
  setLiveFxEnabled as persistLiveFxEnabled,
  formatFxDate,
} from './fxRates';

export type ConversionMode = 'face-value' | 'fx-convert';

interface CurrencyContextType {
  currency: CurrencyDefinition;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  conversionMode: ConversionMode;
  setConversionMode: (mode: ConversionMode) => void;
  formatAmount: (amount: number, customDecimals?: number, includeCode?: boolean) => string;
  symbol: string;
  popularCurrencies: CurrencyDefinition[];
  allCurrencies: CurrencyDefinition[];
  /** Live FX */
  liveFxEnabled: boolean;
  setLiveFxEnabled: (enabled: boolean) => void;
  fxStatus: FxStatus;
  fxDateLabel: string;
  fxSnapshot: FxSnapshot;
  refreshFxRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEY_CODE = 'codepackr_currency_code_v2';
const STORAGE_KEY_MODE = 'codepackr_currency_mode';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyCode, setCurrencyCodeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlCurrency = params.get('currency');
        if (urlCurrency) {
          const valid = getCurrency(urlCurrency.toUpperCase());
          return valid.code;
        }
      } catch {
        // Fallback
      }
    }
    const saved = safeLocalStorage.getItem(STORAGE_KEY_CODE);
    if (saved) return saved.toUpperCase();
    return DEFAULT_CURRENCY_CODE;
  });

  const [conversionMode, setConversionModeState] = useState<ConversionMode>(() => {
    const saved = safeLocalStorage.getItem(STORAGE_KEY_MODE);
    if (saved === 'fx-convert') {
      safeLocalStorage.removeItem(STORAGE_KEY_MODE);
    }
    return 'face-value';
  });

  const [liveFxEnabled, setLiveFxEnabledState] = useState<boolean>(() => isLiveFxEnabledDefault());
  const [fxStatus, setFxStatus] = useState<FxStatus>('idle');
  const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot>(() => {
    const cached = readCachedFx();
    if (cached && isCacheFresh(cached)) return cached;
    if (cached) return cached;
    return getStaticFxSnapshot();
  });

  const catalog = useMemo(() => applyRatesToCurrencies(fxSnapshot, CURRENCIES), [fxSnapshot]);

  const resolveCurrency = useCallback(
    (code: string): CurrencyDefinition => {
      const found = catalog.find((c) => c.code.toUpperCase() === code.toUpperCase());
      return found || catalog[0] || getCurrency(DEFAULT_CURRENCY_CODE);
    },
    [catalog]
  );

  const currency = resolveCurrency(currencyCode);

  const setCurrencyCode = (code: string) => {
    const valid = resolveCurrency(code);
    setCurrencyCodeState(valid.code);
    safeLocalStorage.setItem(STORAGE_KEY_CODE, valid.code);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('codepackr-currency-change', { detail: valid.code }));
    }
  };

  const setConversionMode = (mode: ConversionMode) => {
    setConversionModeState(mode);
    safeLocalStorage.setItem(STORAGE_KEY_MODE, mode);
  };

  const refreshFxRates = useCallback(async () => {
    if (!liveFxEnabled) {
      setFxSnapshot(getStaticFxSnapshot());
      setFxStatus('static');
      return;
    }

    const cached = readCachedFx();
    if (cached && isCacheFresh(cached)) {
      setFxSnapshot(cached);
      setFxStatus('cached');
      return;
    }

    setFxStatus('loading');
    try {
      const snap = await fetchFrankfurterRates();
      setFxSnapshot(snap);
      setFxStatus('live');
    } catch {
      if (cached) {
        setFxSnapshot(cached);
        setFxStatus('cached');
      } else {
        setFxSnapshot(getStaticFxSnapshot());
        setFxStatus('static');
      }
    }
  }, [liveFxEnabled]);

  const setLiveFxEnabled = (enabled: boolean) => {
    setLiveFxEnabledState(enabled);
    persistLiveFxEnabled(enabled);
    if (!enabled) {
      setFxSnapshot(getStaticFxSnapshot());
      setFxStatus('static');
    }
  };

  useEffect(() => {
    void refreshFxRates();
  }, [refreshFxRates]);

  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail !== currencyCode) {
        setCurrencyCodeState(detail);
      }
    };
    window.addEventListener('codepackr-currency-change', handleCustomChange);
    return () => window.removeEventListener('codepackr-currency-change', handleCustomChange);
  }, [currencyCode]);

  const formatAmount = (amount: number, customDecimals?: number, includeCode?: boolean): string => {
    return formatCurrencyAmount(amount, currency, {
      decimals: customDecimals,
      convertFromUsd: false,
      includeCode,
    });
  };

  const popularList = POPULAR_CURRENCIES.map((code) => resolveCurrency(code));

  const fxDateLabel =
    fxStatus === 'static' || fxSnapshot.date === 'static'
      ? 'static table'
      : formatFxDate(fxSnapshot.date);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode: currency.code,
        setCurrencyCode,
        conversionMode,
        setConversionMode,
        formatAmount,
        symbol: currency.symbol,
        popularCurrencies: popularList,
        allCurrencies: catalog,
        liveFxEnabled,
        setLiveFxEnabled,
        fxStatus,
        fxDateLabel,
        fxSnapshot,
        refreshFxRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    const defaultCurr = getCurrency(DEFAULT_CURRENCY_CODE);
    const staticSnap = getStaticFxSnapshot();
    return {
      currency: defaultCurr,
      currencyCode: defaultCurr.code,
      setCurrencyCode: () => {},
      conversionMode: 'face-value',
      setConversionMode: () => {},
      formatAmount: (amt, dec) =>
        formatCurrencyAmount(amt, defaultCurr, { decimals: dec, convertFromUsd: false }),
      symbol: defaultCurr.symbol,
      popularCurrencies: POPULAR_CURRENCIES.map(getCurrency),
      allCurrencies: CURRENCIES,
      liveFxEnabled: false,
      setLiveFxEnabled: () => {},
      fxStatus: 'static',
      fxDateLabel: 'static table',
      fxSnapshot: staticSnap,
      refreshFxRates: async () => {},
    };
  }
  return context;
};

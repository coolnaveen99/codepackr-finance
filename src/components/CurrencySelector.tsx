import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe, RefreshCw } from 'lucide-react';
import { useCurrency } from '../lib/CurrencyContext';
import { FX_STRIP_CODES } from '../lib/fxRates';

interface CurrencySelectorProps {
  idPrefix?: string;
  variant?: 'nav' | 'compact' | 'pill' | 'toolbar';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  idPrefix = 'currency-picker',
  variant = 'nav',
  className = '',
}) => {
  const {
    currency,
    currencyCode,
    setCurrencyCode,
    allCurrencies,
    popularCurrencies,
    liveFxEnabled,
    setLiveFxEnabled,
    fxStatus,
    fxDateLabel,
    fxSnapshot,
    refreshFxRates,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredCurrencies = allCurrencies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  });

  const isLiveVisual = liveFxEnabled && (fxStatus === 'live' || fxStatus === 'cached');
  const statusLabel =
    fxStatus === 'loading'
      ? 'Updating…'
      : fxStatus === 'live'
        ? 'Live · ECB via Frankfurter'
        : fxStatus === 'cached'
          ? 'Cached · ECB via Frankfurter'
          : fxStatus === 'error'
            ? 'Unavailable · using static'
            : 'Static rates';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {variant === 'nav' && (
        <button
          id={`${idPrefix}-nav-btn`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-[var(--brand)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: isOpen ? 'var(--brand)' : 'var(--line)',
            color: 'var(--ink)',
          }}
          title={`Global Currency: ${currency.name} (${currency.code})`}
        >
          <span className="text-sm leading-none" role="img" aria-label={currency.name}>
            {currency.flag}
          </span>
          <span className="font-mono font-bold text-[var(--brand)]">{currency.symbol.trim()}</span>
          <span className="font-semibold text-[11px] hidden sm:inline">{currency.code}</span>
          {isLiveVisual && (
            <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'toolbar' && (
        <button
          id={`${idPrefix}-toolbar-btn`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 cursor-pointer hover:border-[var(--brand)] shadow-sm"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: isOpen ? 'var(--brand)' : 'var(--line)',
            color: 'var(--ink)',
          }}
          title="Change Global Currency"
        >
          <span className="text-sm leading-none">{currency.flag}</span>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-[var(--brand)] font-bold">{currency.symbol.trim()}</span>
            <span className="font-bold">{currency.code}</span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'compact' && (
        <button
          id={`${idPrefix}-compact-btn`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="px-2 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 cursor-pointer hover:border-[var(--brand)]"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: isOpen ? 'var(--brand)' : 'var(--line)',
            color: 'var(--ink)',
          }}
        >
          <span className="text-xs">{currency.flag}</span>
          <span className="font-mono font-bold text-[var(--brand)]">{currency.symbol.trim()}</span>
          <span className="text-[10px] text-[var(--muted)]">{currency.code}</span>
          <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
        </button>
      )}

      {variant === 'pill' && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-[var(--surface-2)]" style={{ borderColor: 'var(--line)' }}>
            {popularCurrencies.slice(0, 5).map((pop) => (
              <button
                key={pop.code}
                type="button"
                id={`${idPrefix}-quick-${pop.code.toLowerCase()}`}
                onClick={() => setCurrencyCode(pop.code)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  currencyCode === pop.code
                    ? 'bg-[var(--brand)] text-white shadow-sm'
                    : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                }`}
              >
                <span>{pop.flag}</span>
                <span className="font-mono font-bold">{pop.symbol.trim()}</span>
                <span className="text-[10px] opacity-80">{pop.code}</span>
              </button>
            ))}
            <button
              type="button"
              id={`${idPrefix}-more-btn`}
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 py-1 rounded-lg text-xs font-medium border text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer flex items-center gap-1"
              style={{ borderColor: 'var(--line)' }}
              title="More Currencies"
            >
              <span>More...</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--line)',
            color: 'var(--ink)',
          }}
        >
          <div className="p-3 border-b space-y-2.5" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>
                  Select Currency (All Calculators)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                {allCurrencies.length} Currencies
              </span>
            </div>

            {/* Live FX controls */}
            <div
              className="px-2.5 py-2 rounded-xl border space-y-2"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isLiveVisual
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-[var(--surface)] text-[var(--muted)]'
                      }`}
                    >
                      {isLiveVisual && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                      {statusLabel}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] truncate">
                      Rates as of {fxDateLabel}
                      {liveFxEnabled ? ' · updates daily' : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshFxRates()}
                  disabled={!liveFxEnabled || fxStatus === 'loading'}
                  className="p-1.5 rounded-lg border text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-40 cursor-pointer"
                  style={{ borderColor: 'var(--line)' }}
                  title="Refresh FX rates"
                  aria-label="Refresh FX rates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fxStatus === 'loading' ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-[var(--ink)]">Use live FX rates</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={liveFxEnabled}
                  onClick={() => setLiveFxEnabled(!liveFxEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                    liveFxEnabled ? 'bg-[var(--brand)]' : 'bg-[var(--surface-muted)]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      liveFxEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {liveFxEnabled && (
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {FX_STRIP_CODES.map((code) => {
                    const rate = fxSnapshot.rates[code];
                    return (
                      <div
                        key={code}
                        className="rounded-lg border px-1 py-1 text-center"
                        style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface)' }}
                      >
                        <div className="text-[9px] font-bold text-[var(--muted)]">{code}</div>
                        <div className="text-[10px] font-mono font-semibold tabular-nums">
                          {typeof rate === 'number' ? rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-[10px] text-[var(--muted)] leading-snug">
                Calculations stay in your browser. Live rates load from Frankfurter (ECB). Offline? Static rates are used automatically.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search currency, code or symbol..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border outline-none font-medium"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                Popular:
              </span>
              {popularCurrencies.map((pop) => (
                <button
                  key={pop.code}
                  type="button"
                  onClick={() => {
                    setCurrencyCode(pop.code);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                    currencyCode === pop.code
                      ? 'bg-[var(--brand)] text-white border-transparent'
                      : 'hover:border-[var(--brand)] text-[var(--ink)]'
                  }`}
                  style={
                    currencyCode === pop.code
                      ? {}
                      : { borderColor: 'var(--line)', backgroundColor: 'var(--bg)' }
                  }
                >
                  {pop.flag} {pop.code}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-[var(--line)]">
            {filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--muted)]">No matching currencies found.</div>
            ) : (
              filteredCurrencies.map((c) => {
                const isSelected = c.code === currencyCode;
                const rate = fxSnapshot.rates[c.code];
                return (
                  <button
                    key={c.code}
                    type="button"
                    id={`${idPrefix}-item-${c.code.toLowerCase()}`}
                    onClick={() => {
                      setCurrencyCode(c.code);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[var(--brand)]/10' : 'hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl leading-none" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs" style={{ color: 'var(--ink)' }}>
                            {c.code}
                          </span>
                          <span className="font-mono font-bold text-xs text-[var(--brand)]">
                            ({c.symbol.trim()})
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] block leading-tight truncate">
                          {c.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {typeof rate === 'number' && c.code !== 'USD' && (
                        <span className="text-[10px] font-mono text-[var(--muted)] tabular-nums hidden sm:inline">
                          1 USD = {rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[var(--brand)]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div
            className="p-2 text-center text-[10px] text-[var(--muted)] border-t"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line)' }}
          >
            Calculator inputs stay in your chosen currency. FX rates are for reference only.
          </div>
        </div>
      )}
    </div>
  );
};

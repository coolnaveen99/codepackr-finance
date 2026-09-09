export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", decimalPlaces: 2 },
  { code: "EUR", symbol: "€", name: "Euro", decimalPlaces: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", decimalPlaces: 2 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", decimalPlaces: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimalPlaces: 0 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimalPlaces: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimalPlaces: 2 },
  { code: "CHF", symbol: "CHF ", name: "Swiss Franc", decimalPlaces: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimalPlaces: 2 },
  { code: "AED", symbol: "AED ", name: "UAE Dirham", decimalPlaces: 2 },
  { code: "SAR", symbol: "SAR ", name: "Saudi Riyal", decimalPlaces: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", decimalPlaces: 2 },
];

export const DEFAULT_CURRENCY = CURRENCIES.find((c) => c.code === "INR") ?? CURRENCIES[0];

export function formatMoney(
  value: number,
  currency: Currency,
  options: { compact?: boolean; digits?: number } = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const digits = options.digits ?? currency.decimalPlaces;
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (options.compact) {
    if (currency.code === "INR") {
      if (abs >= 1e7) return `${sign}${currency.symbol}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${currency.symbol}${(abs / 1e5).toFixed(2)} L`;
    } else {
      if (abs >= 1e9) return `${sign}${currency.symbol}${(abs / 1e9).toFixed(2)}B`;
      if (abs >= 1e6) return `${sign}${currency.symbol}${(abs / 1e6).toFixed(2)}M`;
      if (abs >= 1e3) return `${sign}${currency.symbol}${(abs / 1e3).toFixed(1)}K`;
    }
  }

  const locale = currency.code === "INR" ? "en-IN" : "en-US";
  return `${sign}${currency.symbol}${abs.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CURRENCIES, DEFAULT_CURRENCY, type Currency } from "./currency";

type Theme = "light" | "dark";

type PrefsState = {
  currencyCode: string;
  theme: Theme;
  favorites: string[];
  setCurrency: (code: string) => void;
  setTheme: (theme: Theme) => void;
  toggleFavorite: (id: string) => void;
};

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      currencyCode: DEFAULT_CURRENCY.code,
      theme: "light",
      favorites: [],
      setCurrency: (code) => set({ currencyCode: code }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },
      toggleFavorite: (id) => {
        const next = get().favorites.includes(id)
          ? get().favorites.filter((x) => x !== id)
          : [...get().favorites, id];
        set({ favorites: next });
      },
    }),
    { name: "codepackr-finance-prefs" },
  ),
);

export function useCurrency(): Currency {
  const code = usePrefs((s) => s.currencyCode);
  return CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY;
}

export function applyStoredTheme() {
  try {
    const raw = localStorage.getItem("codepackr-finance-prefs");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: { theme?: Theme } };
    if (parsed.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch {
    /* ignore */
  }
}

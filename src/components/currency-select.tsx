import { CURRENCIES } from "@/lib/currency";
import { useCurrency, usePrefs } from "@/lib/prefs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelect({ id }: { id?: string }) {
  const currency = useCurrency();
  const setCurrency = usePrefs((s) => s.setCurrency);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">Active currency</span>
      <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
        {currency.code} ({currency.symbol.trim()})
      </span>
      <Select value={currency.code} onValueChange={setCurrency}>
        <SelectTrigger id={id} className="h-9 w-44 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} — {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

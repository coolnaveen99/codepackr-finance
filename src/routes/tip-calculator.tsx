import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CurrencySelect } from "@/components/currency-select";
import { Field } from "@/components/field";
import { StatGrid } from "@/components/stat-grid";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findCalculator } from "@/lib/catalog";
import { formatMoney, parseAmount } from "@/lib/currency";
import { useCurrency } from "@/lib/prefs";

export const Route = createFileRoute("/tip-calculator")({ component: TipPage });

const tool = findCalculator("tip-calculator")!;

function TipPage() {
  const currency = useCurrency();
  const [bill, setBill] = useState("85.50");
  const [tip, setTip] = useState("18");
  const [people, setPeople] = useState("2");

  const result = useMemo(() => {
    const b = parseAmount(bill);
    const t = parseAmount(tip);
    const n = Math.max(1, Math.round(parseAmount(people) || 1));
    const tipAmt = (b * t) / 100;
    const total = b + tipAmt;
    return { tipAmt, total, per: total / n, n };
  }, [bill, tip, people]);

  return (
    <ToolPage tool={tool}>
      <Card className="mx-auto max-w-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Bill split</CardTitle>
          <CurrencySelect id="tip-currency" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={`Bill amount (${currency.symbol.trim()})`}
              value={bill}
              onChange={setBill}
              placeholder="e.g. 85.50"
            />
            <Field
              label={`Tip percentage (${parseAmount(tip) || 0}%)`}
              value={tip}
              onChange={setTip}
              placeholder="e.g. 18"
            />
            <Field label="Split (people)" value={people} onChange={setPeople} placeholder="1" inputMode="numeric" />
          </div>
          <StatGrid
            items={[
              { label: "Tip", value: formatMoney(result.tipAmt, currency), tone: "ok" },
              { label: "Total bill", value: formatMoney(result.total, currency) },
              { label: "Per person", value: formatMoney(result.per, currency), tone: "brand" },
            ]}
          />
        </CardContent>
      </Card>
    </ToolPage>
  );
}

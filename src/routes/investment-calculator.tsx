import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { CurrencySelect } from "@/components/currency-select";
import { Donut } from "@/components/donut";
import { Field } from "@/components/field";
import { Segmented } from "@/components/segmented";
import { StatGrid } from "@/components/stat-grid";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findCalculator } from "@/lib/catalog";
import { formatMoney, parseAmount } from "@/lib/currency";
import { downloadCsv, investmentProjection } from "@/lib/finance";
import { useCurrency } from "@/lib/prefs";

export const Route = createFileRoute("/investment-calculator")({ component: InvestmentPage });

const tool = findCalculator("investment-calculator")!;

const FREQ = [
  { value: "12", label: "Monthly (12/year — recommended)" },
  { value: "4", label: "Quarterly (4/year)" },
  { value: "2", label: "Semi-annually (2/year)" },
  { value: "1", label: "Annually (1/year)" },
  { value: "365", label: "Daily (365/year)" },
];

function InvestmentPage() {
  const currency = useCurrency();
  const [principal, setPrincipal] = useState("10000");
  const [deposit, setDeposit] = useState("1000");
  const [cadence, setCadence] = useState<"monthly" | "annually">("monthly");
  const [rate, setRate] = useState("8");
  const [freq, setFreq] = useState("12");
  const [tenure, setTenure] = useState("10");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const [stepUp, setStepUp] = useState("0");

  const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
  const result = useMemo(
    () =>
      investmentProjection({
        principal: parseAmount(principal),
        deposit: parseAmount(deposit),
        depositAnnual: cadence === "annually",
        annualRate: parseAmount(rate),
        compoundsPerYear: Number(freq),
        months: Math.max(0, months),
        stepUp: parseAmount(stepUp),
      }),
    [principal, deposit, cadence, rate, freq, months, stepUp],
  );

  return (
    <ToolPage tool={tool}>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Investment inputs</CardTitle>
          <CurrencySelect id="comp-currency" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={`Initial principal (${currency.symbol.trim()})`}
              value={principal}
              onChange={setPrincipal}
              placeholder="e.g. 10000"
              hint={parseAmount(principal) > 0 ? formatMoney(parseAmount(principal), currency) : "Starting investment"}
            />
            <div>
              <div className="mb-1.5 flex h-7 items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Regular deposit
                </span>
                <Segmented
                  value={cadence}
                  onChange={setCadence}
                  options={[
                    { value: "monthly", label: "Mo" },
                    { value: "annually", label: "Yr" },
                  ]}
                />
              </div>
              <Field value={deposit} onChange={setDeposit} placeholder="e.g. 1000" />
            </div>
            <Field
              label="Annual interest rate (%)"
              value={rate}
              onChange={setRate}
              placeholder="e.g. 8"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Compounding frequency
              </p>
              <Select value={freq} onValueChange={setFreq}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQ.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1.5 flex h-7 items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Tenure ({unit})
                </span>
                <Segmented
                  value={unit}
                  onChange={setUnit}
                  options={[
                    { value: "years", label: "Yr" },
                    { value: "months", label: "Mo" },
                  ]}
                />
              </div>
              <Field value={tenure} onChange={setTenure} placeholder="e.g. 10" />
            </div>
          </div>

          <Field
            label="Annual step-up (year 2 onwards)"
            value={stepUp}
            onChange={setStepUp}
            placeholder="0"
            suffix="%"
            hint="Gradually increase regular deposits each year"
          />

          <StatGrid
            items={[
              { label: "Total invested", value: formatMoney(result.invested, currency), tone: "brand" },
              { label: "Interest earned", value: `+${formatMoney(result.gain, currency)}`, tone: "ok" },
              { label: "Future value", value: formatMoney(result.maturity, currency) },
            ]}
          />

          <Donut
            slices={[
              { name: "Principal + deposits", value: result.invested },
              { name: "Interest", value: Math.max(0, result.gain) },
            ]}
            center={{ title: "Future value", value: formatMoney(result.maturity, currency, { compact: true }) }}
          />

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv("investment-schedule.csv", [
                  ["Year", "Added", "Interest", "Closing"],
                  ...result.rows.map((r) => [
                    String(r.year),
                    r.invested.toFixed(2),
                    r.interest.toFixed(2),
                    r.closing.toFixed(2),
                  ]),
                ])
              }
            >
              <Download />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </ToolPage>
  );
}

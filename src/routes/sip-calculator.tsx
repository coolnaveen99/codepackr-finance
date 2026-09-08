import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CurrencySelect } from "@/components/currency-select";
import { Donut } from "@/components/donut";
import { Field } from "@/components/field";
import { Segmented } from "@/components/segmented";
import { StatGrid } from "@/components/stat-grid";
import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findCalculator } from "@/lib/catalog";
import { formatMoney, parseAmount } from "@/lib/currency";
import { downloadCsv, sipProjection } from "@/lib/finance";
import { useCurrency } from "@/lib/prefs";

export const Route = createFileRoute("/sip-calculator")({ component: SipPage });

const tool = findCalculator("sip-calculator")!;

function SipPage() {
  const currency = useCurrency();
  const [monthly, setMonthly] = useState("10000");
  const [rate, setRate] = useState("12");
  const [tenure, setTenure] = useState("10");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const [stepUp, setStepUp] = useState("0");
  const [inflation, setInflation] = useState("0");

  const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
  const result = useMemo(
    () =>
      sipProjection({
        monthly: parseAmount(monthly),
        annualRate: parseAmount(rate),
        months: Math.max(0, months),
        stepUp: parseAmount(stepUp),
        inflation: parseAmount(inflation),
      }),
    [monthly, rate, months, stepUp, inflation],
  );

  return (
    <ToolPage tool={tool}>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">SIP inputs</CardTitle>
          <CurrencySelect id="sip-currency" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={`Monthly investment (${currency.symbol.trim()})`}
              value={monthly}
              onChange={setMonthly}
              placeholder="e.g. 10000"
              hint={parseAmount(monthly) > 0 ? formatMoney(parseAmount(monthly), currency) : "Enter monthly SIP"}
            />
            <Field
              label="Expected return rate (%)"
              value={rate}
              onChange={setRate}
              placeholder="e.g. 12"
              hint={`${parseAmount(rate) || 0}% per annum`}
            />
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

          <div className="grid gap-4 rounded-lg border border-border bg-elevated p-3.5 sm:grid-cols-2">
            <Field
              label="Annual step-up (year 2 onwards)"
              value={stepUp}
              onChange={setStepUp}
              placeholder="0"
              suffix="%"
              hint="Increase SIP each year"
            />
            <Field
              label="Inflation rate adjustment (%)"
              value={inflation}
              onChange={setInflation}
              placeholder="0 (nominal returns)"
              suffix="%"
              hint={
                parseAmount(inflation) > 0
                  ? `Real purchasing power discounted at ${parseAmount(inflation)}%/yr`
                  : "Displays nominal maturity value"
              }
            />
          </div>

          <StatGrid
            items={[
              { label: "Total invested", value: formatMoney(result.invested, currency), tone: "brand" },
              {
                label: "Est. wealth gain",
                value: `+${formatMoney(result.gain, currency)}`,
                tone: "ok",
              },
              { label: "Expected maturity", value: formatMoney(result.maturity, currency) },
            ]}
          />
          {parseAmount(inflation) > 0 ? (
            <p className="text-center text-xs text-muted">
              Inflation-adjusted value: {formatMoney(result.realValue, currency)}
            </p>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-semibold">SIP wealth breakdown</p>
            <Donut
              slices={[
                { name: "Invested", value: result.invested },
                { name: "Wealth gain", value: Math.max(0, result.gain) },
              ]}
              center={{ title: "Maturity", value: formatMoney(result.maturity, currency, { compact: true }) }}
            />
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.rows}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={48} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="closing" name="Corpus" stroke="var(--brand)" fill="var(--brand-light)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv("sip-schedule.csv", [
                  ["Year", "Invested", "Interest", "Closing"],
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

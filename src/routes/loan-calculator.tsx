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
import { findCalculator } from "@/lib/catalog";
import { formatMoney, parseAmount } from "@/lib/currency";
import { annualizeSchedule, downloadCsv, loanSchedule } from "@/lib/finance";
import { useCurrency } from "@/lib/prefs";

export const Route = createFileRoute("/loan-calculator")({ component: LoanPage });

const tool = findCalculator("loan-calculator")!;

function LoanPage() {
  const currency = useCurrency();
  const [principal, setPrincipal] = useState("50000");
  const [rate, setRate] = useState("10");
  const [tenure, setTenure] = useState("5");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const [view, setView] = useState<"annual" | "monthly">("annual");
  const [open, setOpen] = useState(true);

  const months = unit === "years" ? Math.round(parseAmount(tenure) * 12) : Math.round(parseAmount(tenure));
  const result = useMemo(
    () =>
      loanSchedule({
        principal: parseAmount(principal),
        annualRate: parseAmount(rate),
        months: Math.max(0, months),
      }),
    [principal, rate, months],
  );

  const annual = useMemo(() => annualizeSchedule(result.rows), [result.rows]);
  const principalPct = result.totalPayment > 0 ? (parseAmount(principal) / result.totalPayment) * 100 : 0;
  const interestPct = result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

  return (
    <ToolPage tool={tool}>
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Loan inputs</CardTitle>
          <CurrencySelect id="loan-currency" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={`Principal amount (${currency.symbol.trim()})`}
              value={principal}
              onChange={setPrincipal}
              placeholder="e.g. 50000"
              hint={parseAmount(principal) > 0 ? formatMoney(parseAmount(principal), currency) : "Enter loan amount"}
            />
            <Field
              label="Annual interest rate (%)"
              value={rate}
              onChange={setRate}
              placeholder="e.g. 10"
              hint={`${parseAmount(rate) || 0}% per annum`}
            />
            <div className="space-y-1.5">
              <div className="flex h-7 items-center justify-between">
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
              <Field value={tenure} onChange={setTenure} placeholder="e.g. 5" />
            </div>
          </div>

          <StatGrid
            items={[
              { label: "Monthly EMI", value: formatMoney(result.emi, currency), tone: "brand" },
              { label: "Total interest", value: formatMoney(result.totalInterest, currency), tone: "danger" },
              { label: "Total payment", value: formatMoney(result.totalPayment, currency) },
            ]}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Donut
              slices={[
                { name: "Principal", value: parseAmount(principal) },
                { name: "Interest", value: result.totalInterest },
              ]}
              center={{ title: "Total", value: formatMoney(result.totalPayment, currency, { compact: true }) }}
            />
            <div className="space-y-3 self-center">
              <p className="text-sm font-semibold">Loan breakdown</p>
              <Legend
                color="var(--brand)"
                title="Principal loan amount"
                sub={`${principalPct.toFixed(1)}% of total repayment`}
                value={formatMoney(parseAmount(principal), currency)}
              />
              <Legend
                color="var(--danger)"
                title="Total interest payable"
                sub={`${interestPct.toFixed(1)}% of total repayment`}
                value={formatMoney(result.totalInterest, currency)}
                valueClass="text-danger"
              />
              <div className="flex h-2 overflow-hidden rounded-full bg-elevated">
                <div className="bg-primary" style={{ width: `${Math.min(100, principalPct)}%` }} />
                <div className="bg-danger" style={{ width: `${Math.min(100, interestPct)}%` }} />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={() => setOpen((v) => !v)}
              >
                Amortization schedule ({currency.code} {currency.symbol.trim()})
              </button>
              {open ? (
                <div className="flex items-center gap-2">
                  <Segmented
                    value={view}
                    onChange={setView}
                    options={[
                      { value: "annual", label: "Annual" },
                      { value: "monthly", label: "Monthly" },
                    ]}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rows =
                        view === "annual"
                          ? [
                              ["Year", "Opening", "Principal", "Interest", "Closing"],
                              ...annual.map((r) => [
                                String(r.year),
                                r.opening.toFixed(2),
                                r.principalPaid.toFixed(2),
                                r.interestPaid.toFixed(2),
                                r.closing.toFixed(2),
                              ]),
                            ]
                          : [
                              ["Period", "Opening", "Principal", "Interest", "Closing"],
                              ...result.rows.map((r) => [
                                String(r.period),
                                r.opening.toFixed(2),
                                r.principalPaid.toFixed(2),
                                r.interestPaid.toFixed(2),
                                r.closing.toFixed(2),
                              ]),
                            ];
                      downloadCsv("loan-amortization.csv", rows);
                    }}
                  >
                    <Download />
                    Export CSV
                  </Button>
                </div>
              ) : null}
            </div>
            {open ? (
              <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-elevated text-muted">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">{view === "annual" ? "Year" : "Period"}</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Opening balance</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Principal paid</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Interest paid</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Closing balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(view === "annual"
                      ? annual.map((r) => ({ key: r.year, label: r.year, ...r }))
                      : result.rows.map((r) => ({ key: r.period, label: r.period, ...r }))
                    ).map((r) => (
                      <tr key={r.key} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{r.label}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatMoney(r.opening, currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatMoney(r.principalPaid, currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatMoney(r.interestPaid, currency)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {formatMoney(r.closing, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </ToolPage>
  );
}

function Legend({
  color,
  title,
  sub,
  value,
  valueClass,
}: {
  color: string;
  title: string;
  sub: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="size-3 shrink-0 rounded-full" style={{ background: color }} />
        <div>
          <p className="text-xs font-semibold">{title}</p>
          <p className="text-xs text-muted">{sub}</p>
        </div>
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${valueClass ?? "text-primary"}`}>
        {value}
      </span>
    </div>
  );
}

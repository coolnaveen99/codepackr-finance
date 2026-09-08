import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CurrencySelect } from "@/components/currency-select";
import { Field } from "@/components/field";
import { ToolPage } from "@/components/tool-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findCalculator } from "@/lib/catalog";
import { formatMoney, parseAmount } from "@/lib/currency";
import {
  DEFAULT_PLANNER,
  buildPlan,
  downloadCsv,
  type PlannerInputs,
} from "@/lib/finance";
import { useCurrency } from "@/lib/prefs";

export const Route = createFileRoute("/financial-planner")({ component: PlannerPage });

const tool = findCalculator("financial-planner")!;

function PlannerPage() {
  const currency = useCurrency();
  const [inputs, setInputs] = useState<PlannerInputs>(DEFAULT_PLANNER);
  const plan = useMemo(() => buildPlan(inputs), [inputs]);
  const money = (n: number) => formatMoney(n, currency, { compact: true });
  const moneyFull = (n: number) => formatMoney(Math.round(n), currency, { digits: 0 });

  function set<K extends keyof PlannerInputs>(key: K, raw: string) {
    if (key === "clientName") {
      setInputs((s) => ({ ...s, clientName: raw }));
      return;
    }
    setInputs((s) => ({ ...s, [key]: parseAmount(raw) }));
  }

  const ratio = plan.fundingRatio;
  const tone = ratio >= 1 ? "ok" : ratio >= 0.8 ? "warn" : "danger";
  const status =
    ratio >= 1.1
      ? "Fully funded · surplus runway"
      : ratio >= 1
        ? "Fully funded · on target"
        : ratio >= 0.8
          ? "Moderate gap · minor adjustments needed"
          : "Significant shortfall · restructuring advised";

  const chart = [
    { age: inputs.currentAge, corpus: inputs.currentCorpus },
    ...plan.accumulation.map((r) => ({ age: r.age, corpus: r.closingCorpus })),
    ...plan.retirement.map((r) => ({ age: r.age, corpus: r.closingCorpus })),
  ];

  return (
    <ToolPage tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Plan assumptions</CardTitle>
            <CurrencySelect id="plan-currency" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Client name"
              value={inputs.clientName}
              onChange={(v) => set("clientName", v)}
              className="font-sans"
            />
            <Field label="Current age" value={String(inputs.currentAge)} onChange={(v) => set("currentAge", v)} />
            <Field
              label="Retirement age"
              value={String(inputs.retirementAge)}
              onChange={(v) => set("retirementAge", v)}
            />
            <Field
              label="Life expectancy"
              value={String(inputs.lifeExpectancy)}
              onChange={(v) => set("lifeExpectancy", v)}
            />
            <Field
              label={`Annual income (${currency.symbol.trim()})`}
              value={String(inputs.annualIncome)}
              onChange={(v) => set("annualIncome", v)}
            />
            <Field
              label="Income growth (%)"
              value={String(inputs.incomeGrowth)}
              onChange={(v) => set("incomeGrowth", v)}
            />
            <Field
              label={`Annual expenses (${currency.symbol.trim()})`}
              value={String(inputs.annualExpenses)}
              onChange={(v) => set("annualExpenses", v)}
            />
            <Field label="Inflation (%)" value={String(inputs.inflation)} onChange={(v) => set("inflation", v)} />
            <Field
              label={`Current corpus (${currency.symbol.trim()})`}
              value={String(inputs.currentCorpus)}
              onChange={(v) => set("currentCorpus", v)}
            />
            <Field
              label={`Monthly SIP (${currency.symbol.trim()})`}
              value={String(inputs.monthlySip)}
              onChange={(v) => set("monthlySip", v)}
            />
            <Field label="SIP step-up (%)" value={String(inputs.sipStepUp)} onChange={(v) => set("sipStepUp", v)} />
            <Field
              label={`Annual lump sum (${currency.symbol.trim()})`}
              value={String(inputs.annualLumpSum)}
              onChange={(v) => set("annualLumpSum", v)}
            />
            <Field
              label="Pre-retirement return (%)"
              value={String(inputs.preReturn)}
              onChange={(v) => set("preReturn", v)}
            />
            <Field
              label="Post-retirement return (%)"
              value={String(inputs.postReturn)}
              onChange={(v) => set("postReturn", v)}
            />
            <Field
              label={`Emergency fund (${currency.symbol.trim()})`}
              value={String(inputs.emergencyFund)}
              onChange={(v) => set("emergencyFund", v)}
            />
            <Field
              label="Emergency months"
              value={String(inputs.emergencyMonths)}
              onChange={(v) => set("emergencyMonths", v)}
            />
            <Field
              label={`Total debt (${currency.symbol.trim()})`}
              value={String(inputs.totalDebt)}
              onChange={(v) => set("totalDebt", v)}
            />
            <Field
              label={`Annual debt payment (${currency.symbol.trim()})`}
              value={String(inputs.annualDebtPayment)}
              onChange={(v) => set("annualDebtPayment", v)}
            />
            <Field
              label={`Pension / other income (${currency.symbol.trim()})`}
              value={String(inputs.annualRetirementIncome)}
              onChange={(v) => set("annualRetirementIncome", v)}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Retirement readiness</CardTitle>
                <Badge variant={tone}>{plan.sustainabilityStatus}</Badge>
              </div>
              <p className="text-sm text-muted">{status}</p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Metric label="Projected corpus" value={money(plan.projectedCorpus)} />
              <Metric label="Required corpus" value={money(plan.requiredCorpus)} />
              <Metric
                label="Funding ratio"
                value={`${(plan.fundingRatio * 100).toFixed(1)}%`}
                tone={tone}
              />
              <Metric label="Years to retire" value={String(plan.yearsToRetirement)} />
              <Metric
                label="Required monthly SIP"
                value={moneyFull(plan.requiredMonthlySip)}
              />
              <Metric
                label="Independence age"
                value={plan.financialIndependenceAge ? String(plan.financialIndependenceAge) : "—"}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl font-semibold tabular-nums">
                {plan.financialHealth.toFixed(0)}
              </p>
              <p className="mb-4 text-xs text-muted">Composite score / 100</p>
              <ul className="space-y-2">
                {plan.healthBreakdown.map((h) => (
                  <li key={h.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted">{h.label}</span>
                      <span className="font-mono tabular-nums">{h.score.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, h.score)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Corpus path</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={56} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="corpus"
                  name="Corpus"
                  stroke="var(--brand)"
                  fill="var(--brand-light)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market scenario stress testing</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-fg text-bg">
                <tr>
                  <th className="px-3 py-2.5">Scenario</th>
                  <th className="px-3 py-2.5">Pre / post return</th>
                  <th className="px-3 py-2.5 text-right">Projected corpus</th>
                  <th className="px-3 py-2.5 text-right">Required target</th>
                  <th className="px-3 py-2.5 text-right">Funding ratio</th>
                </tr>
              </thead>
              <tbody>
                {plan.scenarios.map((s) => (
                  <tr key={s.key} className={s.key === "base" ? "bg-primary/5 font-semibold" : "border-t border-border"}>
                    <td className="px-3 py-2">
                      {s.label}
                      {s.key === "base" ? " (base model)" : ""}
                    </td>
                    <td className="px-3 py-2">
                      {s.preReturn}% / {s.postReturn}%
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{money(s.projectedCorpus)}</td>
                    <td className="px-3 py-2 text-right font-mono">{money(s.requiredCorpus)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {(s.fundingRatio * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.recommendations.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-1 text-sm text-muted">{r.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Year-by-year actuarial schedule</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv("retirement-schedule.csv", [
                  ["Phase", "Year", "Age", "Opening", "Flow", "Growth", "Closing"],
                  ...plan.accumulation.map((r) => [
                    "Accumulation",
                    String(r.year),
                    String(r.age),
                    r.openingCorpus.toFixed(0),
                    r.annualContribution.toFixed(0),
                    r.investmentGrowth.toFixed(0),
                    r.closingCorpus.toFixed(0),
                  ]),
                  ...plan.retirement.map((r) => [
                    "Withdrawal",
                    String(r.year),
                    String(r.age),
                    r.openingCorpus.toFixed(0),
                    (-r.withdrawal).toFixed(0),
                    r.growth.toFixed(0),
                    r.closingCorpus.toFixed(0),
                  ]),
                ])
              }
            >
              <Download />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-elevated text-muted">
                <tr>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Phase</th>
                  <th className="px-3 py-2 text-right">Opening</th>
                  <th className="px-3 py-2 text-right">Contribution / withdrawal</th>
                  <th className="px-3 py-2 text-right">Growth</th>
                  <th className="px-3 py-2 text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {plan.accumulation.map((r) => (
                  <tr key={`a-${r.year}`} className="border-t border-border">
                    <td className="px-3 py-2">{r.age}</td>
                    <td className="px-3 py-2">Saving</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.openingCorpus)}</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.annualContribution)}</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.investmentGrowth)}</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.closingCorpus)}</td>
                  </tr>
                ))}
                {plan.retirement.map((r) => (
                  <tr key={`w-${r.year}`} className="border-t border-border">
                    <td className="px-3 py-2">{r.age}</td>
                    <td className="px-3 py-2">Retired</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.openingCorpus)}</td>
                    <td className="px-3 py-2 text-right font-mono text-danger">
                      −{money(r.withdrawal)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.growth)}</td>
                    <td className="px-3 py-2 text-right font-mono">{money(r.closingCorpus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "danger";
}) {
  const color =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "danger" ? "text-danger" : "text-fg";
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

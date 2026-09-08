import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { findCalculator } from "@/lib/catalog";
import { parseAmount } from "@/lib/currency";

export const Route = createFileRoute("/percentage-calculator")({ component: PercentPage });

const tool = findCalculator("percentage-calculator")!;

function PercentPage() {
  const [x, setX] = useState("15");
  const [y, setY] = useState("200");
  const [from, setFrom] = useState("50");
  const [to, setTo] = useState("75");
  const [part, setPart] = useState("25");
  const [whole, setWhole] = useState("200");

  const of = (parseAmount(x) * parseAmount(y)) / 100;
  const fromN = parseAmount(from);
  const toN = parseAmount(to);
  const change = fromN !== 0 ? ((toN - fromN) / Math.abs(fromN)) * 100 : 0;
  const ratio = parseAmount(whole) !== 0 ? (parseAmount(part) / parseAmount(whole)) * 100 : 0;

  return (
    <ToolPage tool={tool}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calculate percentage (what is X% of Y?)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="text-sm">What is</span>
            <Input className="w-24 text-center" value={x} onChange={(e) => setX(e.target.value)} placeholder="15" />
            <span className="text-sm">% of</span>
            <Input className="w-28 text-center" value={y} onChange={(e) => setY(e.target.value)} placeholder="200" />
            <span className="text-sm font-bold">=</span>
            <span className="rounded-md bg-primary/10 px-3 py-1 font-mono text-xl font-bold text-primary">
              {of.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Percentage increase or decrease</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="text-sm">From</span>
            <Input className="w-28 text-center" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="50" />
            <span className="text-sm">to</span>
            <Input className="w-28 text-center" value={to} onChange={(e) => setTo(e.target.value)} placeholder="75" />
            <span className="text-sm font-bold">=</span>
            <span
              className={`rounded-md px-3 py-1 font-mono text-xl font-bold ${
                change >= 0 ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"
              }`}
            >
              {change.toFixed(2)}%
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">X is what percent of Y?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Input className="w-28 text-center" value={part} onChange={(e) => setPart(e.target.value)} placeholder="25" />
            <span className="text-sm">is what % of</span>
            <Input className="w-28 text-center" value={whole} onChange={(e) => setWhole(e.target.value)} placeholder="200" />
            <span className="text-sm font-bold">=</span>
            <span className="rounded-md bg-primary/10 px-3 py-1 font-mono text-xl font-bold text-primary">
              {ratio.toFixed(2)}%
            </span>
          </CardContent>
        </Card>
      </div>
    </ToolPage>
  );
}

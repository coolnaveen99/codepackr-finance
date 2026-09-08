import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Card, CardContent } from "@/components/ui/card";
import { findCalculator } from "@/lib/catalog";
import { evaluate, formatResult } from "@/lib/expr";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calculator")({ component: SciPage });

const tool = findCalculator("calculator")!;

const MAIN = ["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "%", "="];
const SCI = ["sin", "cos", "tan", "ln", "log", "sqrt", "π", "e", "^", "⌫"];

function SciPage() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [error, setError] = useState<string | null>(null);

  function apply(key: string) {
    setError(null);
    if (key === "C") {
      setExpr("");
      setDisplay("0");
      return;
    }
    if (key === "⌫") {
      const next = expr.slice(0, -1);
      setExpr(next);
      setDisplay(next || "0");
      return;
    }
    if (key === "=") {
      try {
        const v = evaluate(expr || "0");
        const out = formatResult(v);
        setDisplay(out);
        setExpr(out);
      } catch {
        setError("Invalid expression");
        setDisplay("Error");
      }
      return;
    }
    if (key === "%") {
      try {
        const v = evaluate(expr || "0") / 100;
        const out = formatResult(v);
        setDisplay(out);
        setExpr(out);
      } catch {
        setError("Invalid expression");
      }
      return;
    }
    const mapped: Record<string, string> = {
      "÷": "/",
      "×": "*",
      "−": "-",
      sin: "sin(",
      cos: "cos(",
      tan: "tan(",
      ln: "ln(",
      log: "log(",
      sqrt: "sqrt(",
      π: "pi",
    };
    const next = expr + (mapped[key] ?? key);
    setExpr(next);
    setDisplay(next);
  }

  return (
    <ToolPage tool={tool}>
      <Card className="mx-auto max-w-md shadow-[var(--shadow-border)]">
        <CardContent className="p-6">
          <div className="mb-4 overflow-hidden rounded-lg border border-border bg-elevated p-4 text-right">
            <div className="h-5 truncate font-mono text-xs text-muted">{expr || " "}</div>
            <div className="font-mono text-3xl font-bold tracking-tight tabular-nums">
              {error ?? display}
            </div>
          </div>
          <div className="mb-2.5 grid grid-cols-5 gap-2">
            {SCI.map((k) => (
              <Key key={k} label={k} onClick={() => apply(k)} tone="sci" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {MAIN.map((k) => (
              <Key
                key={k}
                label={k}
                onClick={() => apply(k)}
                tone={k === "=" ? "eq" : ["+", "−", "×", "÷"].includes(k) ? "op" : k === "C" ? "clear" : "num"}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </ToolPage>
  );
}

function Key({
  label,
  onClick,
  tone,
}: {
  label: string;
  onClick: () => void;
  tone: "num" | "op" | "eq" | "clear" | "sci";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border py-3.5 font-mono text-sm font-semibold transition-transform active:scale-95",
        tone === "eq" && "bg-primary text-primary-fg",
        tone === "op" && "bg-primary/10 text-primary",
        tone === "clear" && "bg-danger/10 text-danger",
        tone === "sci" && "bg-elevated py-2.5 text-xs text-muted",
        tone === "num" && "hover:bg-elevated",
      )}
    >
      {label}
    </button>
  );
}

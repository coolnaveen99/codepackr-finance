import { cn } from "@/lib/utils";

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; tone?: "default" | "brand" | "ok" | "danger" }[];
}) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-elevated sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-4 text-center">
          <p className="text-xs font-medium text-muted">{item.label}</p>
          <p
            className={cn(
              "mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight",
              item.tone === "brand" && "text-primary",
              item.tone === "ok" && "text-ok",
              item.tone === "danger" && "text-danger",
              (!item.tone || item.tone === "default") && "text-fg",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { type CalculatorTool, relatedCalculators } from "@/lib/catalog";
import { usePrefs } from "@/lib/prefs";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function ToolPage({
  tool,
  children,
}: {
  tool: CalculatorTool;
  children: React.ReactNode;
}) {
  const favorites = usePrefs((s) => s.favorites);
  const toggleFavorite = usePrefs((s) => s.toggleFavorite);
  const saved = favorites.includes(tool.id);
  const related = relatedCalculators(tool.id);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" />
            All calculators
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{tool.name}</h1>
            {tool.isNew ? <Badge>New</Badge> : null}
          </div>
          <p className="mt-2 max-w-2xl text-muted">{tool.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toggleFavorite(tool.id)}>
            <Heart className={saved ? "fill-primary text-primary" : ""} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied");
              } catch {
                toast.error("Could not copy link");
              }
            }}
          >
            <Share2 />
            Copy link
          </Button>
        </div>
      </div>
      {children}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">Related calculators</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {related.map((r) => (
            <Link key={r.id} to={r.path} className="block">
              <Card className="h-full hover:shadow-[var(--shadow-border-hover)]">
                <CardHeader className="p-4">
                  <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <r.icon className="size-4" />
                  </div>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted">{r.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <p className="mt-8 text-xs text-subtle">
        Figures are estimates for planning only, not tax, investment, or credit advice. Confirm
        with a qualified adviser before acting.
      </p>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, GroupNav } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CALCULATORS, type CalcGroup } from "@/lib/catalog";
import { usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [group, setGroup] = useState<string>("all");
  const favorites = usePrefs((s) => s.favorites);
  const toggleFavorite = usePrefs((s) => s.toggleFavorite);

  const tools = useMemo(() => {
    if (group === "favorites") return CALCULATORS.filter((c) => favorites.includes(c.id));
    if (group === "all") return CALCULATORS;
    return CALCULATORS.filter((c) => c.group === (group as CalcGroup));
  }, [group, favorites]);

  return (
    <AppShell>
      <section className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Codepackr Finance
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Calculators only. Everything else stays on the main site.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          The calculator suite from codepackr.com, moved here as a dedicated finance hub. EMI,
          SIP, investments, retirement planning, and everyday math — all 100% in-browser.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <li className="inline-flex items-center gap-1.5">
            <Lock className="size-3.5 text-primary" />
            Zero data leaves the browser
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Search className="size-3.5 text-primary" />
            {CALCULATORS.length} calculators, no developer tools
          </li>
        </ul>
      </section>

      <GroupNav value={group} onChange={setGroup} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const saved = favorites.includes(tool.id);
          return (
            <Card key={tool.id} className="group relative flex flex-col hover:shadow-[var(--shadow-border-hover)]">
              <CardContent className="relative flex h-full flex-col p-5">
                <Link
                  to={tool.path}
                  className="absolute inset-0 z-0 rounded-xl"
                  aria-label={`Open ${tool.name}`}
                />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <tool.icon className="size-5" />
                  </div>
                  <div className="relative z-10 flex items-center gap-1.5">
                    {tool.isNew ? <Badge>New</Badge> : null}
                    {tool.popular ? <Badge variant="muted">Popular</Badge> : null}
                    <button
                      type="button"
                      aria-label={saved ? "Remove from favorites" : "Save calculator"}
                      onClick={() => toggleFavorite(tool.id)}
                      className="relative flex size-11 items-center justify-center rounded-sm text-muted hover:bg-elevated hover:text-fg"
                    >
                      <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-xl font-semibold leading-snug">{tool.name}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{tool.description}</p>
                <span className="relative z-10 mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg group-hover:bg-primary-hover">
                  Launch
                  <ArrowRight className="size-4" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tools.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No saved calculators yet.</p>
      ) : null}
    </AppShell>
  );
}

import { Toaster } from "sonner";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Moon, Search, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CALCULATORS, GROUPS } from "@/lib/catalog";
import { applyStoredTheme, usePrefs } from "@/lib/prefs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = usePrefs((s) => s.theme);
  const setTheme = usePrefs((s) => s.setTheme);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    applyStoredTheme();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Toaster position="bottom-right" />
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold text-primary-fg">
              C
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-semibold leading-tight tracking-tight">
                Codepackr Finance
              </span>
              <span className="hidden text-xs text-muted sm:block">
                finance.codepackr.com
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ml-auto hidden h-10 max-w-xs flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm text-muted sm:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">Search calculators</span>
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-xs">
              ⌘K
            </kbd>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto sm:ml-0"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4 sm:hidden" />
            <span className="sr-only sm:hidden">Search</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>All calculations run locally in your browser. Nothing is uploaded.</p>
          <p>
            Developer tools stay on{" "}
            <a
              className="font-medium text-primary underline-offset-2 hover:underline"
              href="https://www.codepackr.com"
              target="_blank"
              rel="noreferrer"
            >
              codepackr.com
            </a>
          </p>
        </div>
      </footer>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return CALCULATORS;
    return CALCULATORS.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.description.toLowerCase().includes(needle) ||
        c.group.includes(needle),
    );
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogTitle>Search calculators</DialogTitle>
        <DialogDescription>Jump to any finance tool. Developer tools are not here.</DialogDescription>
        <Input
          autoFocus
          value={q}
          placeholder="EMI, SIP, retirement…"
          onChange={(e) => setQ(e.target.value)}
          className="font-sans"
        />
        <ul className="max-h-72 overflow-auto">
          {matches.map((tool) => (
            <li key={tool.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-elevated"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: tool.path });
                }}
              >
                <tool.icon className="mt-0.5 size-4 text-primary" />
                <span>
                  <span className="block text-sm font-medium">{tool.name}</span>
                  <span className="block text-xs text-muted">{tool.description}</span>
                </span>
              </button>
            </li>
          ))}
          {matches.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted">No matching calculators.</li>
          ) : null}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function GroupNav({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const favorites = usePrefs((s) => s.favorites);
  return (
    <div className="flex flex-wrap gap-2">
      {GROUPS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g.id)}
          className={cn(
            "h-10 rounded-full px-3.5 text-sm font-medium",
            value === g.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
          )}
        >
          {g.label}
        </button>
      ))}
      {pathname === "/" && favorites.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("favorites")}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium",
            value === "favorites" ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg",
          )}
        >
          <Heart className="size-3.5" />
          Favorites
        </button>
      ) : null}
    </div>
  );
}

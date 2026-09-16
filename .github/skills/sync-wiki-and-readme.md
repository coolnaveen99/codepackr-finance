# Skill: Sync Wiki & README (CodePackr Finance)

## Purpose
Keep the GitHub Wiki, `README.md`, and `docs/` documentation in lockstep with the live calculator suite at [finance.codepackr.com](https://finance.codepackr.com). This skill is the single source of truth for documentation and wiki SOP.

## When to Use
- After adding, renaming, or removing a financial calculator
- After editing any file under `docs/`
- After changing tool metadata in `src/data/tools.ts`
- When the parent hub (codepackr.com) branding or cross-links change
- On any request to "update docs", "sync wiki", or "refresh README"

## Canonical Files
| File | Role |
|------|------|
| `scripts/sync-wiki.mjs` | Wiki generation engine (Home, _Sidebar, _Footer, tool stubs, docs flatten) |
| `.github/workflows/sync-wiki.yml` | CI: push to `main` on `docs/**` or script change → sync wiki repo |
| `README.md` | Public-facing catalog with badges, categorized links, quickstart, architecture diagram |
| `docs/*.md` | Long-form guides (Team Guide, Admin Architecture, Sprint Plan, …) |
| `package.json` → `sync:wiki` | Local command: `npm run sync:wiki` |

## SOP — Adding or Changing a Calculator

1. **Register the tool** in `src/data/tools.ts` (id, name, category, description, keywords, icon).
2. **Update the wiki engine registry** inside `scripts/sync-wiki.mjs` (`TOOLS` array) so Home.md and _Sidebar.md stay accurate.
3. **Update README.md** categorized directory with the live URL `https://finance.codepackr.com/<id>`.
4. **Run locally**:
   ```bash
   npm run sync:wiki    # writes ./wiki for inspection
   npm run lint
   npm run build
   ```
5. **Commit** `docs/`, `scripts/sync-wiki.mjs`, `README.md`, and any tool source. On push to `main`, `sync-wiki.yml` publishes to the GitHub Wiki automatically.

## SOP — Editing Long-Form Docs

1. Edit or add Markdown under `docs/`.
2. Ensure internal relative links use filenames that `sync-wiki.mjs` can rewrite (or absolute GitHub/wiki links).
3. Run `npm run sync:wiki` and verify `wiki/Home.md`, `wiki/_Sidebar.md`, and flattened pages.
4. Push; workflow handles the rest.

## Wiki Page Contract

- **Home.md** — Overview, parent/live links, primers, full categorized calculator directory with production URLs.
- **_Sidebar.md** — Collapsible `<details open><summary>` navigation by financial category (Loans & Mortgages, Investment & Wealth, Tax & Salary, Retirement & Planning, etc.).
- **_Footer.md** — Standard footer: live app, wiki home, parent hub, GitHub.
- **Tool stubs** — One page per calculator linking to the live production URL; privacy notice.
- **Flattened docs** — `TEAM_GUIDE.md` → `team-guide.md`, etc., with rewritten internal links.

## Vercel & CI Cost Control

- `vercel.json` `ignoreCommand` excludes `docs/`, `.github/`, `*.md`, `*.csv`, `LICENSE`, and dotfiles so pure documentation commits do not trigger production builds.
- `.github/workflows/ci.yml` already uses `paths-ignore` for `**.md`, `docs/**`, and CSV so PR CI stays lean.

## Anti-Patterns

- Do **not** hand-edit the GitHub Wiki UI for lasting content — the next sync overwrites it. Edit `docs/` or `scripts/sync-wiki.mjs` instead.
- Do **not** hardcode currency symbols or server-side math in any documentation examples; reinforce the 100% client-side guarantee.
- Do **not** omit updating both `TOOLS` in `sync-wiki.mjs` and the README directory when adding a tool.

## Verification Checklist

- [ ] `npm run sync:wiki` completes with 0 errors
- [ ] `wiki/Home.md`, `wiki/_Sidebar.md`, `wiki/_Footer.md` exist
- [ ] New/changed tool appears in Home and Sidebar under the correct category
- [ ] README badges and categorized links point to live production URLs
- [ ] `npm run lint` and `npm run build` pass

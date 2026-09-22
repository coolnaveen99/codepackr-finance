# CodePackr Finance — Project Instructions

These rules complement `.github/copilot-instructions.md`, the role-specific agents/prompts, and existing skills. Do not duplicate or override those documents unless a newer project decision is explicitly recorded.

## Core
- Finance is a 100% client-side personal-finance calculator suite.
- Never transmit user financial inputs, balances, income, loan data, or projections to a server or third-party API.
- Use `CurrencyContext` for currency formatting; do not hardcode currency symbols.
- Preserve the existing emerald Finance design system, responsive UI, accessibility, and chart architecture.
- Reuse existing calculators, utilities, chart components, metadata generators, and scripts before adding new implementations.

## Financial correctness
- Keep formulas explicit and deterministic.
- Document assumptions, compounding/frequency conventions, tax-year or jurisdiction assumptions, and rounding behavior where relevant.
- Do not present calculator outputs as personalized financial advice.
- Add regression tests for calculation changes and edge cases.

## SEO / content / promotion
- Keep tool registry, routing, metadata, sitemap, README, and promotion data synchronized when a tool changes.
- Reuse the existing SEO and IndexNow automation; do not create parallel implementations.
- Preserve existing `.github/skills/add-new-tool.md`, `hero-floating-slides.md`, and `sync-wiki-and-readme.md` workflows.

## Build discipline
- Source/application changes: run `npm run lint`, `npm run test`, and `npm run build`.
- Documentation-only, README-only, and `.github/**`-only changes do not require a production build.
- `vercel.json` and CI are configured to ignore documentation/config-only changes so those edits do not consume unnecessary production-build runs.

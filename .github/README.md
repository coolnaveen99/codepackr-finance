# Codepackr Finance — AI Agents, Prompts & Skills

This folder defines how AI assistants and contributors must work on **Codepackr Finance** (`finance.codepackr.com`).

---

## Quick Start

1. Read project rules: [`../AGENTS.md`](../AGENTS.md) and [`copilot-instructions.md`](copilot-instructions.md)
2. Follow the tool SOP: [`skills/add-new-tool.md`](skills/add-new-tool.md)
3. For wiki/README sync: [`skills/sync-wiki-and-readme.md`](skills/sync-wiki-and-readme.md)

---

## Agents (Roles)

| Agent | File | Use when |
|-------|------|----------|
| **Core Engineer** | [`agents/core-engineer.yml`](agents/core-engineer.yml) | Calculators, algorithms, TypeScript, privacy, charts |
| **UI Architect** | [`agents/ui-architect.yml`](agents/ui-architect.yml) | Layout, design system, hero cards, accessibility |
| **SEO Specialist** | [`agents/seo-specialist.yml`](agents/seo-specialist.yml) | Metadata, sitemaps, IndexNow, README / wiki listings |

Each agent references its detailed prompt in `prompts/`.

---

## Prompts

| Prompt | File |
|--------|------|
| Core Engineer | [`prompts/core-engineer.prompt.md`](prompts/core-engineer.prompt.md) |
| UI Architect | [`prompts/ui-architect.prompt.md`](prompts/ui-architect.prompt.md) |
| SEO Specialist | [`prompts/seo-specialist.prompt.md`](prompts/seo-specialist.prompt.md) |

---

## Skills (SOPs)

| Skill | File | Purpose |
|-------|------|---------|
| **Add New Tool** | [`skills/add-new-tool.md`](skills/add-new-tool.md) | Mandatory step-by-step for every new calculator |
| **Hero Floating Slides** | [`skills/hero-floating-slides.md`](skills/hero-floating-slides.md) | Preview card rules for the landing hero |
| **Sync Wiki & README** | [`skills/sync-wiki-and-readme.md`](skills/sync-wiki-and-readme.md) | Keep docs and wiki in sync |

---

## Global Rules

- [`copilot-instructions.md`](copilot-instructions.md) — Golden rules
- Brand accent: **Emerald `#10b981`**
- Privacy: 100% client-side only. Never transmit financial inputs off-device.
- Always use `useCurrency()` — never hardcode currency symbols.

Never skip the add-new-tool SOP. Never break privacy guarantees.

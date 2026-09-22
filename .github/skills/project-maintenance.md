# Finance Project Maintenance Skill

Use this skill for cross-cutting CodePackr Finance changes.

## Workflow
1. Read `.github/copilot-instructions.md` and the applicable role-specific agent/prompt first.
2. Search existing `.github/skills/` before creating a new SOP.
3. Reuse existing calculation utilities, chart components, CurrencyContext, SEO scripts, and promotion generators.
4. For financial formula changes, document assumptions and add regression tests.
5. Keep all user financial data client-side.
6. Keep tool registry, route, metadata, sitemap, README, and promotion data synchronized where applicable.
7. Do not create duplicate SEO, IndexNow, wiki-sync, or chart systems.
8. Do not run a production build for documentation-only, README-only, or `.github/**`-only changes.
9. For source changes, run lint, tests, and production build.

## Completion checklist
- [ ] Existing architecture and skills reused
- [ ] No duplicate implementation introduced
- [ ] Financial assumptions/formulas documented
- [ ] Privacy preserved
- [ ] SEO/content synchronization completed when needed
- [ ] Source changes pass lint/tests/build
- [ ] Documentation-only changes avoid unnecessary builds

# Role & Identity
You are building and maintaining **Codepackr Finance** (`finance.codepackr.com`) — a 100% privacy-first, client-side personal finance, investment, and retirement planning suite. All calculations, chart projections, and PDF reports execute strictly in the user's browser; zero financial or personal data ever leaves the device.

---

## 🚀 Core Directives (Zero-Friction Automation)

### 1. Automated SEO & Sitemap Indexing Directive
- **Auto-Generate Sitemap**: Always maintain and regenerate the sitemap (`scripts/build-sitemap.mjs`) whenever tools, routes, or pages are added or modified.
- **Auto-Submit to Search Engines**: **NEVER ask the user for confirmation** to submit or ping search engine indexes. Always run `node scripts/indexnow.mjs` automatically as part of the build pipeline (`npm run build`).
- **Zero-Friction Indexing**: Keep `public/sitemap.xml`, `dist/sitemap.xml`, and `src/data/sitemapUrls.json` synchronized across all live URLs without manual user prompts.

### 2. Automated Social Media Promotions Directive
- **Auto-Update Social Media CSV**: Whenever new tools, routes, features, or pages are added or modified, always regenerate the social media promotions dataset (`public/codepackr_social_media_promotions.csv`) by running `node scripts/generate-social-promotions.mjs`.
- **Zero-Friction Promotions Sync**: **NEVER ask the user for confirmation** to update social media copy or promotional files. Keep `public/codepackr_social_media_promotions.csv` synchronized with all live tools, including optimized copy for LinkedIn, X (Twitter), hashtags, character counts, and image prompts.

### 3. GitHub Wiki & README Synchronization Directive
- **Source of truth**: Edit `docs/` and the tool registry inside `scripts/sync-wiki.mjs`. Never treat the GitHub Wiki UI as canonical.
- **Always sync**: After adding/renaming/removing calculators or changing docs, update:
  1. `scripts/sync-wiki.mjs` (`TOOLS` array) so Home.md / `_Sidebar.md` stay accurate
  2. `README.md` categorized calculator directory with live production URLs
  3. Run `npm run sync:wiki` locally to regenerate `./wiki` for inspection
- **Automation**: `.github/workflows/sync-wiki.yml` publishes to `codepackr-finance.wiki` on every push to `main` that touches `docs/**` or `scripts/sync-wiki.mjs`.
- **Skill**: Follow `.github/skills/sync-wiki-and-readme.md` for the full SOP.
- **NEVER ask the user for confirmation** to regenerate wiki pages or README directory listings when tools or docs change.

---

## 1. Ecosystem Alignment & Branding
1. **Brand Identity**:
   - Header title: **Codepackr Finance** (with an emerald/teal accent: `#10b981`).
   - Tagline: *"100% Client-Side Financial Calculators, Wealth Projections & Retirement Modeling"*.
   - Top-navigation backlink pill: `← Codepackr Dev Suite` linking to `https://www.codepackr.com` (`target="_blank" rel="noopener noreferrer"`).
2. **Design Language & Theme**:
   - Match the Codepackr design system: sleek mathematical cards (`rounded-2xl` for containers, `rounded-xl` for interactive elements), balanced padding, and high-contrast typography.
   - Support both **Light Mode** and **Dark Mode** with smooth transitions.
   - Theme variables: Emerald/Teal brand color (`#10b981`), high-contrast ink, and subtle border dividers.
3. **Cross-Domain Sync**:
   - Support global currency selection (`USD $`, `EUR €`, `GBP £`, `INR ₹`, `CAD $`, `AUD $`, `JPY ¥`, `AED د.إ`, `SGD $`, etc.).
   - Read/write the currency preference and theme preference to local storage and support URL parameters (e.g., `?currency=USD&theme=dark`) so incoming visitors from `codepackr.com` keep their preferences.

---

## 📋 New Tool Integration Checklist

When adding a new tool to Codepackr Finance, complete this sequential checklist:

1. [ ] **Define Tool in `src/data/tools.ts`**: Add unique `id`, `name`, `category`, `description`, `keywords`, and `icon`.
2. [ ] **Implement Component**: Create the tool component in `src/components/tools/`.
3. [ ] **Wire into Category View & Dashboard**: Update `src/components/HomeDashboard.tsx` or category views to render the component when active.
4. [ ] **Add Ad to Hero Floating Stack**: Add tool entry with a visual chart to `adPool` in `src/components/HeroPreviewCards.tsx`.
5. [ ] **Register Routing in `src/lib/urls.ts`**: Add slug to `SLUG_TO_TOOL_ID` and `TOOL_ID_TO_CANONICAL_SLUG`.
6. [ ] **Add Metadata in `scripts/generate-metadata.mjs`**: Include tool name, description, category, and features for prerendering.
7. [ ] **Update Wiki Engine & README**: Add the tool to the `TOOLS` array in `scripts/sync-wiki.mjs` and to the categorized directory in `README.md` with the live URL `https://finance.codepackr.com/<id>`.
8. [ ] **Run Full Build & Sync**: Run `npm run build` (regenerates sitemap, metadata, social CSV, prerender, IndexNow) and `npm run sync:wiki` (regenerates GitHub Wiki pages).
9. [ ] **Verify**: Ensure `npm run lint` and `npm run build` pass with zero errors.

---

## Privacy & Architecture

- **DO keep everything 100% client-side**. Zero user data leaves the client.
- **DON'T transmit user input to external servers** or store financial input in remote databases.
- **DON'T hardcode `$` or any currency symbol** — always use `useCurrency()` / `formatAmount()`.
- **DON'T break existing URL paths or remove legacy slugs**.

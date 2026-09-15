# CodePackr Finance — GitHub Instructions & Architecture Guide

Welcome to **CodePackr Finance** (`finance.codepackr.com`) — an enterprise-grade, 100% privacy-first, client-side personal finance, investment, and retirement planning suite.

All calculations, chart projections, amortization schedules, and PDF reports execute strictly in the user's browser. Zero personal or financial data ever leaves the client device.

---

## 🚀 Golden Rules & Core Directives

### 1. 100% Client-Side Computation & Ephemeral Privacy
- Never send calculator inputs, income figures, net worth balances, or loan amounts to remote servers, databases, or third-party APIs.
- All formatting, validating, parsing, calculating, chart rendering, and PDF generation must execute in local browser memory.

### 2. Global Currency Context
- Never hardcode currency symbols (`$`, `₹`, `€`, `£`).
- Always consume `const { formatAmount, currency } = useCurrency();` from `CurrencyContext` (`src/lib/CurrencyContext.tsx`).
- Support both international formats (e.g., `$100,000`) and Indian numbering conventions (e.g., `₹1.5 Lakh`, `₹2.4 Crore`).

### 3. Automated SEO & Promotions Directives (Zero Friction)
- **Automatic Sitemaps**: Maintain and regenerate `scripts/build-sitemap.mjs` on every build pipeline.
- **Automatic Social Media Promotions Dataset**: Keep `public/codepackr_social_media_promotions.csv` updated via `node scripts/generate-social-promotions.mjs`.
- **IndexNow Pings**: Automatically dispatch search engine notifications via `scripts/indexnow.mjs` during `npm run build`. Never prompt the user for confirmation.

---

## 🎨 Hero Floating Slides & Interactive Preview Cards (`HeroPreviewCards.tsx`)

The landing page hero showcases a live, dynamic stack of preview cards on desktop viewports (`lg:` ≥ 1024px, hidden on mobile/tablet).

### 1. Organic Floating Movement Physics
- Cards **must always** maintain continuous, desynchronized vertical floating animations defined in `src/index.css`:
  - `animate-float-card-1` (5.4s cycle)
  - `animate-float-card-2` (4.8s cycle)
  - `animate-float-card-3` (6.2s cycle)
- Asymmetrical margin offsets create depth: `ml-4` (Slot 0), `mr-2` (Slot 1), `ml-6` (Slot 2).
- **Hover Behavior**: Hovering over any card pauses floating movement (`animation-play-state: paused`) and the auto-rotation timer, gently scales the card (`hover:scale-[1.035]`), elevates its shadow, and highlights the emerald border.
- **Accessibility**: Automatically disables animations and timer rotations when `prefers-reduced-motion: reduce` is detected.

### 2. Mandatory Graphical Chart Requirement
- **Plain text cards are strictly forbidden.** Every tool in the 20+ ad pool must display an authentic, animated mini visual chart:
  - **MiniSparkline**: Smooth SVG compounding curves, payoff trajectories, or inflation erosion curves with `animate-draw-line` and gradient fills.
  - **MiniSegmentedBar**: Multi-segment proportional breakdown bars with color-coded legend indicators (e.g., Principal vs. Interest, Take-Home vs. Deductions).
  - **MiniProgressRing**: Circular SVG radial dials with animated `stroke-dashoffset` counters (e.g., FIRE readiness %, Emergency runway %, DTI ratio %).
  - **Dual Comparison Bars**: Comparative horizontal meters (e.g., New vs. Old Tax Regimes, Rent vs. Buy equity).

### 3. Dynamic Rotating Pool
- Rotates cards using staggered timers (6.5s base interval with 2.2s stagger offsets between slots).
- Anti-collision logic ensures no duplicate cards appear across visible slots simultaneously.
- Smooth 180ms cross-fade transition on card swap.
- For complete implementation specifications, refer to `.github/skills/hero-floating-slides.md`.

---

## 📊 Standard Interactive Financial Charts (`FinancialInteractiveChart.tsx`)

All dedicated tool pages requiring visual growth or schedule projections must use `FinancialInteractiveChart`:
- **Default View**: Investor.gov-style Line Chart with interactive crosshairs, data markers, dual comparison series, and dynamic currency formatting.
- **Interactive Switcher**: Built-in dropdown selector supporting:
  1. Line Chart (Default)
  2. Area Chart (Cumulative compounding curve)
  3. Circular Donut Chart (Proportional breakdown)
  4. Bar Chart (Annual progression)
- Includes one-click CSV export, legend toggle, and responsive scaling.

---

## 🛠️ Adding a New Tool Workflow

When introducing a new financial tool to the platform:
1. Define tool in `src/data/tools.ts`.
2. Implement component in `src/components/tools/`.
3. Wire into category view and routing (`src/lib/urls.ts`).
4. Add metadata in `scripts/generate-metadata.mjs`.
5. Add a corresponding visual preview card in `src/components/HeroPreviewCards.tsx` (with mini chart).
6. Run `npm test`, `npm run lint`, and `npm run build`.


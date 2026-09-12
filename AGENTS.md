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

## 2. Core Financial Toolset & Calculator Suite

### A. Retirement & Financial Independence (FIRE) Planner
- **Inputs**: Current age, planned retirement age, life expectancy, current monthly expenses, expected inflation rate, expected pre-retirement investment return, post-retirement safe withdrawal / conservative return rate, current accumulated savings, and expected monthly contribution.
- **Outputs & Visualizations**:
  - Target retirement corpus required (adjusted for compounding inflation).
  - Surplus or deficit gap at retirement age.
  - Interactive year-by-year accumulation and decumulation area chart (glidepath to age 90+).
  - Actionable recommendations: *"Increase monthly savings by $X"* or *"Delay retirement by Y months"*.
  - Clean client-side PDF export of the financial plan.

### B. Loan, EMI & Mortgage Calculator with Prepayment Modeling
- **Inputs**: Principal loan amount, annual interest rate, tenure (years or months), and optional recurring or lump-sum prepayments (e.g. extra $200/month or $5,000 yearly).
- **Outputs**:
  - Monthly EMI amount, total interest payable, and total cost of loan.
  - Prepayment savings counter: *"By paying $200 extra/month, you save $34,200 in interest and pay off 4.5 years earlier"*.
  - Full collapsible monthly and annual amortization schedule with CSV export.
  - Breakdown donut chart: Principal vs. Total Interest.

### C. SIP (Systematic Investment Plan) & Mutual Fund Return Calculator
- **Inputs**: Monthly investment amount, expected annual return rate (CAGR), investment horizon (years), and optional step-up percentage (e.g. 5% or 10% annual increase in SIP).
- **Outputs**:
  - Total invested amount, estimated wealth gained, and total future maturity corpus.
  - Visual compounding curve chart highlighting exponential growth in later years.
  - Inflation-adjusted purchasing power view (future corpus in today's money value).

### D. Lump-Sum & Compound Interest Investment Calculator
- **Inputs**: Initial deposit, recurring contributions (monthly/quarterly/yearly), compounding frequency (daily, monthly, quarterly, annually), interest rate, and tenure.
- **Outputs**:
  - Final balance, total contributions, total interest accrued, and Effective Annual Rate (APY/EAR).
  - Comparison toggle: Simple Interest vs. Compound Interest visual comparison.

### E. Take-Home Salary & Net Pay Estimator
- **Inputs**: Gross annual salary, bonus/commissions, country/tax bracket mode, and deduction allowances.
- **Outputs**:
  - Bi-weekly, monthly, and annual take-home pay breakdown.
  - Clear itemized tax and statutory deductions breakdown bar.

### F. Inflation & Purchasing Power Depreciation Calculator
- **Inputs**: Initial amount, annual inflation rate, and number of years into the future or past.
- **Outputs**:
  - Future purchasing power equivalent (*"$100,000 today will feel like $45,638 in 20 years"*).
  - Historical comparison reverse calculation.

---

## 3. SEO & Technical Directives
1. **Zero-Friction Sitemaps & Indexing**:
   - Ensure automated sitemap script (`scripts/build-sitemap.mjs`) generates `public/sitemap.xml` with canonical URLs pointing to `https://finance.codepackr.com/<slug>`.
   - Implement `IndexNow` auto-submission (`scripts/indexnow.mjs`) inside the build pipeline.
2. **Rich Structured Data (JSON-LD)**:
   - Provide `SoftwareApplication` and `FinancialProduct` schema for each calculator.
   - Include FAQ schema (`FAQPage`) under each calculator addressing common financial questions (e.g., *"How is EMI calculated?"*, *"What is a safe withdrawal rate for retirement?"*).
3. **No External Telemetry on User Inputs**:
   - Zero telemetry, zero analytics tracking on user inputs (income, savings, loan balances, or net worth numbers). State clearly on every page: *"🔒 100% Private — Calculations occur locally in your browser. No financial data is ever stored or transmitted."*
4. **Export & Sharing Conveniences**:
   - One-click **Copy Summary** for easy pasting into notes or spreadsheets.
   - One-click **Download CSV Amortization Schedule**.
   - **Download PDF Summary Report**.
   - URL state sharing (generate shareable query params without storing data on servers).

---

## 4. Strategic Enhancements & Scenarios
1. **Pre-configured Presets & Scenarios**:
   - Add preset quick buttons for common life stages:
     - *"College Grad / Starter Portfolio"* ($250/mo SIP, 30-year horizon)
     - *"Mid-Career Home Buyer"* ($450,000 mortgage at 6.5%, 30 years)
     - *"FIRE Pursuer / Early Retirement"* (Aggressive 50% savings rate, 15-year horizon)
2. **Visual Comparisons**:
   - Provide A/B Scenario Comparison toggles (e.g., *"What if I invest 10% more each year?"* or *"What if my interest rate drops by 0.5%?"*).
3. **Cloudflare / Nginx 301 Redirects (From main domain)**:
   - Forwarding rules to pass search ranking from `codepackr.com` to `finance.codepackr.com`:
     - `codepackr.com/loan-calculator*` ➡️ 301 ➡️ `https://finance.codepackr.com/loan-calculator`
     - `codepackr.com/sip-calculator*` ➡️ 301 ➡️ `https://finance.codepackr.com/sip-calculator`
     - `codepackr.com/retirement-calculator*` ➡️ 301 ➡️ `https://finance.codepackr.com/retirement-calculator`
     - `codepackr.com/investment-calculator*` ➡️ 301 ➡️ `https://finance.codepackr.com/investment-calculator`

---

## ✅ DO's (Best Practices & Architecture)

### Architecture & Privacy
- **DO keep everything 100% client-side**: All formatting, validating, parsing, calculating, chart rendering, and PDF generation must execute directly in the user's browser. Zero user data leaves the client.
- **DO preserve backward-compatible routing**: When adding or updating tools, update `src/lib/urls.ts`:
  - Register canonical slugs in `TOOL_ID_TO_CANONICAL_SLUG` and `SLUG_TO_TOOL_ID`.
  - Maintain legacy aliases so previously indexed search engine URLs never 404.
  - Register category hub routes in `CATEGORY_SLUG_MAP` (`/loans`, `/investments`, `/tax`, `/retirement`, etc.).

### Global Currency System
- **DO use the centralized CurrencyContext (`useCurrency`)**:
  - Always use `const { formatAmount, currency } = useCurrency();` for rendering financial figures, loan calculations, gratuity calculations, and summaries.
  - Respect the user's selected global currency (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`, `JPY`, etc.) everywhere financial data is displayed.
  - Provide quick contextual currency selection in financial views.

### UI, Design & Icons
- **DO adhere to the Codepackr Finance theme palette**:
  - Use CSS theme variables: `var(--bg)`, `var(--surface)`, `var(--ink)`, `var(--muted)`, `var(--brand)`, `var(--line)`.
  - Ensure perfect contrast in both Light and Dark modes.
  - Use mathematical border radii: outer container `rounded-2xl` (16px), inner inputs/buttons `rounded-xl` (12px).
- **DO import all standard icons from `lucide-react`**:
  - For social and brand icons, use `src/components/BrandIcons.tsx` (e.g. `GithubIcon`, `XTwitterIcon`, `LinkedinIcon`, `YoutubeIcon`).
- **DO include user conveniences**:
  - One-click "Copy Summary" with checkmark feedback.
  - Sample / Preset scenario load buttons.
  - Reset / Clear controls.
  - Export CSV and Download PDF buttons.

---

## ❌ DONT's (Anti-Patterns & Restrictions)

### Privacy & Data Handling
- **DON'T transmit user input to external servers**: NEVER send financial data, calculator inputs, or personal figures to remote backends.
- **DON'T store user financial input in remote databases**: No remote logging, no Google Analytics tracking of user monetary amounts or personal scenarios.

### Currency & Hardcoding
- **DON'T hardcode `$` or any currency symbol**:
  - ❌ Incorrect: `<span>${monthlyPayment.toFixed(2)}</span>`
  - ✅ Correct: `<span>{formatAmount(monthlyPayment)}</span>`
- **DON'T assume USD is the only currency**: Users worldwide rely on Codepackr Finance; always support dynamic currency formatting via `CurrencyContext`.

### Routing & URLs
- **DON'T break existing URL paths or remove legacy slugs**: Existing search engine entries must continue to resolve seamlessly to their respective tools.
- **DON'T create deep nested route redirects that fail static hosting**: Keep all URLs clean top-level slugs matching `dist/<slug>.html` generated by `scripts/prerender.mjs`.

### Automation & Prompts
- **DON'T ask the user for permission to update SEO, sitemaps, or indexing**: Sitemaps, social promotion files, and IndexNow submissions must happen automatically on every relevant change.
- **DON'T forget to run `node scripts/generate-social-promotions.mjs`** when new tools or features are introduced.

---

## 📋 New Tool Integration Checklist

When adding a new tool to Codepackr Finance, complete this sequential checklist:

1. [ ] **Define Tool in `src/data/tools.ts`**: Add unique `id`, `name`, `category`, `description`, `keywords`, and `icon`.
2. [ ] **Implement Component**: Create the tool component in `src/components/tools/`.
3. [ ] **Wire into Category View & Dashboard**: Update `src/components/HomeDashboard.tsx` or category views to render the component when active.
4. [ ] **Register Routing in `src/lib/urls.ts`**: Add slug to `SLUG_TO_TOOL_ID` and `TOOL_ID_TO_CANONICAL_SLUG`.
5. [ ] **Add Metadata in `scripts/generate-metadata.mjs`**: Include tool name, description, category, and features for prerendering.
6. [ ] **Run Full Build & Sync**: Run `npm run build` (which automatically regenerates `sitemap.xml`, `toolMetadata.json`, `codepackr_social_media_promotions.csv`, prerenders HTML, and dispatches IndexNow pings).
7. [ ] **Verify with `lint_applet` and `compile_applet`**: Ensure zero type errors and a clean build.

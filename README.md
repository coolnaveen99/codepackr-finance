# CodePackr Finance

[![Live App](https://img.shields.io/badge/Live%20App-finance.codepackr.com-10b981?style=for-the-badge&logo=vercel)](https://finance.codepackr.com)
[![Parent Hub](https://img.shields.io/badge/Parent%20Hub-codepackr.com-0ea5e9?style=for-the-badge&logo=github)](https://www.codepackr.com)
[![GitHub Wiki](https://img.shields.io/badge/Docs-GitHub%20Wiki-181717?style=for-the-badge&logo=github)](https://github.com/coolnaveen99/codepackr-finance/wiki)
[![Copyright](https://img.shields.io/badge/©%202026-All%20Rights%20Reserved-6b7280?style=for-the-badge)](https://finance.codepackr.com)

**CodePackr Finance** is a free collection of browser-based financial calculators for loans, mortgages, retirement, investing, tax, salary, and business finance.  
Live at **[finance.codepackr.com](https://finance.codepackr.com)**.

All calculators run **100% client-side**. Your financial inputs are never uploaded to any server.

---

## 📚 Documentation Hub

| Resource | Link |
|----------|------|
| **GitHub Wiki** (full docs + calculator directory) | [github.com/coolnaveen99/codepackr-finance/wiki](https://github.com/coolnaveen99/codepackr-finance/wiki) |
| **Team Guide** | [docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md) |
| **Parent Developer Suite** | [www.codepackr.com](https://www.codepackr.com) |

---

## 🛠️ Calculators Directory

### 💳 Loans & Mortgages
- [EMI Calculator](https://finance.codepackr.com/loan-calculator)
- [Loan Amortization Calculator](https://finance.codepackr.com/loan-amortization-calculator)
- [Loan Prepayment Calculator](https://finance.codepackr.com/loan-prepayment-calculator)
- [Debt-to-Income (DTI) Ratio Calculator](https://finance.codepackr.com/debt-to-income-calculator)
- [Simple Interest Calculator](https://finance.codepackr.com/simple-interest-calculator)
- [Mortgage Affordability Calculator](https://finance.codepackr.com/mortgage-affordability-calculator)
- [Credit Card Payoff Calculator](https://finance.codepackr.com/credit-card-payoff-calculator)

### 📈 Investment & Wealth
- [SIP Calculator](https://finance.codepackr.com/sip-calculator)
- [Lumpsum Investment Calculator](https://finance.codepackr.com/lumpsum-calculator)
- [CAGR Calculator](https://finance.codepackr.com/cagr-calculator)
- [ROI Calculator](https://finance.codepackr.com/roi-calculator)
- [Compound Interest Calculator](https://finance.codepackr.com/investment-calculator)
- [Rule of 72 Calculator](https://finance.codepackr.com/rule-of-72-calculator)
- [Dividend Yield & DRIP Calculator](https://finance.codepackr.com/dividend-yield-calculator)

### 🏖️ Retirement & Planning
- [Retirement Corpus Calculator](https://finance.codepackr.com/financial-planner)
- [Inflation & Purchasing Power Calculator](https://finance.codepackr.com/inflation-calculator)
- [Future Value Calculator (TVM)](https://finance.codepackr.com/future-value-calculator)
- [Savings Goal Projector](https://finance.codepackr.com/savings-goal-calculator)
- [FIRE Calculator](https://finance.codepackr.com/fire-calculator)
- [EPF Calculator](https://finance.codepackr.com/epf-calculator)
- [Annuity Calculator](https://finance.codepackr.com/annuity-calculator)

### 💼 Tax & Salary
- [CTC to In-Hand Salary Calculator](https://finance.codepackr.com/ctc-to-in-hand-calculator)
- [Salary Hike & Increment Calculator](https://finance.codepackr.com/salary-hike-calculator)
- [Gratuity Calculator](https://finance.codepackr.com/gratuity-calculator)
- [HRA Exemption Calculator](https://finance.codepackr.com/hra-calculator)
- [Income Tax Calculator](https://finance.codepackr.com/income-tax-calculator)
- [GST Calculator](https://finance.codepackr.com/gst-calculator)
- [Capital Gains Tax Calculator](https://finance.codepackr.com/capital-gains-tax-calculator)

### 🏠 Personal Finance
- [Emergency Fund Calculator](https://finance.codepackr.com/emergency-fund-calculator)
- [Net Worth Calculator](https://finance.codepackr.com/net-worth-calculator)
- [Rent vs. Buy Calculator](https://finance.codepackr.com/rent-vs-buy-calculator)

### 🏢 Business Finance
- [NPV Calculator](https://finance.codepackr.com/npv-calculator)
- [IRR Calculator](https://finance.codepackr.com/irr-calculator)
- [Break-Even Calculator](https://finance.codepackr.com/break-even-calculator)
- [Business Valuation Calculator](https://finance.codepackr.com/business-valuation-calculator)
- [DCF Valuation Calculator](https://finance.codepackr.com/dcf-calculator)
- [WACC Calculator](https://finance.codepackr.com/wacc-calculator)
- [Startup Valuation Calculator](https://finance.codepackr.com/startup-valuation-calculator)
- [Burn Rate & Runway Calculator](https://finance.codepackr.com/burn-rate-calculator)

---

## ✨ Features

- **100% Client-Side Privacy** — Data stays in your browser; zero payload uploads or backend logging.
- **Fast Search & Keyboard Navigation** — `Ctrl/Cmd+K` for global tool search and `Ctrl/Cmd+Enter` to run a tool.
- **Theme Support** — Persistent light and dark modes.
- **Deep Linking** — Shareable tool URLs with optional `?input=` query parameter.
- **Offline Capable & Installable** — Full PWA support with service worker caching.
- **Responsive Layout** — Designed for mobile and desktop screens.
- **SEO & Social Sharing** — Pre-rendered semantic HTML, Open Graph tags, Twitter Cards, and per-tool JSON-LD Schema.
- **Instant Search Engine Indexing** — Automated IndexNow pings to Bing & Yandex on every deployment.
- **Google AdSense Ready** — Configured with official Auto-Ads, publisher meta verification, and live `ads.txt`.

---

## 🚀 Development Quickstart

**Prerequisites:** Node.js 18 or 20+, npm (or bun)

```bash
git clone https://github.com/coolnaveen99/codepackr-finance.git
cd codepackr-finance
npm install

npm run dev          # Local dev server → http://localhost:3000
npm run lint         # TypeScript typecheck
npm run build        # Production build + prerender + IndexNow
npm run sync:wiki    # Generate GitHub Wiki pages into ./wiki
```

---

## 🏗️ CI/CD & Wiki Automation

On push to `main` affecting `docs/**` or `scripts/sync-wiki.mjs`, `.github/workflows/sync-wiki.yml` checks out the wiki repo, runs `node scripts/sync-wiki.mjs wiki`, and commits Home.md, `_Sidebar.md`, `_Footer.md`, and tool pages.

Vercel `ignoreCommand` skips builds when only docs, markdown, CSV, or config change.

---

## 🤖 AI-as-Code

See [AGENTS.md](AGENTS.md) and `.github/skills/sync-wiki-and-readme.md` for the Wiki & README synchronization directive and new-tool checklist.

---

## ⚖️ Copyright & Terms

**© 2026 CodePackr Finance. All rights reserved.**

**100% client-side guarantee:** All calculations execute in the user's browser. No financial or personal data is transmitted to or stored on CodePackr servers.

Parent suite: [CodePackr](https://www.codepackr.com) · Source: [coolnaveen99/codepackr-finance](https://github.com/coolnaveen99/codepackr-finance)

#!/usr/bin/env node
/**
 * CodePackr Finance — GitHub Wiki Sync Engine
 * Transforms docs/ + live tool registry into flat GitHub Wiki pages.
 *
 * Usage:
 *   node scripts/sync-wiki.mjs          → writes to ./wiki
 *   node scripts/sync-wiki.mjs wiki     → writes to ./wiki (CI path)
 *
 * Wiki target: https://github.com/coolnaveen99/codepackr-finance.wiki.git
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const targetDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT_DIR, 'wiki');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`[CodePackr Finance Wiki Sync] Target directory: ${targetDir}`);

// Tool registry (mirrors src/data/tools.ts — keep in sync when tools change)
const TOOLS = [
  { id: 'loan-calculator', name: 'EMI Calculator', category: 'loans', description: 'Calculate monthly loan EMI, total interest, and comprehensive repayment timeline with extra prepayment scenarios.' },
  { id: 'loan-amortization-calculator', name: 'Loan Amortization Calculator', category: 'loans', description: 'Generate complete annual and monthly loan amortization ledgers with principal reduction and cumulative interest tracking.' },
  { id: 'loan-prepayment-calculator', name: 'Loan Prepayment Calculator', category: 'loans', description: 'Calculate interest savings and months shaved off your loan term through monthly or annual lump-sum prepayments.' },
  { id: 'debt-to-income-calculator', name: 'Debt-to-Income (DTI) Ratio Calculator', category: 'loans', description: 'Assess borrowing capacity, front-end vs back-end debt burden, and lending approval probability under CFPB guidelines.' },
  { id: 'simple-interest-calculator', name: 'Simple Interest Calculator', category: 'loans', description: 'Calculate simple (non-compounding) interest and maturity amount on a fixed principal with yearly amortized schedule.' },
  { id: 'mortgage-affordability-calculator', name: 'Mortgage Affordability Calculator', category: 'loans', description: 'Determine your maximum home purchasing budget based on gross income, existing debt obligations, and Fannie Mae DTI guidelines.' },
  { id: 'credit-card-payoff-calculator', name: 'Credit Card Payoff Calculator', category: 'loans', description: 'Calculate interest savings and months shaved off debt freedom by accelerating credit card payments beyond the minimum payment trap.' },
  { id: 'sip-calculator', name: 'SIP Calculator', category: 'investments', description: 'Calculate Systematic Investment Plan (SIP) returns, wealth accumulation, and annual step-up compounding.' },
  { id: 'lumpsum-calculator', name: 'Lumpsum Investment Calculator', category: 'investments', description: 'Compute compound growth, maturity wealth, and inflation-adjusted real purchasing power for one-time investments.' },
  { id: 'cagr-calculator', name: 'CAGR Calculator (Compound Annual Growth)', category: 'investments', description: 'Calculate Compound Annual Growth Rate, annualized geometric returns, capital multiples, and holding trajectories.' },
  { id: 'roi-calculator', name: 'ROI Calculator (Return on Investment)', category: 'investments', description: 'Calculate net return on investment, annualized holding period return, and capital multiples after fees.' },
  { id: 'investment-calculator', name: 'Compound Interest Calculator', category: 'investments', description: 'Calculate compound interest growth with periodic deposits, flexible compounding frequencies, and APY rates.' },
  { id: 'rule-of-72-calculator', name: 'Rule of 72 Calculator', category: 'investments', description: 'Calculate investment doubling time, inflation purchasing power halvings, and required compound interest rates using the Rule of 72.' },
  { id: 'dividend-yield-calculator', name: 'Dividend Yield & DRIP Calculator', category: 'investments', description: 'Calculate forward dividend yield, yield on cost (YOC), and multi-year DRIP compounding wealth projections.' },
  { id: 'financial-planner', name: 'Retirement Corpus Calculator', category: 'retirement', description: 'Analyze retirement readiness, projected vs required corpus, corpus sustainability, savings gap, and Monte Carlo scenarios.' },
  { id: 'inflation-calculator', name: 'Inflation & Purchasing Power Calculator', category: 'retirement', description: 'Project future living expenses, purchasing power erosion, and rule-of-72 price doubling timelines.' },
  { id: 'future-value-calculator', name: 'Future Value Calculator (TVM)', category: 'retirement', description: 'Project future worth of starting capital combined with recurring cash deposits under discrete compounding schedules.' },
  { id: 'savings-goal-calculator', name: 'Savings Goal Projector', category: 'retirement', description: 'Project required monthly savings across Savings Accounts, RDs, FDs, Liquid, Ultra-Short, and Arbitrage funds to reach your target financial milestone.' },
  { id: 'fire-calculator', name: 'FIRE Calculator (Financial Independence)', category: 'retirement', description: 'Compute Standard, Lean, Fat, and Coast FIRE targets, safe withdrawal rates (SWR), and timeline to early retirement.' },
  { id: 'epf-calculator', name: 'EPF Calculator (Provident Fund)', category: 'retirement', description: 'Project employee and employer EPF retirement corpus accumulation, EPFO interest compounding, and salary increment trajectories.' },
  { id: 'annuity-calculator', name: 'Annuity Calculator', category: 'retirement', description: 'Calculate immediate guaranteed monthly pension payouts or future accumulated value for ordinary annuities and annuities due.' },
  { id: 'ctc-to-in-hand-calculator', name: 'CTC to In-Hand Salary Calculator', category: 'salary', description: 'Convert annual Cost to Company (CTC) into monthly take-home salary, accounting for EPF, Gratuity, Professional Tax, and TDS.' },
  { id: 'salary-hike-calculator', name: 'Salary Hike & Increment Calculator', category: 'salary', description: 'Evaluate annual appraisal raises, job switch offer jumps, and inflation-adjusted real purchasing power gains.' },
  { id: 'gratuity-calculator', name: 'Gratuity Calculator', category: 'salary', description: 'Calculate statutory terminal separation gratuity, tenure rounding, and Section 10(10) tax exemptions.' },
  { id: 'hra-calculator', name: 'HRA Exemption Calculator', category: 'salary', description: 'Compute tax-exempt House Rent Allowance (HRA) under Section 10(13A) Rule 2A, compare metro vs non-metro limits, and estimate tax savings.' },
  { id: 'income-tax-calculator', name: 'Income Tax Calculator', category: 'tax', description: 'Estimate income tax liability under the New and Old Tax Regimes with standard deduction, 87A rebate, and slab breakdowns.' },
  { id: 'gst-calculator', name: 'GST Calculator', category: 'tax', description: 'Calculate GST inclusive and exclusive invoice amounts with statutory slab breakdowns and CGST/SGST/IGST splits.' },
  { id: 'capital-gains-tax-calculator', name: 'Capital Gains Tax Calculator', category: 'tax', description: 'Calculate Short-Term (STCG) and Long-Term (LTCG) capital gains taxes on equity, real estate, and debt under current tax rules.' },
  { id: 'emergency-fund-calculator', name: 'Emergency Fund Calculator', category: 'personal-finance', description: 'Determine your safety buffer based on essential monthly expenses, shortfall gaps, and time to full funding.' },
  { id: 'net-worth-calculator', name: 'Net Worth Calculator', category: 'personal-finance', description: 'Audit your balance sheet across liquid assets, investments, real estate, and liabilities with 100% client-side privacy.' },
  { id: 'rent-vs-buy-calculator', name: 'Rent vs. Buy Calculator', category: 'personal-finance', description: 'Compare 30-year long-term net wealth outcomes of purchasing a home vs. renting and investing down payment capital in equity markets.' },
  { id: 'npv-calculator', name: 'NPV Calculator', category: 'business-finance', description: 'Calculate Net Present Value (NPV), Profitability Index (PI), and discounted cash flow paybacks for capital investments.' },
  { id: 'irr-calculator', name: 'IRR Calculator', category: 'business-finance', description: 'Compute Internal Rate of Return (IRR), hurdle rate spreads, and NPV sensitivity curves for multi-year cash flows.' },
  { id: 'break-even-calculator', name: 'Break-Even Calculator', category: 'business-finance', description: 'Determine unit and revenue break-even thresholds, contribution margin ratios, and margin of safety buffers.' },
  { id: 'business-valuation-calculator', name: 'Business Valuation Calculator', category: 'business-finance', description: 'Estimate enterprise and equity fair market values across conservative, base, and optimistic multiples for Revenue, EBITDA, and SDE.' },
  { id: 'dcf-calculator', name: 'DCF Valuation Calculator', category: 'business-finance', description: 'Model discounted cash flows (DCF), forecast free cash flows, terminal values via Gordon Growth and exit multiples, and equity value per share.' },
  { id: 'wacc-calculator', name: 'WACC Calculator (Cost of Capital)', category: 'business-finance', description: 'Calculate Weighted Average Cost of Capital (WACC), CAPM cost of equity, after-tax cost of debt, and interest tax shield benefits.' },
  { id: 'startup-valuation-calculator', name: 'Startup Valuation Calculator', category: 'business-finance', description: 'Triangulate pre-revenue and seed-stage startup valuations using Dave Berkus, Payne Scorecard, and Venture Capital (VC) methods.' },
  { id: 'burn-rate-calculator', name: 'Burn Rate & Runway Calculator', category: 'business-finance', description: 'Calculate gross burn, net burn, cash runway in months, zero cash dates, and Paul Graham Default Alive status for startups.' },
];

const CATEGORY_ORDER = ['loans', 'investments', 'retirement', 'salary', 'tax', 'personal-finance', 'business-finance'];
const CATEGORY_TITLES = {
  loans: '💳 Loans & Mortgages',
  investments: '📈 Investment & Wealth',
  retirement: '🏖️ Retirement & Planning',
  salary: '💼 Tax & Salary',
  tax: '🧾 Tax Planning',
  'personal-finance': '🏠 Personal Finance',
  'business-finance': '🏢 Business Finance',
};

const urlMap = new Map();
urlMap.set('TEAM_GUIDE.md', 'team-guide.md');
urlMap.set('ADMIN_PORTAL_ARCHITECTURE.md', 'admin-portal-architecture.md');
urlMap.set('SPRINT_PLAN_MISSING_TOOLS.md', 'sprint-plan-missing-tools.md');

const categoryTools = {};
for (const cat of CATEGORY_ORDER) categoryTools[cat] = [];
for (const t of TOOLS) {
  if (!categoryTools[t.category]) categoryTools[t.category] = [];
  categoryTools[t.category].push(t);
  urlMap.set(`tools/${t.id}.md`, `${t.id}.md`);
}

function rewriteLinks(content) {
  let updated = content;
  for (const [sourceRel, targetWiki] of urlMap.entries()) {
    const wikiSlug = targetWiki.replace(/\.md$/, '');
    const sourceBase = path.basename(sourceRel);
    const patterns = [
      new RegExp(`\\((?:\\.\\/|\\.\\.\\/)?${sourceRel.replace(/\./g, '\\.')}\\)`, 'g'),
      new RegExp(`\\((?:\\.\\/|\\.\\.\\/)?${sourceBase.replace(/\./g, '\\.')}\\)`, 'g'),
    ];
    for (const pat of patterns) {
      updated = updated.replace(pat, `(${wikiSlug})`);
    }
  }
  return updated;
}

let homeContent = `> **Welcome to the official CodePackr Finance Knowledge Base & Documentation Wiki.**  
> 🌐 **Parent Hub:** [www.codepackr.com](https://www.codepackr.com) | 💰 **Live App:** [finance.codepackr.com](https://finance.codepackr.com) | 💻 **Source:** [coolnaveen99/codepackr-finance](https://github.com/coolnaveen99/codepackr-finance)

---

# CodePackr Finance

**100% client-side** financial calculators for loans, mortgages, retirement, investing, tax, salary, and business finance.  
All math runs in your browser. Your numbers never leave your device.

- **Live Application:** [https://finance.codepackr.com](https://finance.codepackr.com)
- **Parent Developer Hub:** [https://www.codepackr.com](https://www.codepackr.com)
- **GitHub Repository:** [coolnaveen99/codepackr-finance](https://github.com/coolnaveen99/codepackr-finance)

---

## Financial Primers

* [Team Guide](team-guide) — How the team works with this codebase
* [Admin Portal Architecture](admin-portal-architecture) — Internal admin architecture notes
* [Sprint Plan — Missing Tools](sprint-plan-missing-tools) — Roadmap for additional calculators

---

## Complete Directory of Finance Calculators

`;

for (const cat of CATEGORY_ORDER) {
  const tools = categoryTools[cat] || [];
  if (tools.length === 0) continue;
  const title = CATEGORY_TITLES[cat] || cat;
  homeContent += `### ${title}\n\n`;
  for (const t of tools) {
    homeContent += `* **[${t.name}](https://finance.codepackr.com/${t.id})** — ${t.description}\n`;
  }
  homeContent += `\n`;
}

homeContent += `---

## Privacy Guarantee

🔒 **100% Client-Side** — Every calculation, chart, amortization table, and PDF report is generated entirely in your browser.  
No financial inputs are uploaded, stored, or logged on any server.

© 2026 CodePackr Finance. All rights reserved.\n`;

fs.writeFileSync(path.join(targetDir, 'Home.md'), homeContent, 'utf8');
console.log('✓ Generated Home.md');

const docsFiles = fs.existsSync(DOCS_DIR)
  ? fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))
  : [];

for (const file of docsFiles) {
  const src = path.join(DOCS_DIR, file);
  const destName = urlMap.get(file) || file.toLowerCase().replace(/_/g, '-');
  const raw = fs.readFileSync(src, 'utf8');
  const processed = rewriteLinks(raw);
  fs.writeFileSync(path.join(targetDir, destName), processed, 'utf8');
  console.log(`✓ Synced ${destName}`);
}

let toolPages = 0;
for (const t of TOOLS) {
  const page = `# ${t.name}\n\n> 💰 **Open the live calculator:** [${t.name} on finance.codepackr.com](https://finance.codepackr.com/${t.id})\n\n${t.description}\n\n---\n\n## Privacy\n\nAll inputs stay in your browser. CodePackr Finance never uploads, stores, or logs your financial data.\n\n[← Back to Wiki Home](Home) · [Open Live App](https://finance.codepackr.com/${t.id})\n`;
  fs.writeFileSync(path.join(targetDir, `${t.id}.md`), page, 'utf8');
  toolPages++;
}
console.log(`✓ Generated ${toolPages} tool documentation stubs`);

let sidebar = `### [📖 CodePackr Finance Wiki](Home)\n\n**💰 [Open Live App](https://finance.codepackr.com)**  \n**🌐 [Parent Hub — CodePackr](https://www.codepackr.com)**\n\n---\n\n### 📚 Guides\n* **[Team Guide](team-guide)**\n* **[Admin Portal Architecture](admin-portal-architecture)**\n* **[Sprint Plan](sprint-plan-missing-tools)**\n\n---\n\n### 🛠️ Calculators\n`;

for (const cat of CATEGORY_ORDER) {
  const tools = categoryTools[cat] || [];
  if (tools.length === 0) continue;
  const catTitle = CATEGORY_TITLES[cat] || cat;
  sidebar += `\n<details open>\n<summary><b>${catTitle} (${tools.length})</b></summary>\n\n`;
  for (const t of tools) {
    sidebar += `* [${t.name}](${t.id})\n`;
  }
  sidebar += `\n</details>\n`;
}

sidebar += `\n---\n* [Source Repository](https://github.com/coolnaveen99/codepackr-finance)\n* [Parent CodePackr](https://github.com/coolnaveen99/codepackr)\n`;

fs.writeFileSync(path.join(targetDir, '_Sidebar.md'), sidebar, 'utf8');
console.log('✓ Generated _Sidebar.md');

const footer = `---\n<p align="center">\n  <b><a href="https://finance.codepackr.com">CodePackr Finance</a></b> — 100% Client-Side Financial Calculators.<br>\n  <a href="Home">Wiki Home</a> | <a href="https://finance.codepackr.com">Live App</a> | <a href="https://www.codepackr.com">Parent Hub</a> | <a href="https://github.com/coolnaveen99/codepackr-finance">GitHub</a>\n</p>\n`;

fs.writeFileSync(path.join(targetDir, '_Footer.md'), footer, 'utf8');
console.log('✓ Generated _Footer.md');

console.log(`\n🎉 Wiki sync complete! Pages written to: ${targetDir}`);

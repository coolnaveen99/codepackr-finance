import fs from 'node:fs';
import path from 'node:path';

// Resolve directory paths
const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const TOOLS_SRC = path.join(ROOT_DIR, 'src', 'data', 'tools.ts');
const METADATA_SRC = path.join(ROOT_DIR, 'src', 'data', 'toolMetadata.json');
const URLS_SRC = path.join(ROOT_DIR, 'src', 'lib', 'urls.ts');

// Target directory from CLI argument or default to '.wiki'
const targetDir = path.resolve(process.argv[2] || path.join(ROOT_DIR, '.wiki'));

console.log('======================================================');
console.log(' CodePackr Finance GitHub Wiki Synchronization Engine');
console.log('======================================================');
console.log(`Source Docs:  ${DOCS_DIR}`);
console.log(`Target Wiki:  ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Load Tool Metadata
let toolMetadata = {};
if (fs.existsSync(METADATA_SRC)) {
  try {
    toolMetadata = JSON.parse(fs.readFileSync(METADATA_SRC, 'utf8'));
  } catch (err) {
    console.warn('[!] Failed to parse toolMetadata.json:', err.message);
  }
}

// 2. Parse Tools and Slugs from source
const toolsSource = fs.readFileSync(TOOLS_SRC, 'utf8');
const toolBlock = toolsSource.slice(toolsSource.indexOf('export const TOOLS: ToolDef[] = ['));
const toolRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)'/g;

const tools = [];
let match;
while ((match = toolRegex.exec(toolBlock)) !== null) {
  tools.push({
    id: match[1],
    name: match[2],
    category: match[3],
    description: match[4],
  });
}

// Parse Canonical Slugs from src/lib/urls.ts
const urlsSource = fs.readFileSync(URLS_SRC, 'utf8');
const slugMap = {};
const slugRegex = /'([^']+)':\s*'([^']+)'/g;
const slugBlockMatch = urlsSource.match(/export const TOOL_ID_TO_CANONICAL_SLUG: Record<string, string> = {([\s\S]*?)};/);
if (slugBlockMatch) {
  let sm;
  while ((sm = slugRegex.exec(slugBlockMatch[1])) !== null) {
    slugMap[sm[1]] = sm[2];
  }
}

// Category Human Names & Order
const CATEGORY_NAMES = {
  'loans': 'Loans & Debt',
  'investments': 'Investment & Wealth',
  'tax': 'Tax Planning',
  'salary': 'Salary & In-Hand',
  'retirement': 'Retirement & FIRE',
  'personal-finance': 'Personal Finance',
  'business-finance': 'Business & Valuation',
};

const CATEGORY_EMOJIS = {
  'loans': '💳',
  'investments': '📈',
  'tax': '🏛️',
  'salary': '💼',
  'retirement': '🎯',
  'personal-finance': '🛡️',
  'business-finance': '🏢',
};

// 3. Link Rewriter
function rewriteWikiLinks(content) {
  // Convert [Text](tools/foo.md) or [Text](../tools/foo.md) -> [Text](foo)
  let updated = content.replace(/\[([^\]]+)\]\((?:\.\.?\/)*(?:tools|primers|docs)?\/?([^)#]+)\.md(#[^)]+)?\)/g, (m, text, page, anchor) => {
    const pageName = path.basename(page);
    return `[${text}](${pageName}${anchor || ''})`;
  });

  // Convert bare links to docs/ -> wiki flat pages
  updated = updated.replace(/\[([^\]]+)\]\(docs\/([^)]+)\)/g, (m, text, page) => {
    const clean = path.basename(page).replace(/\.md$/, '');
    return `[${text}](${clean})`;
  });

  return updated;
}

// 4. Gather & Copy Markdown files from docs/
function scanDocs(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDocs(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const docFiles = scanDocs(DOCS_DIR);
console.log(`Found ${docFiles.length} source documentation files in docs/`);

const writtenPages = new Set();

for (const filePath of docFiles) {
  const fileName = path.basename(filePath);
  const destPath = path.join(targetDir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  content = rewriteWikiLinks(content);
  fs.writeFileSync(destPath, content, 'utf8');
  writtenPages.add(fileName.replace(/\.md$/, ''));
}

// 5. Generate Comprehensive Tool Wiki Pages for Tools lacking manual doc
for (const tool of tools) {
  const slug = slugMap[tool.id] || tool.id;
  const fileName = `${slug}.md`;
  const pageId = slug;

  // If already provided via docs/, skip or enrich
  if (!writtenPages.has(pageId)) {
    const meta = toolMetadata[slug] || toolMetadata[tool.id] || {};
    const features = meta.features || [
      `100% browser-based computation with zero remote network requests.`,
      `Instant reactive calculation updates upon changing input parameters.`,
      `Interactive SVG charting and dynamic global currency adaptation.`,
      `One-click CSV data export and client-side summary generation.`
    ];
    const howToUse = meta.howToUse || [
      `Enter your financial numbers (e.g. principal amount, rate, tenure, or contribution).`,
      `Review instant real-time financial projections, breakdown tables, and visual compounding charts.`,
      `Toggle scenario parameters to compare outcomes.`,
      `Copy your calculation summary or export the schedule for your records.`
    ];
    const faqs = meta.faqs || [
      {
        question: `Is my financial data uploaded or stored anywhere?`,
        answer: `No. All calculations execute 100% locally in your browser memory. Zero financial data is ever stored, logged, or transmitted to any server.`
      },
      {
        question: `Can this tool be used offline?`,
        answer: `Yes. CodePackr Finance is built as a Progressive Web App (PWA). Once loaded, it works entirely offline without an internet connection.`
      }
    ];

    const catName = CATEGORY_NAMES[tool.category] || tool.category;
    const catEmoji = CATEGORY_EMOJIS[tool.category] || '📊';

    const toolDocContent = `# ${tool.name}

[![Category](https://img.shields.io/badge/Category-${encodeURIComponent(catName)}-6366f1?style=flat-square)](${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')})
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side-10b981?style=flat-square)](Home)
[![Live Tool](https://img.shields.io/badge/Live_Tool-Launch_in_Browser-0ea5e9?style=flat-square)](https://finance.codepackr.com/${slug})

${tool.description}

---

## 🚀 Live Calculator & Production Access
- **Production URL**: [https://finance.codepackr.com/${slug}](https://finance.codepackr.com/${slug})
- **Parent Dev Suite**: [https://www.codepackr.com](https://www.codepackr.com)
- **Status**: Active · 100% Client-Side Computation · Zero Server Uploads

---

## ✨ Key Capabilities & Features
${features.map(f => `- **${f.split(':')[0]}**: ${f.includes(':') ? f.split(':').slice(1).join(':').trim() : f}`).join('\n')}

---

## 📖 How to Use
${howToUse.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

---

## 🔒 Privacy & Client-Side Execution Guarantee
Like all tools in the **CodePackr Finance** suite, ${tool.name} runs strictly in your local browser sandbox.
- **Zero Remote Storage**: Your numbers, incomes, debts, or investments never leave your device.
- **Zero Telemetry on Financial Inputs**: No analytics or logging services ever track the numbers you type.
- **Client-Side Export**: Amortization tables, CSV exports, and summaries are assembled completely within browser memory.

---

## ❓ Frequently Asked Questions (FAQ)
${faqs.map(faq => `### ${faq.question}\n${faq.answer}\n`).join('\n')}

---

## 🔗 Related Calculators in ${catEmoji} ${catName}
${tools.filter(t => t.category === tool.category && t.id !== tool.id).map(t => {
  const otherSlug = slugMap[t.id] || t.id;
  return `- [${t.name}](${otherSlug}) — ${t.description}`;
}).slice(0, 5).join('\n')}

---

[← Back to Wiki Home](Home) · [Launch Tool on finance.codepackr.com](https://finance.codepackr.com/${slug})
`;

    fs.writeFileSync(path.join(targetDir, fileName), toolDocContent, 'utf8');
    writtenPages.add(pageId);
  }
}

// 6. Generate Home.md
console.log('Generating Home.md...');
const toolsByCategory = {};
for (const tool of tools) {
  const cat = tool.category;
  if (!toolsByCategory[cat]) toolsByCategory[cat] = [];
  toolsByCategory[cat].push(tool);
}

let homeContent = `# CodePackr Finance Documentation & Knowledge Base

Welcome to the official **CodePackr Finance** Wiki. CodePackr Finance is an enterprise-grade, 100% privacy-first personal finance, investment, debt repayment, and retirement planning suite.

[![Live App](https://img.shields.io/badge/Live_App-finance.codepackr.com-10b981?style=for-the-badge&logo=googlechrome&logoColor=white)](https://finance.codepackr.com)
[![Parent Platform](https://img.shields.io/badge/Parent_Hub-codepackr.com-6366f1?style=for-the-badge&logo=firefoxbrowser&logoColor=white)](https://www.codepackr.com)
[![Privacy Guarantee](https://img.shields.io/badge/Privacy-100%25_Client--Side-10b981?style=for-the-badge&logo=shield)](https://finance.codepackr.com)
[![Copyright](https://img.shields.io/badge/©_2026-All_Rights_Reserved-0ea5e9?style=for-the-badge)](https://finance.codepackr.com)

---

## 🌐 Quick Access & Ecosystem Links
- **Official Web Application**: [https://finance.codepackr.com](https://finance.codepackr.com)
- **Parent Developer Suite**: [https://www.codepackr.com](https://www.codepackr.com)
- **GitHub Repository**: [coolnaveen99/codepackr-finance](https://github.com/coolnaveen99/codepackr-finance)
- **Financial Glossary**: [Glossary & Mathematical Formulas](GLOSSARY)

---

## 💡 Core Philosophy: 100% Client-Side Ephemeral Privacy
In personal finance, privacy is non-negotiable. Traditional finance portals require user accounts, upload sensitive bank balances to remote cloud databases, and sell aggregate marketing metrics.

**CodePackr Finance is built differently**:
1. **Zero Server Transmission**: Every formula, compounding projection, loan amortization schedule, and tax calculation runs strictly inside the user's browser runtime.
2. **Zero Financial Telemetry**: Input values (salary, net worth, debt balances, mortgage amounts) are never tracked by Google Analytics, Microsoft Clarity, or any third-party telemetry.
3. **Global Currency Agnostic**: High-precision formatting supports Indian numbering formats (Lakhs & Crores) and international thousands systems across 12+ major world currencies.
4. **Offline First (PWA)**: Cached via service worker to operate anywhere without internet access.

---

## 📚 Financial Primers & Knowledge Base
Foundational financial guides, formulas, and methodologies included in this documentation suite:

- 📘 **[Financial Planning & Wealth Creation Basics](00-financial-planning-basics)** — Compounding frequency, Time Value of Money (TVM), inflation impact, and emergency runway.
- 📙 **[Loan Amortization, Reducing Balance & Prepayment Modeling](01-loan-amortization-and-debt)** — Mathematical EMI derivation, amortization tables, prepayment interest savings, and DTI debt thresholds.
- 📕 **[Retirement & FIRE Planning](02-retirement-and-fire)** — Safe withdrawal rates (SWR), 4% rule, Trinity Study, Lean/Fat/Coast FIRE models, and post-retirement decumulation glidepaths.
- 📗 **[Investment Returns & Multi-Year Compounding](03-investments-and-compounding)** — SIP step-up mechanics, CAGR vs ROI, Rule of 72, and Dividend Reinvestment Plans (DRIP).
- 📓 **[Business Finance, Valuation & Capital Budgeting](04-business-valuation-and-capital)** — DCF valuation, Gordon Growth terminal value, WACC hurdle rates, NPV, and startup burn runway.
- 📖 **[Financial Terminology Glossary](GLOSSARY)** — Exhaustive glossary of financial ratios, metrics, formulas, and acronyms.

---

## ⚙️ Architecture & Operational Docs
- 🐞 **[Bug Reporting & Technical Diagnostics](BUG_REPORTING_AND_DIAGNOSTICS)** — Zero-exfiltration client-side issue reporting, error buffers, and telemetry.
- 🛡️ **[Admin Portal & Tool Governance](ADMIN_PORTAL_ARCHITECTURE)** — Offline PIN authentication, feature flags, and emergency maintenance.
- 👥 **[Team Guide & Release Workflow](TEAM_GUIDE)** — Git branching model, PR rules, Vercel preview environments, and release protocol.
- 📋 **[Sprint Roadmap & Tool Expansion](SPRINT_PLAN_MISSING_TOOLS)** — Prioritized feature roadmap and planned calculator additions.

---

## 🗂️ Complete Calculator & Planning Tool Directory

`;

for (const [catKey, catTools] of Object.entries(toolsByCategory)) {
  const catName = CATEGORY_NAMES[catKey] || catKey;
  const catEmoji = CATEGORY_EMOJIS[catKey] || '📊';

  homeContent += `### ${catEmoji} ${catName} (${catTools.length} Tools)\n\n`;
  homeContent += `| Tool Name | Key Functionality | Wiki Guide | Live Production Link |\n`;
  homeContent += `|:---|:---|:---:|:---:|\n`;

  for (const t of catTools) {
    const slug = slugMap[t.id] || t.id;
    homeContent += `| **${t.name}** | ${t.description} | [📖 Read Guide](${slug}) | [🚀 Open Tool](https://finance.codepackr.com/${slug}) |\n`;
  }
  homeContent += `\n`;
}

homeContent += `---

## 🛠️ Local Development & Contributing
The CodePackr Finance application is built with React 18, Vite, TypeScript, and Tailwind CSS.

\`\`\`bash
# Clone the repository
git clone https://github.com/coolnaveen99/codepackr-finance.git
cd codepackr-finance

# Install dependencies
npm install

# Start local development server
npm run dev

# Run test suite
npm test

# Build production bundle, prerendered static pages & sitemaps
npm run build

# Synchronize documentation to GitHub Wiki
npm run sync:wiki
\`\`\`

---

## ⚖️ Copyright & Disclaimer
© 2026 **CodePackr Finance**. All rights reserved. Calculations are intended strictly for educational and informational planning purposes. Users should consult a qualified financial advisor, CPA, or chartered accountant for specific legal, tax, or investment advice.
`;

fs.writeFileSync(path.join(targetDir, 'Home.md'), homeContent, 'utf8');

// 7. Generate _Sidebar.md
console.log('Generating _Sidebar.md...');
let sidebarContent = `### [🏠 Wiki Home](Home)
- **[🌐 Live Suite](https://finance.codepackr.com)**
- **[🛠️ Parent Platform](https://www.codepackr.com)**
- **[📖 Financial Glossary](GLOSSARY)**

---

### 📚 Primers & Guides
- [Financial Planning Basics](00-financial-planning-basics)
- [Loan Amortization & Debt](01-loan-amortization-and-debt)
- [Retirement & FIRE](02-retirement-and-fire)
- [Investments & Returns](03-investments-and-compounding)
- [Business Valuation & Capital](04-business-valuation-and-capital)

---

### ⚙️ System & Governance
- [Bug Reporting & Diagnostics](BUG_REPORTING_AND_DIAGNOSTICS)
- [Admin Portal Architecture](ADMIN_PORTAL_ARCHITECTURE)
- [Team Guide & Releases](TEAM_GUIDE)
- [Sprint Roadmap](SPRINT_PLAN_MISSING_TOOLS)

---

### 🧮 Financial Calculators
`;

for (const [catKey, catTools] of Object.entries(toolsByCategory)) {
  const catName = CATEGORY_NAMES[catKey] || catKey;
  const catEmoji = CATEGORY_EMOJIS[catKey] || '📊';

  sidebarContent += `\n<details open>\n<summary><strong>${catEmoji} ${catName}</strong></summary>\n\n`;
  for (const t of catTools) {
    const slug = slugMap[t.id] || t.id;
    sidebarContent += `- [${t.name}](${slug})\n`;
  }
  sidebarContent += `\n</details>\n`;
}

sidebarContent += `
---

**[📂 GitHub Repo](https://github.com/coolnaveen99/codepackr-finance)**  
*100% Client-Side Privacy*
`;

fs.writeFileSync(path.join(targetDir, '_Sidebar.md'), sidebarContent, 'utf8');

// 8. Generate _Footer.md
console.log('Generating _Footer.md...');
const footerContent = `---

<div align="center">

[🏠 Wiki Home](Home) &nbsp;•&nbsp; 
[🌐 CodePackr Finance Live](https://finance.codepackr.com) &nbsp;•&nbsp; 
[🛠️ CodePackr Dev Suite](https://www.codepackr.com) &nbsp;•&nbsp; 
[📂 GitHub Repository](https://github.com/coolnaveen99/codepackr-finance) &nbsp;•&nbsp; 
[📖 Glossary](GLOSSARY)

<br/>

🔒 **100% Private & Ephemeral** — Calculations run locally in your browser memory.  
© 2026 **CodePackr Finance**. All rights reserved.

</div>
`;

fs.writeFileSync(path.join(targetDir, '_Footer.md'), footerContent, 'utf8');

console.log('======================================================');
console.log(`[✓] Wiki synchronization complete!`);
console.log(`[✓] Total pages synchronized in ${targetDir}: ${fs.readdirSync(targetDir).length}`);
console.log('======================================================');

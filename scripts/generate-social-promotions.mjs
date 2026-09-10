import fs from 'node:fs';
import path from 'node:path';

// Load tool metadata and sitemap data if available
let metadata = {};
try {
  metadata = JSON.parse(fs.readFileSync('src/data/toolMetadata.json', 'utf8'));
} catch (e) {
  // fallback if not generated yet
}

let sitemapUrls = [];
try {
  const sitemapData = JSON.parse(fs.readFileSync('src/data/sitemapUrls.json', 'utf8'));
  sitemapUrls = sitemapData.urls || [];
} catch (e) {
  // fallback
}

// Curated live tools list with specific action descriptions and hashtags
const toolsData = [
  {
    slug: 'calculators',
    name: 'Financial Calculators Suite',
    desc: 'Calculate loans, EMIs, SIP returns, retirement corpus, and investment growth with multi-currency support',
    tags: ['#Finance', '#Calculators', '#PersonalFinance', '#MoneyManagement', '#Investing']
  },
  {
    slug: 'financial-planner',
    name: 'Financial Planning & Retirement Calculator',
    desc: 'Analyze retirement readiness, projected vs required corpus, corpus sustainability, and savings gap',
    tags: ['#Retirement', '#FinancialPlanning', '#FIRE', '#FinancialIndependence', '#Investing']
  },
  {
    slug: 'loan-calculator',
    name: 'Loan & EMI Calculator',
    desc: 'Calculate monthly loan EMI payments, total interest, and full amortization schedules in your preferred currency',
    tags: ['#Finance', '#Mortgage', '#LoanCalculator', '#EMI', '#Interest']
  },
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    desc: 'Calculate future wealth and expected returns for Systematic Investment Plans and mutual funds with interactive compounding graphs',
    tags: ['#Finance', '#Investing', '#SIPCalculator', '#MutualFunds', '#Wealth']
  },
  {
    slug: 'investment-calculator',
    name: 'Investment Calculator',
    desc: 'Calculate exponential investment growth, custom deposit frequencies, compound returns, and visual balance timelines',
    tags: ['#Finance', '#Investing', '#InvestmentCalculator', '#WealthBuilding', '#Calculators']
  },
  {
    slug: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    desc: 'Calculate non-compounding interest and maturity amounts on fixed deposits, personal loans, and private promissory notes',
    tags: ['#Finance', '#SimpleInterest', '#InterestCalculator', '#Banking', '#FinancialLiteracy']
  },
  {
    slug: 'cagr-calculator',
    name: 'CAGR Calculator (Compound Annual Growth Rate)',
    desc: 'Calculate compound annual growth rates, geometric mean returns, and capital multiples for portfolio evaluation',
    tags: ['#Finance', '#CAGR', '#PortfolioManagement', '#StockMarket', '#Investing']
  },
  {
    slug: 'inflation-calculator',
    name: 'Inflation & Purchasing Power Calculator',
    desc: 'Project future living expenses, purchasing power erosion, and rule-of-72 price doubling timelines',
    tags: ['#Finance', '#Inflation', '#PurchasingPower', '#CostOfLiving', '#Economics']
  },
  {
    slug: 'emergency-fund-calculator',
    name: 'Emergency Fund Calculator',
    desc: 'Determine your safety buffer based on essential monthly expenses, shortfall gaps, and time to full funding',
    tags: ['#Finance', '#EmergencyFund', '#SafetyNet', '#PersonalFinance', '#Savings']
  },
  {
    slug: 'net-worth-calculator',
    name: 'Net Worth Calculator',
    desc: 'Audit personal balance sheets across assets and liabilities with 100% client-side privacy and solvency scoring',
    tags: ['#Finance', '#NetWorth', '#WealthAudit', '#BalanceSheet', '#PersonalFinance']
  },
  {
    slug: 'roi-calculator',
    name: 'ROI Calculator (Return on Investment)',
    desc: 'Calculate net ROI, annualized holding period returns, and capital multiples after fees and initial outlays',
    tags: ['#Finance', '#ROI', '#ReturnOnInvestment', '#BusinessFinance', '#Investing']
  },
  {
    slug: 'fire-calculator',
    name: 'FIRE Calculator (Financial Independence)',
    desc: 'Compute Standard, Lean, Fat, and Coast FIRE targets, safe withdrawal rates, and your timeline to financial independence',
    tags: ['#Finance', '#FIRE', '#FinancialIndependence', '#RetireEarly', '#Wealth']
  },
  {
    slug: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    desc: 'Compare New vs Old tax regimes with standard deduction, Section 87A rebate, and slab breakdowns',
    tags: ['#Finance', '#IncomeTax', '#TaxPlanning', '#IndiaTax', '#TaxCalculator']
  },
  {
    slug: 'ctc-to-in-hand-calculator',
    name: 'CTC to In-Hand Salary Calculator',
    desc: 'Convert annual CTC into monthly take-home pay, accounting for EPF, Gratuity, Professional Tax, and TDS',
    tags: ['#Finance', '#SalaryCalculator', '#InHandSalary', '#CTCtoInHand', '#Career']
  },
  {
    slug: 'debt-to-income-calculator',
    name: 'Debt-to-Income (DTI) Calculator',
    desc: 'Analyze front-end and back-end debt-to-income ratios with institutional lending thresholds and mortgage qualification buffers',
    tags: ['#Finance', '#DTI', '#MortgageApproval', '#DebtManagement', '#CreditHealth']
  },
  {
    slug: 'loan-prepayment-calculator',
    name: 'Loan Prepayment & Early Payoff Calculator',
    desc: 'Calculate interest saved and loan tenure reduced through extra monthly, annual, or one-time lump-sum prepayments',
    tags: ['#Finance', '#LoanPrepayment', '#MortgagePayoff', '#DebtFree', '#InterestSavings']
  },
  {
    slug: 'loan-amortization-calculator',
    name: 'Loan Amortization Schedule Calculator',
    desc: 'Generate annual and monthly principal-interest breakdown tables with cumulative debt tracking and CSV export',
    tags: ['#Finance', '#Amortization', '#LoanSchedule', '#EMIBreakdown', '#Mortgage']
  },
  {
    slug: 'lumpsum-calculator',
    name: 'Lumpsum Investment Calculator',
    desc: 'Estimate mutual fund wealth accumulation, compound returns, and inflation-adjusted real purchasing power',
    tags: ['#Finance', '#Lumpsum', '#MutualFunds', '#CompoundInterest', '#Investing']
  },
  {
    slug: 'future-value-calculator',
    name: 'Future Value (TVM) Calculator',
    desc: 'Model time value of money with periodic deposits, discrete compounding frequencies, and annuity growth projections',
    tags: ['#Finance', '#FutureValue', '#TVM', '#CompoundInterest', '#WealthBuilding']
  },
  {
    slug: 'savings-goal-calculator',
    name: 'Savings Goal Calculator',
    desc: 'Calculate required monthly savings to achieve target milestones, initial seed contributions, and compound interest boosts',
    tags: ['#Finance', '#SavingsGoal', '#FinancialMilestones', '#MoneyGoals', '#Budgeting']
  },
  {
    slug: 'salary-hike-calculator',
    name: 'Salary Hike & Increment Calculator',
    desc: 'Compute absolute pay raises, monthly take-home gains, inflation-adjusted real increments, and market appraisal ratings',
    tags: ['#Finance', '#SalaryHike', '#Appraisal', '#Compensation', '#CareerGrowth']
  },
  {
    slug: 'gratuity-calculator',
    name: 'Gratuity Calculator (India 1972 Act)',
    desc: 'Calculate statutory retirement gratuity, 15/26 days service formulas, and Section 10(10) ₹20 Lakh tax exemptions',
    tags: ['#Finance', '#Gratuity', '#EmployeeBenefits', '#IndiaTax', '#RetirementPlanning']
  }
];


// Dynamically integrate any additional URLs from sitemapUrls.json that might not be in toolsData
const existingSlugs = new Set(toolsData.map((t) => t.slug));

if (Array.isArray(sitemapUrls)) {
  for (const item of sitemapUrls) {
    const slug = (item.path || '').replace(/^\/+|\/+$/g, '');
    if (!slug || slug === 'privacy' || slug === 'terms' || slug === 'contact') continue;
    if (!existingSlugs.has(slug)) {
      existingSlugs.add(slug);
      const meta = metadata[slug] || {};
      const cat = item.category || meta.category || 'calculators';
      const name = item.name || meta.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const desc = meta.description || `Fast, browser-based financial calculator for ${name}`;
      
      const tag = '#' + name.replace(/[^a-zA-Z0-9]/g, '');
      const catTag = '#' + cat.charAt(0).toUpperCase() + cat.slice(1);
      
      toolsData.push({
        slug,
        name,
        desc,
        tags: [tag, catTag, '#Finance', '#PersonalFinance']
      });
    }
  }
}

function escapeCsvField(val) {
  if (typeof val !== 'string') val = String(val);
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const headers = [
  'No.',
  'Tool',
  'Exact Sitemap URL',
  'LinkedIn Post',
  'X.com Post',
  'X Character Count',
  'Mandatory + Relevant Hashtags',
  'Image Text',
  'Image Generation Prompt'
];

const rows = [headers.join(',')];

toolsData.forEach((tool, idx) => {
  const no = idx + 1;
  const name = tool.name;
  const url = `https://finance.codepackr.com/${tool.slug}`;
  const action = tool.desc;

  // Mandatory base tags
  const mandatoryTags = ['#CodePackrFinance', '#Finance', '#PersonalFinance'];
  // Combine unique tags
  const allTags = Array.from(new Set([...mandatoryTags, ...(tool.tags || [])]));
  const tagString = allTags.join(' ');

  // LinkedIn Post
  const linkedInPost = `${name}: one less financial calculation to do by hand.\n\n${action}. CodePackr Finance gives you a simple browser-based way to get the job done quickly, without spreadsheets or sign-ups.\n\nTry it here: ${url}\n\n${tagString}`;

  // X.com Post
  const xPost = `${name}: ${action}. Try it free: ${url} ${tagString}`;
  const xCount = xPost.length;

  // Image Text
  const imageText = `FINANCE.CODEPACKR.COM\n${name}\n${action}\nFREE TOOL\nRuns in your browser`;

  // Image Prompt
  const imagePrompt = `Create a square 1:1 social-media promotional graphic for CodePackr Finance (finance.codepackr.com) featuring ${name}. Use the attached CodePackr Finance reference images only as branding inspiration, not as a copy. Clean modern fintech aesthetic, deep navy/blue background, electric blue accent, white clean typography, subtle visual elements related to ${name}, strong mobile readability, generous spacing, professional finance-app style. Include exactly these main text elements: FINANCE.CODEPACKR.COM, ${name}, ${action}, FREE TOOL, Runs in your browser. Do not add hashtags, long paragraphs, fake statistics, fake UI, or unsupported claims. No spelling errors.`;

  const row = [
    no,
    escapeCsvField(name),
    escapeCsvField(url),
    escapeCsvField(linkedInPost),
    escapeCsvField(xPost),
    xCount,
    escapeCsvField(tagString),
    escapeCsvField(imageText),
    escapeCsvField(imagePrompt)
  ];

  rows.push(row.join(','));
});

const csvContent = rows.join('\n');

// Write to public/codepackr_social_media_promotions.csv
fs.writeFileSync('public/codepackr_social_media_promotions.csv', csvContent, 'utf8');

// Write to root
fs.writeFileSync('codepackr_social_media_promotions.csv', csvContent, 'utf8');

// Write to dist/ if it exists
if (fs.existsSync('dist')) {
  fs.writeFileSync('dist/codepackr_social_media_promotions.csv', csvContent, 'utf8');
}

console.log(`\n======================================================`);
console.log(` CodePackr Finance Social Media Promotions Generator`);
console.log(`======================================================`);
console.log(`[✓] Successfully generated ${toolsData.length} promotional entries.`);
console.log(`[✓] Updated: public/codepackr_social_media_promotions.csv`);
console.log(`[✓] Updated: codepackr_social_media_promotions.csv`);
if (fs.existsSync('dist')) {
  console.log(`[✓] Updated: dist/codepackr_social_media_promotions.csv`);
}
console.log(`======================================================\n`);

import fs from 'node:fs';
import path from 'node:path';

// Read tools from src/data/tools.ts
const toolsSource = fs.readFileSync(path.resolve('src/data/tools.ts'), 'utf8');
const toolsSection = toolsSource.slice(toolsSource.indexOf('export const TOOLS: ToolDef[] = ['));
const regex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)'/g;

const baseTools = new Map();
let m;
while ((m = regex.exec(toolsSection)) !== null) {
  baseTools.set(m[1], {
    id: m[1],
    name: m[2],
    category: m[3],
    description: m[4]
  });
}

// Sub-feature & alias definitions
const aliasDefinitions = {
  'financial-planner': {
    name: 'Financial Planning & Retirement Calculator',
    category: 'calculators',
    description: 'Calculate your retirement corpus, investment growth, retirement income, financial health, corpus sustainability and savings gap with our advanced financial planning calculator.'
  },
  'sip-calculator': {
    name: 'SIP Calculator',
    category: 'calculators',
    description: 'Calculate future wealth and expected maturity values for Systematic Investment Plans (SIP) and mutual fund investments with compounding graphs.'
  },
  'investment-calculator': {
    name: 'Investment Calculator',
    category: 'calculators',
    description: 'Calculate long-term investment growth, future portfolio values, and compound interest earnings with customizable deposit schedules and interactive graphs.'
  },
  'loan-calculator': {
    name: 'Loan & EMI Calculator',
    category: 'calculators',
    description: 'Calculate monthly loan EMI, total interest, and comprehensive repayment timeline.'
  },
  'calculators': {
    name: 'Financial Calculators',
    category: 'calculators',
    description: 'Calculate loans, monthly EMIs, amortization schedules, SIP returns, retirement corpus, and investment growth with multi-currency support.'
  },
  'loans': {
    name: 'Loans & Debt Calculators',
    category: 'loans',
    description: 'Free loan, mortgage, and EMI calculators with prepayment schedules, extra principal payoff, and interest breakdowns.'
  },
  'investments': {
    name: 'Investment & Return Calculators',
    category: 'investments',
    description: 'Calculate compound interest, SIP wealth creation, CAGR growth rates, and simple interest maturities with transparent formulas.'
  },
  'tax': {
    name: 'Tax Planning Calculators',
    category: 'tax',
    description: 'Estimate income tax liabilities, compare New vs Old tax regimes, and calculate standard deductions and 87A rebates.'
  },
  'salary': {
    name: 'Salary & In-Hand Calculators',
    category: 'salary',
    description: 'Convert annual CTC to monthly in-hand take-home salary, accounting for EPF, Gratuity, Professional Tax, and TDS.'
  },
  'retirement': {
    name: 'Retirement & FIRE Calculators',
    category: 'retirement',
    description: 'Model retirement corpus requirements, FIRE milestone timelines (Lean, Fat, Coast), and sustainable safe withdrawal rates.'
  },
  'personal-finance': {
    name: 'Personal Finance Calculators',
    category: 'personal-finance',
    description: 'Emergency fund calculators, net worth audits, and inflation purchasing power erosion projections.'
  },
  'business-finance': {
    name: 'Business & Valuation Calculators',
    category: 'business-finance',
    description: 'Calculate net ROI, annualized holding period returns, and capital multiples for business investments.'
  },
  'contact': {
    name: 'Contact & Feedback',
    category: 'general',
    description: 'Get in touch with the CodePackr Finance team for bug reports, tool requests, and user feedback.'
  },
  'privacy': {
    name: 'Privacy Policy',
    category: 'general',
    description: 'Learn how CodePackr Finance protects your privacy with 100% client-side calculations and zero server data storage.'
  },
  'terms': {
    name: 'Terms and Conditions',
    category: 'general',
    description: 'Terms of service, user guidelines, and disclaimer for using CodePackr Finance free online financial calculators.'
  }
};

// Sitemap slugs
const sitemap = fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8');
const sitemapSlugs = [...sitemap.matchAll(/<loc>https:\/\/finance\.codepackr\.com\/([^<]+)<\/loc>/g)]
  .map(m => m[1].replace(/^\/+|\/+$/g, '').replace(/\.html$/, ''))
  .filter(Boolean);

// Specific custom content helpers by category and tool
function getCategoryFeatures(category, toolName) {
  switch (category) {
    case 'calculators':
      return [
        `Accurate mathematical calculations with instant reactive updates for ${toolName}.`,
        'Detailed breakdown tables with visual graphs and itemized summaries.',
        'Customizable interest rates, compounding frequencies, and terms.',
        'Completely private: financial figures and inputs remain on your device.',
        'Export calculation reports and shareable configurations.'
      ];
    default:
      return [
        `Fast, responsive browser calculator for ${toolName} with intuitive controls.`,
        'Modern UI optimized for dark and light themes.',
        'Runs offline and locally without sending telemetry on your inputs.',
        'Instant results with convenient one-click copying.',
        'Multi-currency support for global users.'
      ];
  }
}

function getCategoryHowToUse(category, toolName) {
  switch (category) {
    case 'calculators':
      return [
        `Enter your financial inputs (amount, rate, tenure, or contribution) for ${toolName}.`,
        'View real-time calculated results, breakdown tables, and growth charts.',
        'Adjust assumptions to compare different scenarios instantly.',
        'Export or copy your calculation summary for future reference.'
      ];
    default:
      return [
        `Enter or adjust the input parameters in the tool control panel.`,
        `View real-time updates and calculation results instantly.`,
        `Copy the result to your clipboard or customize settings as needed.`
      ];
  }
}

function getCategoryFAQs(category, toolName) {
  return [
    {
      question: `Is my data or code sent to an external server when using ${toolName}?`,
      answer: `No. All operations in ${toolName} execute 100% client-side in your web browser. Your source code, tokens, queries, and files never leave your computer or get transmitted to any remote server.`
    },
    {
      question: `Can I use ${toolName} offline without an internet connection?`,
      answer: `Yes. CodePackr Finance is engineered as a Progressive Web App (PWA) with service-worker caching. Once loaded in your browser, you can continue using ${toolName} offline.`
    },
    {
      question: `Are there any usage limits, fees, or account registrations required?`,
      answer: `No. All calculators on CodePackr Finance are 100% free to use. There are no daily quotas, paywalls, or account sign-up requirements.`
    },
    {
      question: `How does ${toolName} handle large files or sensitive data?`,
      answer: `Because execution happens locally in your browser using modern Web APIs and V8 JavaScript engine optimizations, you get maximum privacy and low latency without network transfer limits.`
    }
  ];
}

const metadataMap = {};

// 1. Process all sitemap slugs
for (const slug of sitemapSlugs) {
  let info = aliasDefinitions[slug];
  if (!info) {
    info = baseTools.get(slug);
  }
  if (!info) {
    info = {
      name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: 'utilities',
      description: `Free online ${slug.split('-').join(' ')} tool for developers. Fast, client-side, and private.`
    };
  }

  const title = `${info.name} - CodePackr Finance`;
  const canonicalUrl = `https://finance.codepackr.com/${slug}`;

  metadataMap[slug] = {
    name: info.name,
    title,
    description: info.description,
    canonicalPath: `/${slug}`,
    canonicalUrl,
    category: info.category,
    features: getCategoryFeatures(info.category, info.name),
    howToUse: getCategoryHowToUse(info.category, info.name),
    faqs: getCategoryFAQs(info.category, info.name)
  };
}

// 2. Also map base tools that might have aliases
for (const [toolId, tool] of baseTools) {
  if (!metadataMap[toolId]) {
    const title = `${tool.name} - CodePackr Finance`;
    const canonicalSlug = toolId;
    const canonicalUrl = `https://finance.codepackr.com/${canonicalSlug}`;

    metadataMap[toolId] = {
      name: tool.name,
      title,
      description: tool.description,
      canonicalPath: `/${canonicalSlug}`,
      canonicalUrl,
      category: tool.category,
      features: getCategoryFeatures(tool.category, tool.name),
      howToUse: getCategoryHowToUse(tool.category, tool.name),
      faqs: getCategoryFAQs(tool.category, tool.name)
    };
  }
}

// 3. Add home page metadata
metadataMap['home'] = {
  name: 'CodePackr Finance',
  title: 'CodePackr Finance - Free Smart Financial Calculators',
  description: 'Free online financial calculators for loans, mortgages, retirement, budgeting, and investing \u2014 calculated instantly and privately in your browser.',
  canonicalPath: '/',
  canonicalUrl: 'https://finance.codepackr.com/',
  category: 'finance',
  features: [
    'Smart financial calculators for loans, mortgages, retirement, and budgeting.',
    '100% client-side execution ensuring zero financial data leaves your browser.',
    'PWA offline caching for reliable access without internet.',
    'Clean, responsive design with full dark mode and light mode support.',
    'No registration, no accounts, and no usage limitations.'
  ],
  howToUse: [
    'Browse tools by category or press Ctrl+K / Cmd+K to search instantly.',
    'Select any formatter, validator, converter, or calculator.',
    'Paste your input data to view real-time processed results.',
    'Bookmark your most frequently used tools for one-click access.'
  ],
  faqs: [
    {
      question: 'What is CodePackr Finance?',
      answer: 'CodePackr Finance is a collection of high-performance financial calculators designed to run entirely client-side in your web browser with maximum speed and complete privacy.'
    },
    {
      question: 'Are my code and data private on CodePackr Finance?',
      answer: 'Yes. All data processing occurs locally on your machine using JavaScript. We never upload or save your code, secrets, or inputs to any external server.'
    },
    {
      question: 'Is CodePackr Finance free to use?',
      answer: 'Yes, CodePackr Finance is completely free with no usage limits or account registration required.'
    }
  ]
};

// Write out JSON
fs.writeFileSync(
  path.resolve('src/data/toolMetadata.json'),
  JSON.stringify(metadataMap, null, 2),
  'utf8'
);

console.log(`Generated metadata for ${Object.keys(metadataMap).length} routes into src/data/toolMetadata.json`);

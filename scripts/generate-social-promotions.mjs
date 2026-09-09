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

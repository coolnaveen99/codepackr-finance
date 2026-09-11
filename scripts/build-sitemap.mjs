import fs from 'node:fs';
import path from 'node:path';

const today = new Date().toISOString().split('T')[0];
const HOST = process.env.HOST || 'finance.codepackr.com';
const BASE_URL = `https://${HOST}`;

console.log(`\n========================================`);
console.log(` Building Codepackr XML Sitemap`);
console.log(` Host: ${BASE_URL} | Lastmod: ${today}`);
console.log(`========================================`);

// 1. Read Tools from src/data/tools.ts
const toolsSource = fs.readFileSync(path.resolve('src/data/tools.ts'), 'utf8');
const toolsSection = toolsSource.slice(toolsSource.indexOf('export const TOOLS: ToolDef[] = ['));
const regex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']+)'/g;

const toolsMap = new Map();
let m;
while ((m = regex.exec(toolsSection)) !== null) {
  toolsMap.set(m[1], {
    id: m[1],
    name: m[2],
    category: m[3],
    description: m[4],
  });
}

// 2. High-priority Category Hubs
const categoryHubs = [
  { slug: 'calculators', name: 'Financial Calculators', priority: '0.9', changefreq: 'weekly', category: 'calculators' },
  { slug: 'loans', name: 'Loans & Debt Calculators', priority: '0.9', changefreq: 'weekly', category: 'loans' },
  { slug: 'investments', name: 'Investment & Return Calculators', priority: '0.9', changefreq: 'weekly', category: 'investments' },
  { slug: 'tax', name: 'Tax Planning Calculators', priority: '0.9', changefreq: 'weekly', category: 'tax' },
  { slug: 'salary', name: 'Salary & In-Hand Calculators', priority: '0.9', changefreq: 'weekly', category: 'salary' },
  { slug: 'retirement', name: 'Retirement & FIRE Calculators', priority: '0.9', changefreq: 'weekly', category: 'retirement' },
  { slug: 'personal-finance', name: 'Personal Finance Calculators', priority: '0.9', changefreq: 'weekly', category: 'personal-finance' },
  { slug: 'business-finance', name: 'Business Finance Calculators', priority: '0.9', changefreq: 'weekly', category: 'business-finance' },
];

// 3. Direct Sub-features and Specialized Aliases
const specializedAliases = [];

// 4. Legal & Company Pages
const legalPages = [
  { slug: 'about', name: 'About CodePackr Finance', priority: '0.7', changefreq: 'monthly', category: 'legal' },
  { slug: 'contact', name: 'Contact & Support', priority: '0.7', changefreq: 'monthly', category: 'legal' },
  { slug: 'financial-disclaimer', name: 'Financial Disclaimer', priority: '0.6', changefreq: 'monthly', category: 'legal' },
  { slug: 'cookie-policy', name: 'Cookie Policy', priority: '0.6', changefreq: 'monthly', category: 'legal' },
  { slug: 'calculation-methodology', name: 'Calculation Methodology', priority: '0.6', changefreq: 'monthly', category: 'legal' },
  { slug: 'editorial-policy', name: 'Editorial Policy', priority: '0.6', changefreq: 'monthly', category: 'legal' },
  { slug: 'privacy', name: 'Privacy Policy', priority: '0.6', changefreq: 'monthly', category: 'legal' },
  { slug: 'terms', name: 'Terms and Conditions', priority: '0.6', changefreq: 'monthly', category: 'legal' },
];


// Assemble complete URL list with strict deduplication
const allEntries = [];
const existingSlugs = new Set();

const addEntry = (entry) => {
  const cleanSlug = entry.path.replace(/^\//, '') || '__root__';
  if (!existingSlugs.has(cleanSlug)) {
    existingSlugs.add(cleanSlug);
    allEntries.push(entry);
  }
};

// Homepage
addEntry({
  loc: `${BASE_URL}/`,
  path: '/',
  name: 'CodePackr Finance - Free Online Financial Calculators',
  priority: '1.0',
  changefreq: 'weekly',
  category: 'home',
});

// Category Hubs
for (const hub of categoryHubs) {
  addEntry({
    loc: `${BASE_URL}/${hub.slug}`,
    path: `/${hub.slug}`,
    name: hub.name,
    priority: hub.priority,
    changefreq: hub.changefreq,
    category: hub.category,
  });
}

// Tool Pages
for (const [id, tool] of toolsMap.entries()) {
  addEntry({
    loc: `${BASE_URL}/${id}`,
    path: `/${id}`,
    name: tool.name,
    priority: tool.popular ? '0.85' : '0.8',
    changefreq: 'monthly',
    category: tool.category,
  });
}

// Specialized Aliases (if not already added)
for (const alias of specializedAliases) {
  addEntry({
    loc: `${BASE_URL}/${alias.slug}`,
    path: `/${alias.slug}`,
    name: alias.name,
    priority: alias.priority,
    changefreq: alias.changefreq,
    category: alias.category,
  });
}

// Legal Pages
for (const legal of legalPages) {
  addEntry({
    loc: `${BASE_URL}/${legal.slug}`,
    path: `/${legal.slug}`,
    name: legal.name,
    priority: legal.priority,
    changefreq: legal.changefreq,
    category: legal.category,
  });
}

// Build XML String
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (const entry of allEntries) {
  xml += '<url>\n';
  xml += `  <loc>${entry.loc}</loc>\n`;
  xml += `  <lastmod>${today}</lastmod>\n`;
  xml += `  <changefreq>${entry.changefreq}</changefreq>\n`;
  xml += `  <priority>${entry.priority}</priority>\n`;
  xml += '</url>\n';
}

xml += '</urlset>\n';

// Write to public/sitemap.xml
const publicSitemap = path.resolve('public/sitemap.xml');
fs.writeFileSync(publicSitemap, xml, 'utf8');
console.log(`[✓] Written: ${publicSitemap} (${allEntries.length} URLs)`);

// If dist/ directory exists, also write to dist/sitemap.xml
const distDir = path.resolve('dist');
if (fs.existsSync(distDir)) {
  const distSitemap = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemap, xml, 'utf8');
  console.log(`[✓] Written: ${distSitemap} (${allEntries.length} URLs)`);
}

// Write to src/data/sitemapUrls.json for UI inspection
const sitemapJsonPath = path.resolve('src/data/sitemapUrls.json');
fs.writeFileSync(
  sitemapJsonPath,
  JSON.stringify(
    {
      updatedAt: today,
      host: HOST,
      baseUrl: BASE_URL,
      totalUrls: allEntries.length,
      urls: allEntries,
    },
    null,
    2
  ),
  'utf8'
);
console.log(`[✓] Written: ${sitemapJsonPath}`);
console.log(`========================================\n`);

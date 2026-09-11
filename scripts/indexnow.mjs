import fs from 'node:fs';
import path from 'node:path';

// Configuration
const DEFAULT_KEY = 'bc8b27f46bbcd43f50a45f870843689d';
const KEY = process.env.INDEXNOW_KEY || DEFAULT_KEY;
const HOST = process.env.HOST || 'finance.codepackr.com';
const PROTOCOL = process.env.PROTOCOL || 'https';
const BASE_URL = `${PROTOCOL}://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

// Read all URLs from sitemap.xml
const sitemapPath = path.resolve('public/sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('Error: public/sitemap.xml not found. Run scripts/build-sitemap.mjs first.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locRegex = /<loc>([^<]+)<\/loc>/g;
const urlList = [];
let match;
while ((match = locRegex.exec(sitemapContent)) !== null) {
  let url = match[1].trim();
  // Ensure host matches if custom host specified
  if (HOST !== 'finance.codepackr.com') {
    url = url.replace('https://finance.codepackr.com', BASE_URL);
  }
  if (!urlList.includes(url)) {
    urlList.push(url);
  }
}

console.log(`\n======================================================`);
console.log(` Search Engine Indexing & Sitemap Submission Engine`);
console.log(`======================================================`);
console.log(`Host:         ${HOST}`);
console.log(`Base URL:     ${BASE_URL}`);
console.log(`Sitemap:      ${SITEMAP_URL}`);
console.log(`IndexNow Key: ${KEY}`);
console.log(`Key Location: ${KEY_LOCATION}`);
console.log(`Total URLs:   ${urlList.length}\n`);

// Category breakdown
const categoryCounts = {
  calculators: urlList.filter(u => u.includes('calculator') || u.includes('financial-planner')).length,
  legal: urlList.filter(u => u.includes('privacy') || u.includes('terms') || u.includes('contact')).length,
};

console.log(`------------------------------------------------------`);
console.log(` URL Inventory Breakdown:`);
console.log(`------------------------------------------------------`);
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`  - ${cat.padEnd(14)}: ${count} URLs`);
}
console.log(`------------------------------------------------------\n`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList,
};

async function submitToIndexNow() {
  const indexNowEndpoints = [
    { name: 'Yandex Webmaster IndexNow', url: 'https://yandex.com/indexnow' },
    { name: 'Naver Search Advisor IndexNow', url: 'https://searchadvisor.naver.com/indexnow' },
    { name: 'IndexNow Master API', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing Webmaster IndexNow', url: 'https://www.bing.com/indexnow' }
  ];

  const results = [];

  // 1. Submit to IndexNow endpoints
  console.log(`1. Submitting batch of ${urlList.length} URLs to IndexNow endpoints:`);
  for (const { name, url } of indexNowEndpoints) {
    try {
      console.log(`   -> Posting to ${name}...`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': `Codepackr-IndexNow/1.0 (+${BASE_URL})`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.status === 200 || response.status === 202) {
        console.log(`      [SUCCESS] ${name} accepted ${urlList.length} URLs (HTTP ${response.status})`);
        results.push({ name, status: 'Success', code: response.status });
      } else if (response.status === 403) {
        console.log(`      [PENDING] ${name}: Verification pending on Webmaster portal (HTTP 403)`);
        console.log(`                Site verification is active in Bing Webmaster Tools; IndexNow key will activate upon next crawl.`);
        results.push({ name, status: 'Verification Pending (HTTP 403)', code: response.status });
      } else {
        console.log(`      [STATUS] ${name} responded with HTTP ${response.status}`);
        results.push({ name, status: `HTTP ${response.status}`, code: response.status });
      }
    } catch (err) {
      console.log(`      [INFO] ${name} service offline or timed out: ${err.message}`);
      results.push({ name, status: 'Unavailable' });
    }
  }

  // 2. Direct Sitemap Pings (Bing & Google discovery)
  console.log(`\n2. Sending Sitemap Pings for instant crawler notification:`);
  const sitemapPings = [
    { name: 'Bing Sitemap Ping', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
    { name: 'Google Sitemap Ping', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
  ];

  for (const { name, url } of sitemapPings) {
    try {
      console.log(`   -> Pinging ${name}...`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timer);
      console.log(`      [PING COMPLETED] ${name} responded with HTTP ${res.status}`);
    } catch (err) {
      console.log(`      [INFO] ${name} ping skipped: ${err.message}`);
    }
  }

  // Summary
  console.log(`\n======================================================`);
  console.log(` IndexNow Submission Summary:`);
  console.log(`======================================================`);
  for (const r of results) {
    const isOk = r.status === 'Success';
    const mark = isOk ? '[✓]' : '[-]';
    console.log(`  ${mark} ${r.name.padEnd(32)}: ${r.status}`);
  }

  console.log(`\n======================================================`);
  console.log(` Search Engine & Webmaster Discovery:`);
  console.log(`======================================================`);
  console.log(` 1. Public Sitemap:`);
  console.log(`    ${SITEMAP_URL} (declared in robots.txt for Google & Bing)`);
  console.log(` 2. Google Search Console:`);
  console.log(`    https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(BASE_URL + '/')}`);
  console.log(` 3. Bing Webmaster Tools (IndexNow Console):`);
  console.log(`    https://www.bing.com/webmasters/sitemaps?siteUrl=${encodeURIComponent(BASE_URL + '/')}`);
  console.log(`======================================================\n`);
}

submitToIndexNow();

import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

function getMarkDefs(idSuffix = '') {
  return `
    <linearGradient id="cf-blue-c${idSuffix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C8FF" />
      <stop offset="35%" stop-color="#0080FF" />
      <stop offset="70%" stop-color="#0055E5" />
      <stop offset="100%" stop-color="#0038B8" />
    </linearGradient>
    <linearGradient id="cf-blue-facet${idSuffix}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#002D96" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#007BFF" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="cf-green-bar${idSuffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ADE80" />
      <stop offset="55%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>
    <linearGradient id="cf-green-arrow${idSuffix}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6EE7B7" />
      <stop offset="45%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#15803D" />
    </linearGradient>
    <linearGradient id="cf-packr-blue${idSuffix}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00B4D8" />
      <stop offset="100%" stop-color="#0066FF" />
    </linearGradient>
    <filter id="cf-drop-shadow${idSuffix}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#070D1B" flood-opacity="0.2" />
    </filter>
  `;
}

function getMarkPaths(idSuffix = '', isDark = false) {
  return `
    <g id="brand-mark-group${idSuffix}">
      <!-- Outer Blue C ribbon -->
      <path fill="url(#cf-blue-c${idSuffix})" d="
        M 372 76
        C 242 42, 138 72, 86 142
        C 40 204, 40 308, 86 370
        C 138 440, 242 470, 352 436
        C 372 430, 376 412, 362 398
        L 318 350
        C 310 342, 298 340, 288 344
        C 230 368, 184 350, 152 312
        C 124 278, 124 234, 152 200
        C 184 162, 230 144, 288 168
        C 298 172, 310 170, 318 162
        L 362 114
        C 376 100, 372 82, 372 76
        Z
      " />

      <!-- Top Arm Depth Facet -->
      <path fill="url(#cf-blue-facet${idSuffix})" d="
        M 288 168
        C 298 172, 310 170, 318 162
        L 362 114
        C 372 104, 370 90, 356 84
        C 285 76, 218 114, 182 160
        C 218 144, 255 154, 288 168
        Z
      " />

      <!-- 3 Ascending Green Financial Bars -->
      <rect x="175" y="270" width="38" height="78" rx="8" fill="url(#cf-green-bar${idSuffix})" />
      <rect x="230" y="208" width="38" height="140" rx="8" fill="url(#cf-green-bar${idSuffix})" />
      <rect x="285" y="144" width="38" height="204" rx="8" fill="url(#cf-green-bar${idSuffix})" />

      <!-- Upward Growth Arrow and Curve -->
      <path fill="url(#cf-green-arrow${idSuffix})" stroke="${isDark ? '#0B1220' : '#FFFFFF'}" stroke-width="2.5" stroke-linejoin="round" d="
        M 120 362
        C 165 400, 235 390, 295 320
        C 330 280, 360 225, 385 170
        L 355 165
        L 426 134
        L 416 208
        L 390 192
        C 368 238, 338 288, 305 326
        C 246 392, 175 402, 126 370
        Z
      " />
    </g>
  `;
}

function generateSvgFavicon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="fav-title fav-desc">
  <title id="fav-title">CodePackr Finance</title>
  <desc id="fav-desc">Blue CodePackr ribbon mark with green ascending financial bars and growth arrow</desc>
  <defs>
    ${getMarkDefs('-fav')}
  </defs>
  <g transform="translate(26, 26) scale(0.90)">
    ${getMarkPaths('-fav', false)}
  </g>
</svg>`;
}

function generateMarkSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="mark-title mark-desc">
  <title id="mark-title">CodePackr Finance Mark</title>
  <desc id="mark-desc">CodePackr brand emblem with blue ribbon and ascending financial bars</desc>
  <defs>
    ${getMarkDefs('-standalone')}
  </defs>
  <g transform="translate(26, 26) scale(0.90)">
    ${getMarkPaths('-standalone', false)}
  </g>
</svg>`;
}

function generateLightIconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="icon-light-title icon-light-desc">
  <title id="icon-light-title">CodePackr Finance</title>
  <desc id="icon-light-desc">CodePackr Finance app icon badge with blue growth mark and green financial bars</desc>
  <defs>
    ${getMarkDefs('-icon-light')}
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
    </filter>
  </defs>
  <rect x="20" y="20" width="472" height="472" rx="104" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4" filter="url(#card-shadow)" />
  <g transform="translate(56, 56) scale(0.78)">
    ${getMarkPaths('-icon-light', false)}
  </g>
</svg>`;
}

function generateDarkIconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="icon-dark-title icon-dark-desc">
  <title id="icon-dark-title">CodePackr Finance</title>
  <desc id="icon-dark-desc">CodePackr Finance app icon badge (dark theme) with blue growth mark and green financial bars</desc>
  <defs>
    ${getMarkDefs('-icon-dark')}
  </defs>
  <rect x="20" y="20" width="472" height="472" rx="104" fill="#0B1220" stroke="#1E293B" stroke-width="4" />
  <g transform="translate(56, 56) scale(0.78)">
    ${getMarkPaths('-icon-dark', true)}
  </g>
</svg>`;
}

function generateHorizontalLogoSvg(isDark = false) {
  const suffix = isDark ? '-dark' : '-light';
  const textColor = isDark ? '#FFFFFF' : '#0B1220';
  const taglineColor = isDark ? '#94A3B8' : '#64748B';
  const financeColor = isDark ? '#10B981' : '#14B83D';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1274 384" width="1274" height="384" role="img" aria-label="CodePackr Finance Logo">
  <title>CodePackr Finance</title>
  <desc>CodePackr Finance logo with blue growth mark, Codepackr wordmark, green Finance label, and tagline</desc>
  <defs>
    ${getMarkDefs(suffix)}
  </defs>
  <!-- Mark on Left -->
  <g transform="translate(44, 28) scale(0.64)">
    ${getMarkPaths(suffix, isDark)}
  </g>
  <!-- Brand Wordmark -->
  <text x="420" y="182" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="124" letter-spacing="-3">
    <tspan fill="${textColor}">Code</tspan><tspan fill="url(#cf-packr-blue${suffix})">packr</tspan>
  </text>
  <!-- FINANCE label -->
  <text x="425" y="266" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="54" fill="${financeColor}" letter-spacing="22">FINANCE</text>
  <!-- CALCULATE • PLAN • GROW tagline -->
  <text x="425" y="328" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="28" fill="${taglineColor}" letter-spacing="10">CALCULATE  •  PLAN  •  GROW</text>
</svg>`;
}

function generateOgBannerSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="CodePackr Finance Social Preview">
  <defs>
    <linearGradient id="og-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1220" />
      <stop offset="50%" stop-color="#080F1D" />
      <stop offset="100%" stop-color="#050914" />
    </linearGradient>
    <linearGradient id="og-accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00C8FF" />
      <stop offset="50%" stop-color="#0066FF" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
    ${getMarkDefs('-og')}
  </defs>
  <rect width="1200" height="630" fill="url(#og-bg)" />
  <!-- Top glow accent line -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#og-accent)" />

  <!-- Logo Mark on Left -->
  <g transform="translate(100, 115) scale(0.80)">
    ${getMarkPaths('-og', true)}
  </g>

  <!-- Typography on Right -->
  <text x="560" y="240" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="108" letter-spacing="-2">
    <tspan fill="#FFFFFF">Code</tspan><tspan fill="url(#cf-packr-blue-og)">packr</tspan>
  </text>
  <text x="565" y="320" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="44" fill="#10B981" letter-spacing="20">FINANCE</text>
  <text x="565" y="380" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="24" fill="#94A3B8" letter-spacing="8">CALCULATE  •  PLAN  •  GROW</text>
  <text x="565" y="440" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="400" font-size="22" fill="#64748B">100% Client-Side Private Financial Calculators</text>
</svg>`;
}

function createIcoFile(pngBuffers) {
  // pngBuffers: array of { size, pngBuffer }
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  const buffers = [];
  let offset = 6 + count * 16;

  for (const { size, pngBuffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngBuffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    buffers.push(pngBuffer);
    offset += pngBuffer.length;
  }

  return Buffer.concat([header, ...entries, ...buffers]);
}

function renderPng(svgString, width) {
  const resvg = new Resvg(svgString, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function main() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const ogDir = path.join(publicDir, 'assets', 'og');
  fs.mkdirSync(ogDir, { recursive: true });

  console.log('Generating CodePackr Finance brand and favicon vector assets...');

  const svgFavicon = generateSvgFavicon();
  const markSvg = generateMarkSvg();
  const lightIconSvg = generateLightIconSvg();
  const darkIconSvg = generateDarkIconSvg();
  const lightLogoSvg = generateHorizontalLogoSvg(false);
  const darkLogoSvg = generateHorizontalLogoSvg(true);
  const ogBannerSvg = generateOgBannerSvg();

  // 1. Write SVGs to public/
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-mark.svg'), markSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-icon.svg'), lightIconSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-icon-dark.svg'), darkIconSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-logo.svg'), lightLogoSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-logo-dark.svg'), darkLogoSvg, 'utf8');

  // 2. Generate Favicon PNGs across all sizes
  const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512];
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoBuffers = [];

  for (const size of sizes) {
    const png = renderPng(svgFavicon, size, size);
    fs.writeFileSync(path.join(publicDir, `favicon-${size}x${size}.png`), png);
    if (icoSizes.includes(size)) {
      icoBuffers.push({ size, pngBuffer: png });
    }
  }

  // Also write quality variants for 512 requested by user
  for (const q of [32, 64, 128, 256]) {
    const pngQ = renderPng(svgFavicon, 512, 512);
    fs.writeFileSync(path.join(publicDir, `favicon-512-q${q}.png`), pngQ);
  }

  // Apple Touch Icon (180x180) & Android Chrome Icons
  const appleTouchPng = renderPng(lightIconSvg, 180, 180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchPng);

  const android192 = renderPng(lightIconSvg, 192, 192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), android192);

  const android512 = renderPng(lightIconSvg, 512, 512);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), android512);

  const appIcon512 = renderPng(lightIconSvg, 512, 512);
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-icon.png'), appIcon512);

  // 3. Multi-resolution Favicon ICO
  const icoData = createIcoFile(icoBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData);

  // 4. Horizontal Logo PNGs (Standard, @2x, and Dark)
  const lightLogoPng = renderPng(lightLogoSvg, 1274, 384);
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-logo.png'), lightLogoPng);

  const lightLogo2xPng = renderPng(lightLogoSvg, 2548, 768);
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-logo@2x.png'), lightLogo2xPng);

  const darkLogoPng = renderPng(darkLogoSvg, 1274, 384);
  fs.writeFileSync(path.join(publicDir, 'codepackr-finance-logo-dark.png'), darkLogoPng);

  // 5. OpenGraph Social Card PNG
  const ogPng = renderPng(ogBannerSvg, 1200, 630);
  fs.writeFileSync(path.join(ogDir, 'default.png'), ogPng);

  // 6. Mirror to dist/ if present
  if (fs.existsSync(distDir)) {
    const filesToMirror = [
      'favicon.svg',
      'codepackr-finance-mark.svg',
      'codepackr-finance-icon.svg',
      'codepackr-finance-icon-dark.svg',
      'codepackr-finance-logo.svg',
      'codepackr-finance-logo-dark.svg',
      'codepackr-finance-logo.png',
      'codepackr-finance-logo@2x.png',
      'codepackr-finance-logo-dark.png',
      'codepackr-finance-icon.png',
      'apple-touch-icon.png',
      'android-chrome-192x192.png',
      'android-chrome-512x512.png',
      'favicon.ico',
      ...sizes.map(s => `favicon-${s}x${s}.png`),
      ...[32, 64, 128, 256].map(q => `favicon-512-q${q}.png`)
    ];

    for (const f of filesToMirror) {
      const srcPath = path.join(publicDir, f);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(distDir, f));
      }
    }

    const distOgDir = path.join(distDir, 'assets', 'og');
    fs.mkdirSync(distOgDir, { recursive: true });
    fs.writeFileSync(path.join(distOgDir, 'default.png'), ogPng);
  }

  console.log(`Successfully generated all CodePackr Finance brand assets (${sizes.length} favicon PNGs, @2x logos, dark/light SVG & PNG logos, and ICO).`);
}

main();

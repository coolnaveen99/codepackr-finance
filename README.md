# CodePackr Finance

CodePackr Finance is a free collection of browser-based financial calculators for loans, mortgages, retirement, budgeting, and investing. It is available at [finance.codepackr.com](https://finance.codepackr.com/).

All calculators run locally in the browser. Your financial inputs are never uploaded to any server.

---

## Tools

### Financial Calculators
- Financial Planning & Retirement Calculator
- Loan & EMI Calculator
- SIP Calculator
- Investment Calculator

---

## Features

- **100% Client-Side Privacy**: Data stays in your browser; zero payload uploads or backend logging.
- **Fast Search & Keyboard Navigation**: `Ctrl/Cmd+K` for global tool search and `Ctrl/Cmd+Enter` to run a tool.
- **Theme Support**: Persistent light and dark modes.
- **Deep Linking**: Shareable tool URLs with optional `?input=` query parameter.
- **Offline Capable & Installable**: Full PWA support with service worker caching.
- **Responsive Layout**: Designed for mobile and desktop screens.
- **SEO & Social Sharing**: Pre-rendered semantic HTML, Open Graph tags, Twitter Cards, and per-tool JSON-LD Schema.
- **Instant Search Engine Indexing**: Automated IndexNow pings to Bing & Yandex on every deployment.
- **Google AdSense Ready**: Configured with official Auto-Ads, publisher meta verification, and live `ads.txt`.

---

## Getting Started & Local Development

This project is built using **React 18**, **TypeScript**, and **Vite** with Tailwind CSS.

### Prerequisites
- Node.js 18 or 20+
- npm (or bun)

### Installation & Run

1. Clone or extract the repository:
   ```bash
   git clone https://github.com/<your-username>/codepackr.git
   cd codepackr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

4. Check code quality & TypeScript types:
   ```bash
   npm run lint
   ```

5. Test the production build and pre-rendering locally:
   ```bash
   npm run build
   npm run preview
   ```

The build command executes:
1. `scripts/generate-metadata.mjs` — compiles calculator metadata.
2. `vite build` — bundles client-side assets to `dist/`.
3. `scripts/prerender.mjs` — generates static HTML pages and updates `sitemap.xml`.

---

## CI/CD & GitHub Automation Architecture

The repository includes GitHub Actions workflows integrated with Vercel for continuous deployment:

```text
                               [ Developer ]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
       [ Pull Request opened ]                 [ Merge into 'main' ]
                 │                                       │
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │ .github/workflows/    │               │  Vercel Git Deploy    │
     │        ci.yml         │               │ (Auto-deploys to prod │
     │ • npm ci              │               │  finance.codepackr.com)│
     │ • npm run lint        │               └───────────┬───────────┘
     │ • npm run build       │                           │
     └───────────┬───────────┘              Vercel emits deployment_status: success
                 │                                       │
         PR Check Passes                                 ▼
                 │                           ┌───────────────────────┐
                 ▼                           │  .github/workflows/   │
         Vercel Preview Bot                  │  notify-indexnow.yml  │
         posts preview URL                   │ • Pings IndexNow API  │
                                             │   (Bing & Yandex)     │
                                             └───────────────────────┘

                 ── Independent Release Workflow ──

                 [ git tag v1.0.0 && git push origin v1.0.0 ]
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  .github/workflows/   │
                         │      release.yml      │
                         │ • npm run build       │
                         │ • Package dist.zip    │
                         │ • Create GH Release   │
                         │ • Auto-Changelog      │
                         └───────────────────────┘
```

### Workflows Explained

1. **`ci.yml` (PR Quality Gate)**:
   - Runs automatically on any pull request targeting `main`.
   - Runs `npm ci`, `npm run lint`, and `npm run build` to ensure no broken code is merged.
2. **`notify-indexnow.yml` (Automated Search Indexing)**:
   - Automatically listens for Vercel's production `deployment_status` success event.
   - Pings IndexNow with all sitemap URLs within seconds of deployment. Can also be triggered manually via GitHub's *Run workflow* button.
3. **`release.yml` (Automated Version Packaging)**:
   - Triggers when a git tag like `v1.0.0` is pushed.
   - Packages `dist/` into a release zip and publishes an official GitHub Release with auto-generated release notes.

---

## AI-as-Code: Specialized GitHub Agents & Skills

CodePackr Finance employs an **AI-as-Code** architectural pattern in `.github/` to optimize context windows, eliminate token bloat, and enforce strict enterprise quality and privacy standards across AI-assisted development sessions.

```text
.github/
├── agents/                           # Agent definitions, allowed skills & strict constraints
│   ├── ui-architect.yml              # Frontend UI/UX & Enterprise Design System
│   ├── core-engineer.yml             # Financial calculation engines & client-side performance
│   └── seo-specialist.yml            # Four-layer metadata, sitemap & promotional datasets
├── prompts/                          # Version-controlled system prompts referenced by agents
│   ├── ui-architect.prompt.md
│   ├── core-engineer.prompt.md
│   └── seo-specialist.prompt.md
└── skills/                           # Executable SOPs & guardrails for AI workflows
    └── add-new-tool.md               # Strict 7-step sequence for adding new financial calculators
```

### Specialized Agents

| Agent | Specification File | System Prompt | Scope & Strict Constraints |
|---|---|---|---|
| **Frontend UI/UX Architect** | `.github/agents/ui-architect.yml` | `.github/prompts/ui-architect.prompt.md` | React 18, Tailwind CSS, Enterprise design tokens (`var(--surface)`, `var(--brand)`), CodeMirror 6 (`CodeEditor.tsx`), WCAG AA contrast, and centralized currency formatting via `useCurrency()`. |
| **Core Logic & Algorithms** | `.github/agents/core-engineer.yml` | `.github/prompts/core-engineer.prompt.md` | In-browser financial calculation engines (loan/EMI, SIP, retirement, investment growth). Strict zero data leakage mandate: 100% memory execution, non-blocking Web Workers, zero remote API calls. |
| **SEO, Content & Metadata** | `.github/agents/seo-specialist.yml` | `.github/prompts/seo-specialist.prompt.md` | Four-layer metadata synchronization (`tools.ts`, `seo.ts`, `generate-metadata.mjs`, `sitemap.xml`), URL slug backward-compatibility, automated IndexNow pings, and social media promotion datasets. |

### Tool Integration Skill (`.github/skills/add-new-tool.md`)
Whenever introducing a new financial calculator, refer to `.github/skills/add-new-tool.md` for the mandatory sequential lifecycle:
1. **Define Tool**: Register in `src/data/tools.ts`.
2. **Implement Component**: Build with Enterprise Design System in `src/components/tools/`.
3. **Wire Views & Routing**: Connect in category views and `src/App.tsx`.
4. **Register Slugs**: Add canonical slugs and backward-compatible aliases in `src/lib/urls.ts`.
5. **Add SEO Schemas**: Provide rich features and FAQ structured data in `scripts/generate-metadata.mjs`.
6. **Build & Auto-Sync**: Run `npm run build` (regenerates sitemaps, prerendered HTML, social CSVs, and pings IndexNow).
7. **Type Check**: Validate with `npm run lint`.

---

## Deployment Configuration (Vercel)

The project is pre-configured for Vercel:
- **Root Directory**: Project root (`.`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Security & Headers (`vercel.json`)**: Configured with strict Content Security Policy (CSP), custom 404 routing, and clean URLs.

---

## Search Engine Verification & Monetization

- **IndexNow Key**: `bc8b27f46bbcd43f50a45f870843689d.txt`
- **Bing Webmaster Verification**: Included in `index.html` and `BingSiteAuth.xml`.
- **Yandex Verification**: Included in `index.html`.
- **Google AdSense**:
  - Publisher ID: `pub-7368262160205015`
  - Auto-Ads script and `<meta name="google-adsense-account">` in `<head>`.
  - Authorized digital seller records in `public/ads.txt`.
  - Crawler access enabled for `User-agent: Mediapartners-Google` in `public/robots.txt`.

---

## License

Free and open-source financial calculators. Built with privacy in mind.

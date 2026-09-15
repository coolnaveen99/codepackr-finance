# Skill: Hero Floating Slides & Interactive Preview Cards

This skill documents the architecture, movement physics, graphical chart requirements, and integration guidelines for the **Hero Floating Preview Cards** (`src/components/HeroPreviewCards.tsx`) on **Codepackr Finance** (`finance.codepackr.com`).

---

## 1. Overview & Purpose

The **Hero Floating Preview Cards** sit prominently on the right side of the main landing hero (`src/components/HomeDashboard.tsx` on `lg:` viewports ≥1024px).

### Strategic Goals
1. **Instant Interactive Credibility**: Visitors immediately see live calculations, real financial formulas, and graphic compounding curves before ever clicking a button.
2. **Organic Visual Energy**: Subtle, desynchronized floating animations create a modern, high-craft atmosphere without being distracting.
3. **Rotating Tool Showcase**: Automatically cycles through a diverse pool of financial calculators (Loans, SIPs, Tax, FIRE, Retirement, Business) to drive user discovery.
4. **100% Client-Side & Responsive**: Formats values dynamically to the active global currency (`INR`, `USD`, `EUR`, `GBP`, etc.) and automatically adapts or pauses based on user interaction or accessibility preferences.

---

## 2. Floating Movement Physics & CSS Keyframes

All cards must maintain continuous, gentle vertical floating physics.

### CSS Animation Classes (`src/index.css`)
```css
/* Card 1: 5.4s cycle with 7px elevation */
.animate-float-card-1 {
  animation: floatCard1 5.4s ease-in-out infinite;
}

/* Card 2: 4.8s cycle with 6px elevation */
.animate-float-card-2 {
  animation: floatCard2 4.8s ease-in-out infinite;
}

/* Card 3: 6.2s cycle with 8px elevation */
.animate-float-card-3 {
  animation: floatCard3 6.2s ease-in-out infinite;
}
```

### Staggered Slot Offsets
To create an asymmetrical, cascading glass stack, the cards utilize horizontal margin shifts:
- **Slot 0**: `ml-4` (slightly indented from the left)
- **Slot 1**: `mr-2` (shifted slightly to the right)
- **Slot 2**: `ml-6` (indented deeper to ground the stack)

### Interaction Rules
1. **Pause on Hover**: Hovering over any card pauses both the CSS floating animation and the rotation interval so the user can easily read and click.
2. **Hover Elevation**: On hover, the card scales gently (`hover:scale-[1.035]`), elevates its shadow (`hover:shadow-2xl hover:shadow-emerald-500/20`), and highlights its border (`hover:border-emerald-500`).
3. **Reduced Motion Accessibility**: If the user has `prefers-reduced-motion: reduce` enabled, floating animations and automatic rotation are completely disabled.
4. **Mobile & Tablet Constraint**: Strictly hidden on viewports `< 1024px` (`hidden lg:flex`) to preserve clean single-column mobile UX.

---

## 3. Mandatory Graphical Chart Requirement

**RULE: Plain text ads are strictly prohibited.** Every tool card inside the rotating pool MUST incorporate an authentic, animated mini graphical chart or visual meter.

### Supported Mini Graphical Components (`src/components/HeroPreviewCards.tsx`)

#### 1. MiniSparkline (SVG Upward/Downward Area Curves)
Used for compounding growth, annuities, dividend flows, debt payoff curves, or inflation depreciation.
```tsx
<MiniSparkline
  id="sip"
  strokeColor="#14b8a6"
  gradientColor="#14b8a6"
  pathD="M0 29 Q 60 27, 110 17 T 200 3"
  areaD="M0 29 Q 60 27, 110 17 T 200 3 L 200 32 L 0 32 Z"
  height={32}
/>
```
- Includes animated SVG path drawing (`animate-draw-line`) and gradient fill fade (`animate-fade-chart-area`).

#### 2. MiniSegmentedBar (Proportion / Balance Breakdown)
Used for comparing two or more proportional components (e.g., Principal vs. Interest, Take-Home vs. Tax vs. EPF, Assets vs. Debt).
```tsx
<MiniSegmentedBar
  segments={[
    { width: '68%', color: 'bg-emerald-500', label: '68% Principal', dotColor: 'bg-emerald-500' },
    { width: '32%', color: 'bg-amber-400', label: '32% Interest', dotColor: 'bg-amber-400' },
  ]}
/>
```

#### 3. MiniProgressRing (Circular Radial SVG Dial)
Used for percentage milestones, readiness scores, or financial health thresholds (e.g., FIRE readiness, Emergency fund runway, DTI ratio).
```tsx
<MiniProgressRing
  percent={78}
  strokeColor="stroke-purple-500"
  label="FIRE"
  size={36}
/>
```
- Includes animated `stroke-dashoffset` transition with a high-contrast central percentage counter.

#### 4. Dual Comparison Horizontal Bars
Used for discrete side-by-side policy or decision comparisons (e.g., New vs. Old Tax Regime, Rent vs. Buy equity comparison).

---

## 4. Rotating Pool Architecture & Lifecycle

### Data Structure (`HeroToolAd`)
```typescript
export type HeroToolAd = {
  id: string;               // Unique card identifier (e.g. 'ad-emi')
  toolId: string;           // Target tool ID from src/data/tools.ts
  title: string;            // Card heading (e.g. 'Home Loan EMI')
  badge: string;            // Metric pill (e.g. '8.5% APR')
  badgeTone: 'emerald' | 'teal' | 'purple' | 'blue' | 'amber';
  icon: LucideIcon;         // Lucide icon component
  body: React.ReactNode;    // Rich mini chart & key numeric figures
  footerLeft: string;       // Context label (e.g. 'Amortization · 100% private')
  cta: string;              // Action text (e.g. 'Calculate EMI')
  accent: 'blue' | 'teal' | 'purple' | 'orange' | 'cyan' | 'emerald';
};
```

### Staggered Rotation Engine
1. **Slots**: Supports 2 or 3 visible slots simultaneously (default: 3).
2. **Staggered Interval**:
   - Slot 0 rotates first at `t = 6.5s`, then every `6.5s`.
   - Slot 1 starts with a 2.2s delay at `t = 8.7s`, then every `6.5s`.
   - Slot 2 starts with a 4.4s delay at `t = 10.9s`, then every `6.5s`.
3. **Anti-Collision Guard**: When rotating a slot, the engine checks all other visible slots and picks the next candidate that is not currently visible on screen.
4. **Smooth Cross-Fade**: When a card rotates, it triggers a 180ms fade-out (`opacity-0 scale-[0.99]`), swaps the dataset, and fades back in (`opacity-100 scale-100`).

---

## 5. Adding a New Calculator Ad to the Pool

When introducing a new financial calculator to Codepackr Finance:

1. **Verify Tool Definition**: Ensure the tool exists in `src/data/tools.ts` with a valid `id`.
2. **Add Entry to `adPool` in `src/components/HeroPreviewCards.tsx`**:
   - Provide domain-specific currency figures adapting to `isINR` (Lakhs/Crores) and `currency.symbol` (e.g. `$400,000`).
   - Select the most appropriate chart component:
     - Growth / Yield / Payoff ➡️ `MiniSparkline`
     - Ratio / Split ➡️ `MiniSegmentedBar`
     - Milestone / Target % ➡️ `MiniProgressRing`
   - Pick a cohesive `badgeTone` and `accent`.
3. **Verify Movement & Build**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
4. **Test in Browser**: Confirm the card appears in rotation with smooth floating animations, interactive hover pause, and responsive layout.

